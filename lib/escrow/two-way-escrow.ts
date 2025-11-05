import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import prisma from '../prisma';

/**
 * Two-Way Escrow Manager
 * 
 * FLOW:
 * 1. Dev creates presale and DEPOSITS TOKENS to platform escrow
 * 2. Investors invest USDC (goes to platform escrow)
 * 3. On success: USDC → Dev Team, Tokens → Investors (AUTOMATED)
 * 4. On failure: USDC → Investors, Tokens → Dev Team (AUTOMATED)
 */

export interface EscrowStatus {
  tokensDeposited: boolean;
  tokenBalance: number;
  requiredTokens: number;
  usdcRaised: number;
  readyToLaunch: boolean;
}

export class TwoWayEscrowManager {
  private connection: Connection;
  private platformKeypair?: Keypair;
  private platformWallet: PublicKey;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Initialize platform keypair
    if (process.env.PLATFORM_WALLET_PRIVATE_KEY) {
      try {
        const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
        let privateKeyArray: number[];
        
        if (privateKey.startsWith('[')) {
          privateKeyArray = JSON.parse(privateKey);
        } else {
          const decoded = Buffer.from(privateKey, 'base64');
          privateKeyArray = Array.from(decoded);
        }
        
        this.platformKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
        this.platformWallet = this.platformKeypair.publicKey;
      } catch (error) {
        console.error('Failed to initialize escrow keypair:', error);
        this.platformWallet = new PublicKey('11111111111111111111111111111111');
      }
    } else {
      this.platformWallet = new PublicKey('11111111111111111111111111111111');
    }
  }

  /**
   * STEP 1: Verify dev has deposited tokens to platform escrow
   * This checks if the dev team sent their tokens to our wallet
   */
  async verifyTokenDeposit(presaleId: string): Promise<EscrowStatus> {
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
      include: {
        investments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!presale) {
      throw new Error('Presale not found');
    }

    if (!presale.tokenAddress) {
      return {
        tokensDeposited: false,
        tokenBalance: 0,
        requiredTokens: 0,
        usdcRaised: presale.currentRaised,
        readyToLaunch: false,
      };
    }

    // Calculate how many tokens are needed for the presale
    const requiredTokens = this.calculateRequiredTokens(
      presale.hardCap,
      presale.tokenPrice || 0.1,
      presale.tokenDecimals
    );

    // Check platform's token balance for this presale token
    const tokenMint = new PublicKey(presale.tokenAddress);
    const platformTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.platformWallet
    );

    try {
      const accountInfo = await getAccount(this.connection, platformTokenAccount);
      const tokenBalance = Number(accountInfo.amount) / Math.pow(10, presale.tokenDecimals);

      const tokensDeposited = tokenBalance >= requiredTokens;

      // Update presale status based on token deposit
      if (tokensDeposited && presale.status === 'PENDING') {
        await prisma.presale.update({
          where: { id: presaleId },
          data: { status: 'ACTIVE' }, // Auto-approve once tokens deposited
        });
      }

      return {
        tokensDeposited,
        tokenBalance,
        requiredTokens,
        usdcRaised: presale.currentRaised,
        readyToLaunch: tokensDeposited,
      };
    } catch (error) {
      console.error('Token account not found or error:', error);
      return {
        tokensDeposited: false,
        tokenBalance: 0,
        requiredTokens,
        usdcRaised: presale.currentRaised,
        readyToLaunch: false,
      };
    }
  }

  /**
   * STEP 2: Calculate how many tokens needed for presale
   */
  private calculateRequiredTokens(
    hardCap: number,
    tokenPrice: number,
    decimals: number
  ): number {
    // hardCap = $100,000, tokenPrice = $0.10
    // Required tokens = 100,000 / 0.10 = 1,000,000 tokens
    return hardCap / tokenPrice;
  }

  /**
   * STEP 3: AUTOMATED - Execute two-way swap when presale succeeds
   * USDC → Dev Team
   * Tokens → Investors
   */
  async executeSuccessfulPresaleSwap(presaleId: string): Promise<{
    success: boolean;
    usdcReleased: boolean;
    tokensDistributed: number;
    failed: number;
  }> {
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
      include: {
        investments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!presale) {
      throw new Error('Presale not found');
    }

    if (presale.status !== 'FUNDED') {
      throw new Error('Presale must be FUNDED to execute swap');
    }

    if (!this.platformKeypair) {
      throw new Error('Platform keypair not configured');
    }

    // PART 1: Release USDC to dev team (minus platform fee)
    const platformFee = presale.currentRaised * 0.025; // 2.5% fee
    const devAmount = presale.currentRaised - platformFee;

    console.log(`💰 Releasing ${devAmount} USDC to dev team...`);
    
    // PRODUCTION: Transfer actual USDC on Solana
    const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
    const platformUSDCAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.platformWallet
    );
    
    const devWallet = new PublicKey(presale.teamWallet);
    const devUSDCAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      devWallet
    );

    // Convert to USDC smallest unit (6 decimals for USDC)
    const devAmountRaw = BigInt(Math.floor(devAmount * 1_000_000));

    const usdcTransaction = new Transaction().add(
      createTransferInstruction(
        platformUSDCAccount,
        devUSDCAccount,
        this.platformWallet,
        devAmountRaw,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const usdcSignature = await this.connection.sendTransaction(
      usdcTransaction,
      [this.platformKeypair]
    );

    await this.connection.confirmTransaction(usdcSignature);

    // Record USDC release
    await prisma.escrowTransaction.create({
      data: {
        presaleId: presale.id,
        type: 'RELEASE',
        amount: devAmount,
        fromWallet: this.platformWallet.toBase58(),
        toWallet: presale.teamWallet,
        transactionHash: usdcSignature,
      },
    });

    console.log(`✅ Released ${devAmount} USDC to dev team: ${usdcSignature}`);

    // PART 2: Distribute tokens to all investors AUTOMATICALLY
    let distributedCount = 0;
    let failedCount = 0;
    const tokenMint = new PublicKey(presale.tokenAddress!);
    const platformTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.platformWallet
    );

    for (const investment of presale.investments) {
      try {
        // Calculate tokens for this investor
        const tokenAmount = this.calculateTokenAmount(
          investment.amount,
          presale.tokenPrice || 0.1,
          presale.tokenDecimals
        );

        // Get investor's token account
        const investorWallet = new PublicKey(investment.investorWallet);
        const investorTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          investorWallet
        );

        // Transfer tokens
        const transaction = new Transaction().add(
          createTransferInstruction(
            platformTokenAccount,
            investorTokenAccount,
            this.platformWallet,
            tokenAmount,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const signature = await this.connection.sendTransaction(
          transaction,
          [this.platformKeypair]
        );

        await this.connection.confirmTransaction(signature);

        // Update investment
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            status: 'CLAIMED',
            claimedAt: new Date(),
            claimTxHash: signature,
          },
        });

        // Record distribution
        await prisma.tokenDistribution.create({
          data: {
            investmentId: investment.id,
            tokenAmount: Number(tokenAmount) / Math.pow(10, presale.tokenDecimals),
            transactionHash: signature,
          },
        });

        distributedCount++;
        console.log(`✅ Distributed ${tokenAmount} tokens to ${investment.investorWallet}`);
      } catch (error) {
        console.error(`❌ Failed to distribute to ${investment.investorWallet}:`, error);
        failedCount++;
      }
    }

    // Update presale to COMPLETED
    await prisma.presale.update({
      where: { id: presaleId },
      data: { status: 'COMPLETED' },
    });

    return {
      success: true,
      usdcReleased: true,
      tokensDistributed: distributedCount,
      failed: failedCount,
    };
  }

  /**
   * STEP 4: AUTOMATED - Handle failed presale
   * USDC → Refund Investors
   * Tokens → Return to Dev Team
   */
  async executeFailedPresaleRefund(presaleId: string): Promise<{
    success: boolean;
    investorsRefunded: number;
    tokensReturnedToDev: boolean;
  }> {
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
      include: {
        investments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!presale) {
      throw new Error('Presale not found');
    }

    if (!this.platformKeypair) {
      throw new Error('Platform keypair not configured');
    }

    // PART 1: Refund USDC to all investors
    let refundedCount = 0;
    const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
    const platformUSDCAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      this.platformWallet
    );
    
    for (const investment of presale.investments) {
      try {
        console.log(`💸 Refunding ${investment.amount} USDC to ${investment.investorWallet}`);
        
        // PRODUCTION: Transfer actual USDC back to investor
        const investorWallet = new PublicKey(investment.investorWallet);
        const investorUSDCAccount = await getAssociatedTokenAddress(
          USDC_MINT,
          investorWallet
        );

        // Convert to USDC smallest unit (6 decimals)
        const refundAmountRaw = BigInt(Math.floor(investment.amount * 1_000_000));

        const refundTransaction = new Transaction().add(
          createTransferInstruction(
            platformUSDCAccount,
            investorUSDCAccount,
            this.platformWallet,
            refundAmountRaw,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const refundSignature = await this.connection.sendTransaction(
          refundTransaction,
          [this.platformKeypair]
        );

        await this.connection.confirmTransaction(refundSignature);
        
        // Update investment record
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
            refundTxHash: refundSignature,
          },
        });

        // Record refund transaction
        await prisma.escrowTransaction.create({
          data: {
            presaleId: presale.id,
            type: 'REFUND',
            amount: investment.amount,
            fromWallet: this.platformWallet.toBase58(),
            toWallet: investment.investorWallet,
            transactionHash: refundSignature,
          },
        });

        refundedCount++;
        console.log(`✅ Refunded ${investment.amount} USDC: ${refundSignature}`);
      } catch (error) {
        console.error(`❌ Failed to refund ${investment.investorWallet}:`, error);
      }
    }

    // PART 2: Return tokens to dev team
    if (presale.tokenAddress) {
      try {
        const tokenMint = new PublicKey(presale.tokenAddress);
        const platformTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          this.platformWallet
        );
        
        const devWallet = new PublicKey(presale.teamWallet);
        const devTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          devWallet
        );

        // Get all tokens in platform account
        const accountInfo = await getAccount(this.connection, platformTokenAccount);
        const tokensToReturn = accountInfo.amount;

        // Return all tokens to dev team
        const transaction = new Transaction().add(
          createTransferInstruction(
            platformTokenAccount,
            devTokenAccount,
            this.platformWallet,
            tokensToReturn,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const signature = await this.connection.sendTransaction(
          transaction,
          [this.platformKeypair]
        );

        await this.connection.confirmTransaction(signature);

        console.log(`✅ Returned tokens to dev team: ${signature}`);
      } catch (error) {
        console.error('❌ Failed to return tokens to dev:', error);
      }
    }

    // Mark presale as failed
    await prisma.presale.update({
      where: { id: presaleId },
      data: { status: 'FAILED' },
    });

    return {
      success: true,
      investorsRefunded: refundedCount,
      tokensReturnedToDev: true,
    };
  }

  /**
   * Helper: Calculate token amount
   */
  private calculateTokenAmount(
    usdcAmount: number,
    tokenPrice: number,
    decimals: number
  ): bigint {
    const rawTokenAmount = usdcAmount / tokenPrice;
    return BigInt(Math.floor(rawTokenAmount * Math.pow(10, decimals)));
  }

  /**
   * Get presale deposit address for dev team
   */
  async getTokenDepositAddress(presaleId: string): Promise<{
    address: string;
    requiredTokens: number;
    instructions: string;
  }> {
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
    });

    if (!presale) {
      throw new Error('Presale not found');
    }

    const requiredTokens = this.calculateRequiredTokens(
      presale.hardCap,
      presale.tokenPrice || 0.1,
      presale.tokenDecimals
    );

    return {
      address: this.platformWallet.toBase58(),
      requiredTokens,
      instructions: `
Send exactly ${requiredTokens.toLocaleString()} ${presale.ticker} tokens to:

${this.platformWallet.toBase58()}

Once tokens are received, your presale will be automatically approved and go ACTIVE.
      `.trim(),
    };
  }
}

// Export singleton
export const twoWayEscrow = new TwoWayEscrowManager(
  process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
);

