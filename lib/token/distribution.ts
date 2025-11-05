import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import prisma from '../prisma';

export interface TokenDistributionConfig {
  presaleId: string;
  tokenMintAddress: string;
  tokenDecimals: number;
}

/**
 * Token Distribution Manager
 * Handles automatic distribution of presale tokens to investors when presale succeeds
 */
export class TokenDistributor {
  private connection: Connection;
  private platformKeypair?: Keypair;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Initialize platform keypair for signing transactions
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
      } catch (error) {
        console.error('Failed to initialize token distributor keypair:', error);
      }
    }
  }

  /**
   * Distribute tokens to all investors when presale succeeds
   */
  async distributeTokens(config: TokenDistributionConfig): Promise<{
    success: boolean;
    distributed: number;
    failed: number;
    transactions: string[];
  }> {
    const { presaleId, tokenMintAddress, tokenDecimals } = config;

    // 1. Get presale and verify it's successful
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
      throw new Error('Presale must be FUNDED to distribute tokens');
    }

    // 2. Calculate token allocation per investor
    const tokenMint = new PublicKey(tokenMintAddress);
    const platformTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      this.platformKeypair!.publicKey
    );

    let distributedCount = 0;
    let failedCount = 0;
    const transactions: string[] = [];

    // 3. Distribute to each investor
    for (const investment of presale.investments) {
      try {
        // Calculate token amount based on investment
        // Example: If investor invested $100 and token price is $0.10, they get 1000 tokens
        const tokenAmount = this.calculateTokenAmount(
          investment.amount,
          presale.tokenPrice || 0.1, // Use presale's token price
          tokenDecimals
        );

        // Get or create investor's token account
        const investorWallet = new PublicKey(investment.investorWallet);
        const investorTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          investorWallet
        );

        // Check if investor's token account exists
        const accountInfo = await this.connection.getAccountInfo(investorTokenAccount);
        const transaction = new Transaction();

        if (!accountInfo) {
          // Create associated token account for investor
          transaction.add(
            createAssociatedTokenAccountInstruction(
              this.platformKeypair!.publicKey, // payer
              investorTokenAccount,             // associated token account
              investorWallet,                   // owner
              tokenMint,                        // mint
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        // Transfer tokens to investor
        transaction.add(
          createTransferInstruction(
            platformTokenAccount,     // source
            investorTokenAccount,     // destination
            this.platformKeypair!.publicKey, // owner
            tokenAmount,              // amount
            [],                       // multisigners
            TOKEN_PROGRAM_ID
          )
        );

        // Send transaction
        const signature = await this.connection.sendTransaction(
          transaction,
          [this.platformKeypair!]
        );

        await this.connection.confirmTransaction(signature);

        // Update investment status
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            status: 'CLAIMED',
            claimedAt: new Date(),
          },
        });

        // Record distribution
        await prisma.tokenDistribution.create({
          data: {
            investmentId: investment.id,
            tokenAmount: Number(tokenAmount),
            transactionHash: signature,
          },
        });

        transactions.push(signature);
        distributedCount++;

        console.log(`✅ Distributed ${tokenAmount} tokens to ${investment.investorWallet}`);
      } catch (error) {
        console.error(`❌ Failed to distribute to ${investment.investorWallet}:`, error);
        failedCount++;
      }
    }

    // Update presale status to COMPLETED
    await prisma.presale.update({
      where: { id: presaleId },
      data: { status: 'COMPLETED' },
    });

    return {
      success: true,
      distributed: distributedCount,
      failed: failedCount,
      transactions,
    };
  }

  /**
   * Calculate token amount based on USDC investment and token price
   */
  private calculateTokenAmount(
    usdcAmount: number,
    tokenPrice: number,
    decimals: number
  ): bigint {
    // Example: $100 USDC / $0.10 per token = 1000 tokens
    const rawTokenAmount = usdcAmount / tokenPrice;
    
    // Convert to smallest unit (accounting for decimals)
    // For 9 decimals: 1000 tokens = 1000 * 10^9
    return BigInt(Math.floor(rawTokenAmount * Math.pow(10, decimals)));
  }

  /**
   * Check if investor has claimed their tokens
   */
  async hasClaimedTokens(investmentId: string): Promise<boolean> {
    const distribution = await prisma.tokenDistribution.findFirst({
      where: { investmentId },
    });

    return distribution !== null;
  }

  /**
   * Get distribution details for an investment
   */
  async getDistributionDetails(investmentId: string) {
    return await prisma.tokenDistribution.findFirst({
      where: { investmentId },
      include: {
        investment: {
          include: {
            presale: true,
          },
        },
      },
    });
  }
}

// Export singleton instance
export const tokenDistributor = new TokenDistributor(
  process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
);







