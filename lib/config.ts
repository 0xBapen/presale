// Platform configuration

export const PLATFORM_CONFIG = {
  // Presale creation fee (in USD)
  PRESALE_CREATION_FEE: 100,
  
  // Platform fee percentage on successful presales
  PLATFORM_FEE_PERCENT: 2.5,
  
  // Minimum and maximum presale amounts
  MIN_PRESALE_AMOUNT: 1000,
  MAX_PRESALE_AMOUNT: 1000000,
  
  // Minimum investment per wallet
  MIN_INVESTMENT: 10,
  
  // x402 facilitator
  FACILITATOR_URL: process.env.X402_FACILITATOR_URL || 'https://facilitator.payai.network',
  PAYMENT_NETWORK: process.env.PAYMENT_NETWORK || 'solana',
  PAYMENT_TOKEN: process.env.PAYMENT_TOKEN || 'USDC',
  
  // Platform wallet for fees and escrow (Solana)
  PLATFORM_WALLET: process.env.PLATFORM_WALLET_ADDRESS || '',
  
  // Solana RPC
  RPC_URL: process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
  NETWORK: process.env.NETWORK || 'mainnet-beta',
};

export default PLATFORM_CONFIG;

