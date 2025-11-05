const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('x402 Presale Platform - Wallet Generator');
console.log('========================================\n');

// Generate new keypair
const keypair = Keypair.generate();
const privateKey = Array.from(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

console.log('Generated new wallet:\n');
console.log('Public Key (Address):');
console.log(publicKey);
console.log('\nPrivate Key Array (for .env):');
console.log(JSON.stringify(privateKey));
console.log('\n');

// Create wallets directory if it doesn't exist
const walletsDir = path.join(__dirname, '..', 'wallets');
if (!fs.existsSync(walletsDir)) {
  fs.mkdirSync(walletsDir);
}

// Save to files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const jsonPath = path.join(walletsDir, `wallet-${timestamp}.json`);
const infoPath = path.join(walletsDir, `wallet-${timestamp}-info.txt`);

fs.writeFileSync(jsonPath, JSON.stringify(privateKey));
fs.writeFileSync(
  infoPath,
  `Generated: ${new Date().toISOString()}\n\n` +
  `Public Key:\n${publicKey}\n\n` +
  `Private Key Array:\n${JSON.stringify(privateKey)}\n\n` +
  `Add to .env file:\n` +
  `PLATFORM_WALLET_ADDRESS="${publicKey}"\n` +
  `PLATFORM_WALLET_PRIVATE_KEY='${JSON.stringify(privateKey)}'`
);

console.log('Files saved:');
console.log(`- ${jsonPath}`);
console.log(`- ${infoPath}`);
console.log('\n⚠️  IMPORTANT: Keep these files secure and never commit them to git!\n');
console.log('Add to your .env file:');
console.log(`PLATFORM_WALLET_ADDRESS="${publicKey}"`);
console.log(`PLATFORM_WALLET_PRIVATE_KEY='${JSON.stringify(privateKey)}'`);
console.log('\n========================================\n');

// Fund instructions
console.log('Next steps:\n');
console.log('1. Add the wallet info to your .env file');
console.log('2. Fund the wallet with SOL/ETH for transaction fees\n');
console.log('For Solana devnet:');
console.log(`   solana airdrop 2 ${publicKey} --url devnet\n`);
console.log('For mainnet, send SOL/ETH from your exchange or wallet');
console.log('\n========================================\n');







