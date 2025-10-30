import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import prisma from '../prisma';

export interface EscrowConfig {
  platformWallet: string;
  rpcUrl: string;
  network: string;
}

/**
 * Escrow manager for handling presale funds on Solana
 * Holds funds until presale conditions are met
 */
export class EscrowManager {
  private connection: Connection;
  private platformWallet: PublicKey;
  private platformKeypair?: Keypair;

  constructor(config: EscrowConfig) {
    // Use Solana mainnet-beta or devnet
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    
    // Handle platform wallet initialization safely
    try {
      if (config.platformWallet) {
        this.platformWallet = new PublicKey(config.platformWallet);
      } else {
        // Dummy wallet for build time
        this.platformWallet = new PublicKey('11111111111111111111111111111111');
      }
    } catch (error) {
      // Fallback to system program ID if invalid
      this.platformWallet = new PublicKey('11111111111111111111111111111111');
    }
    
    // Initialize keypair from env if available (for signing transactions)
    if (process.env.PLATFORM_WALLET_PRIVATE_KEY) {
      try {
        const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
        let privateKeyArray: number[];
        
        // Check if it's Base64 encoded or JSON array
        if (privateKey.startsWith('[')) {
          // JSON array format
          privateKeyArray = JSON.parse(privateKey);
        } else {
          // Base64 format (default)
          const decoded = Buffer.from(privateKey, 'base64');
          privateKeyArray = Array.from(decoded);
        }
        
        this.platformKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      } catch (error) {
        console.error('Failed to initialize platform keypair:', error);
        // Don't throw during build time - keypair is only needed at runtime for transactions
      }
    }
  }

  /**
   * Verify that funds are held in escrow for a presale
   */
  async verifyEscrowBalance(presaleId: string): Promise<{
    balance: number;
    expectedBalance: number;
    discrepancy: number;
  }> {
    // Get presale data
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

    // Calculate expected balance from confirmed investments
    const expectedBalance = presale.investments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    // Get actual balance from escrow wallet
    // Note: This is simplified - in production, you'd track by presale-specific addresses
    const balance = await this.connection.getBalance(this.platformWallet);
    const balanceInUSDC = balance / 1e9; // Convert lamports to SOL (adjust for USDC)

    return {
      balance: balanceInUSDC,
      expectedBalance,
      discrepancy: balanceInUSDC - expectedBalance,
    };
  }

  /**
   * Release funds to project team when presale succeeds
   */
  async releaseFunds(
    presaleId: string,
    milestoneId?: string
  ): Promise<{
    success: boolean;
    transactionHash: string;
    amountReleased: number;
  }> {
    const presale = await prisma.presale.findUnique({
      where: { id: presaleId },
      include: {
        milestones: true,
        investments: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!presale) {
      throw new Error('Presale not found');
    }

    // Check if presale is funded
    if (presale.status !== 'FUNDED') {
      throw new Error('Presale has not reached funding goal');
    }

    // Calculate amount to release
    let releasePercentage = 100;
    if (milestoneId) {
      const milestone = presale.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone not found');
      }
      releasePercentage = milestone.percentage;
    }

    const totalAmount = presale.investments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    // Calculate platform fee (2.5% default)
    const settings = await prisma.platformSettings.findFirst();
    const feePercent = settings?.escrowFeePercent || 2.5;
    const platformFee = totalAmount * (feePercent / 100);
    
    const amountToRelease = (totalAmount - platformFee) * (releasePercentage / 100);

    // Create and send transaction
    if (!this.platformKeypair) {
      throw new Error('Platform wallet keypair not configured');
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.platformWallet,
          toPubkey: new PublicKey(presale.teamWallet),
          lamports: Math.floor(amountToRelease * 1e9), // Convert to lamports
        })
      );

      const signature = await this.connection.sendTransaction(
        transaction,
        [this.platformKeypair]
      );

      await this.connection.confirmTransaction(signature);

      // Record transaction
      await prisma.escrowTransaction.create({
        data: {
          presaleId,
          type: 'RELEASE',
          amount: amountToRelease,
          fromWallet: this.platformWallet.toBase58(),
          toWallet: presale.teamWallet,
          transactionHash: signature,
        },
      });

      // Update milestone if applicable
      if (milestoneId) {
        await prisma.milestone.update({
          where: { id: milestoneId },
          data: {
            completed: true,
            completedAt: new Date(),
          },
        });
      }

      return {
        success: true,
        transactionHash: signature,
        amountReleased: amountToRelease,
      };
    } catch (error) {
      console.error('Failed to release funds:', error);
      throw new Error('Failed to release funds from escrow');
    }
  }

  /**
   * Refund investors when presale fails to reach soft cap
   */
  async refundInvestors(presaleId: string): Promise<{
    success: boolean;
    refundCount: number;
    totalRefunded: number;
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

    // Check if presale has failed
    if (presale.status !== 'FAILED') {
      throw new Error('Presale has not failed');
    }

    if (!this.platformKeypair) {
      throw new Error('Platform wallet keypair not configured');
    }

    let refundCount = 0;
    let totalRefunded = 0;

    // Refund each investor
    for (const investment of presale.investments) {
      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.platformWallet,
            toPubkey: new PublicKey(investment.investorWallet),
            lamports: Math.floor(investment.amount * 1e9),
          })
        );

        const signature = await this.connection.sendTransaction(
          transaction,
          [this.platformKeypair]
        );

        await this.connection.confirmTransaction(signature);

        // Update investment status
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
            refundTxHash: signature,
          },
        });

        // Record transaction
        await prisma.escrowTransaction.create({
          data: {
            presaleId,
            type: 'REFUND',
            amount: investment.amount,
            fromWallet: this.platformWallet.toBase58(),
            toWallet: investment.investorWallet,
            transactionHash: signature,
          },
        });

        refundCount++;
        totalRefunded += investment.amount;
      } catch (error) {
        console.error(`Failed to refund investment ${investment.id}:`, error);
        // Continue with other refunds
      }
    }

    return {
      success: true,
      refundCount,
      totalRefunded,
    };
  }

  /**
   * Calculate and collect platform fees
   */
  async collectPlatformFees(presaleId: string): Promise<number> {
    const transactions = await prisma.escrowTransaction.findMany({
      where: {
        presaleId,
        type: 'DEPOSIT',
      },
    });

    const totalDeposits = transactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    const settings = await prisma.platformSettings.findFirst();
    const feePercent = settings?.escrowFeePercent || 2.5;

    return totalDeposits * (feePercent / 100);
  }
}

// Export singleton instance (Solana mainnet-beta)
export const escrowManager = new EscrowManager({
  platformWallet: process.env.PLATFORM_WALLET_ADDRESS || '',
  rpcUrl: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  network: process.env.NETWORK || 'mainnet-beta',
});

