import { 
  Connection, 
  Keypair, 
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

/**
 * Token Factory - Create SPL tokens directly on the platform
 * 
 * This allows dev teams to create their token AS PART of presale creation
 * No need for external services like pump.fun
 */

export interface TokenCreationParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description?: string;
  image?: string;
}

export interface CreatedToken {
  mintAddress: string;
  tokenAccountAddress: string;
  signature: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
  };
}

export class TokenFactory {
  private connection: Connection;
  private platformKeypair: Keypair;

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
      } catch (error) {
        console.error('Failed to initialize token factory:', error);
        throw error;
      }
    } else {
      throw new Error('Platform wallet private key not configured');
    }
  }

  /**
   * Create a new SPL token for a presale
   * The token will be created and all supply minted to platform wallet
   * Then distributed to investors when presale succeeds
   */
  async createToken(params: TokenCreationParams, devWallet: PublicKey): Promise<CreatedToken> {
    // Generate new keypair for the token mint
    const mintKeypair = Keypair.generate();
    
    console.log(`🏭 Creating new token: ${params.symbol}`);
    console.log(`   Mint address: ${mintKeypair.publicKey.toBase58()}`);

    // Calculate rent
    const lamports = await getMinimumBalanceForRentExemptMint(this.connection);

    // Get platform's token account for this mint
    const platformTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      this.platformKeypair.publicKey
    );

    // Calculate total supply with decimals
    const totalSupplyRaw = BigInt(
      Math.floor(params.totalSupply * Math.pow(10, params.decimals))
    );

    // Build transaction
    const transaction = new Transaction();

    // 1. Create mint account
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.platformKeypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // 2. Initialize mint
    transaction.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        params.decimals,
        this.platformKeypair.publicKey, // Mint authority
        this.platformKeypair.publicKey, // Freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // 3. Create associated token account for platform
    transaction.add(
      createAssociatedTokenAccountInstruction(
        this.platformKeypair.publicKey, // Payer
        platformTokenAccount,             // ATA
        this.platformKeypair.publicKey,   // Owner
        mintKeypair.publicKey,            // Mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    // 4. Mint total supply to platform wallet
    transaction.add(
      createMintToInstruction(
        mintKeypair.publicKey,
        platformTokenAccount,
        this.platformKeypair.publicKey,
        totalSupplyRaw,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Send transaction
    const signature = await this.connection.sendTransaction(
      transaction,
      [this.platformKeypair, mintKeypair]
    );

    await this.connection.confirmTransaction(signature);

    console.log(`✅ Token created successfully!`);
    console.log(`   Mint: ${mintKeypair.publicKey.toBase58()}`);
    console.log(`   Supply: ${params.totalSupply} ${params.symbol}`);
    console.log(`   TX: ${signature}`);

    return {
      mintAddress: mintKeypair.publicKey.toBase58(),
      tokenAccountAddress: platformTokenAccount.toBase58(),
      signature,
      metadata: {
        name: params.name,
        symbol: params.symbol,
        decimals: params.decimals,
        totalSupply: params.totalSupply,
      },
    };
  }

  /**
   * Get token info
   */
  async getTokenInfo(mintAddress: string) {
    const mint = new PublicKey(mintAddress);
    const info = await this.connection.getParsedAccountInfo(mint);
    
    return info.value?.data;
  }
}

// Export singleton
export const tokenFactory = new TokenFactory(
  process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
);







