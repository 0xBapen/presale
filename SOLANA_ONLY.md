# ⚡ Solana-Only Configuration

This platform is **exclusively built for Solana** - no Base, no Ethereum, **only Solana**.

## Why Solana?

### Speed
- **400ms block time** vs Ethereum's 12 seconds
- **65,000+ TPS capacity** vs Ethereum's 15-30 TPS
- **Instant finality** for better UX

### Cost
- **~$0.00025 per transaction** vs Ethereum's $5-50
- Affordable for all users
- Makes micropayments viable

### Developer Experience
- Simple SPL token standard
- Rich ecosystem
- Active developer community

## Network Configuration

### Mainnet (Production)
```env
NETWORK="mainnet-beta"
RPC_URL="https://api.mainnet-beta.solana.com"
PAYMENT_NETWORK="solana"
X402_FACILITATOR_URL="https://facilitator.payai.network"
PAYMENT_TOKEN="USDC"
```

**USDC on Solana:**
- Token Address: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Standard: SPL Token
- Widely supported across Solana ecosystem

### Devnet (Testing)
```env
NETWORK="devnet"
RPC_URL="https://api.devnet.solana.com"
PAYMENT_NETWORK="solana-devnet"
X402_FACILITATOR_URL="https://facilitator.payai.network"
PAYMENT_TOKEN="USDC"
```

## x402 on Solana

The x402 protocol works seamlessly with Solana:

**Payment Flow:**
1. Client requests resource → Gets 402 Payment Required
2. Payment instructions include Solana wallet address
3. Client sends USDC on Solana network
4. facilitator.payai.network verifies transaction
5. Server grants access

**No API Key Required!**

Unlike some x402 facilitators, `facilitator.payai.network` doesn't require an API key, making integration simpler.

## Wallet Setup

### Generate Solana Wallet

```bash
# Using our script
node scripts/generate-wallet.js

# OR using Solana CLI
solana-keygen new --outfile platform-wallet.json
solana-keygen pubkey platform-wallet.json
```

### Fund Wallet

**Devnet:**
```bash
solana airdrop 2 <YOUR_WALLET> --url devnet
```

**Mainnet:**
```bash
# Send SOL from exchange or another wallet
# Recommended: Keep 0.5-1 SOL for transaction fees
```

## Transaction Costs

**Platform Operations:**
- Presale creation: ~0.000005 SOL
- Investment recording: ~0.000005 SOL
- Fund release: ~0.000005 SOL
- Refund: ~0.000005 SOL per investor

**Example Monthly Costs (100 transactions):**
- Transaction fees: ~0.0005 SOL (~$0.05)
- Extremely affordable!

## RPC Providers

### Free (Good for testing)
```env
RPC_URL="https://api.mainnet-beta.solana.com"
```

### Recommended Paid (Better performance)

**QuickNode** ⭐ Recommended
```env
RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/your-key/"
```
- Cost: ~$49/month
- Fast and reliable
- Good for production

**Helius**
```env
RPC_URL="https://mainnet.helius-rpc.com/?api-key=your-key"
```
- Free tier available
- Great for high-volume

**Alchemy**
```env
RPC_URL="https://solana-mainnet.g.alchemy.com/v2/your-key"
```
- Reliable service
- Good developer tools

## Verification

All transactions can be verified on:
- **Solscan**: https://solscan.io/
- **Solana Explorer**: https://explorer.solana.com/
- **SolanaFM**: https://solana.fm/

Example:
```
https://solscan.io/tx/YOUR_TRANSACTION_HASH
```

## Code References

All Solana-specific code:

**Escrow Management:**
- `lib/x402/escrow.ts` - Uses `@solana/web3.js`
- Handles SOL and USDC transfers
- Manages platform wallet

**Configuration:**
- `lib/config.ts` - Network set to `solana`
- RPC URL points to Solana
- USDC as payment token

**API Routes:**
- `app/api/presales/route.ts` - Presale creation
- `app/api/presales/[id]/invest/route.ts` - Investments
- All use Solana network

## Migration from Other Chains

**Not applicable!** This platform is **Solana-only from the start**.

If you need multi-chain support, you'll need to:
1. Add additional escrow managers per chain
2. Update x402 config to support multiple networks
3. Add chain selection UI
4. Handle different token standards

But for this project: **Solana only**! ⚡

## Benefits Summary

✅ **Lightning fast** - 400ms blocks
✅ **Super cheap** - $0.00025 per tx  
✅ **Instant settlement** - No waiting
✅ **Simple integration** - One blockchain
✅ **Rich ecosystem** - DeFi, wallets, tools
✅ **Low fees** - Affordable for everyone
✅ **High throughput** - Scales with demand
✅ **No API key** - facilitator.payai.network

## Troubleshooting

### "Invalid public key"
```bash
# Make sure wallet address is valid Solana address
# Solana addresses are base58 encoded, ~44 characters
# Example: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### "Insufficient funds"
```bash
# Check SOL balance
solana balance <address> --url mainnet-beta

# Need SOL for transaction fees
# Send from exchange or use Moonpay/Ramp
```

### "Transaction failed"
```bash
# Check transaction on Solscan
# Common issues:
# - Insufficient SOL for fees
# - RPC rate limiting (upgrade to paid)
# - Network congestion (retry)
```

## Production Checklist

- [ ] Using Solana mainnet-beta
- [ ] Secure wallet with backup
- [ ] Funded with SOL (0.5+ SOL)
- [ ] Using paid RPC provider
- [ ] Monitoring wallet balance
- [ ] Verified on Solscan
- [ ] x402 facilitator working
- [ ] USDC payments tested

## Support

**Solana Issues:**
- Docs: https://docs.solana.com/
- Discord: https://discord.gg/solana
- Forum: https://solana.stackexchange.com/

**x402 Issues:**
- Docs: https://docs.cdp.coinbase.com/x402/
- facilitator.payai.network

---

🚀 **Built exclusively for Solana - the fastest blockchain!**







