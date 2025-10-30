# Solana Mainnet Deployment Guide

Complete guide for deploying the x402 presale platform on **Solana Mainnet**.

## 🚨 Important Warnings

**THIS IS MAINNET - REAL MONEY!**

- All transactions use real SOL and USDC
- Test thoroughly on devnet first
- Keep private keys absolutely secure
- Have proper backups
- Use hardware wallet for large amounts
- Consider insurance and security audits

## 🔧 Mainnet Configuration

### 1. Environment Setup

Use the mainnet configuration file:

```bash
# Copy mainnet config
cp .env.solana-mainnet .env

# Edit with your values
nano .env
```

Required environment variables:

```env
# Solana Mainnet
NETWORK="mainnet-beta"
RPC_URL="https://api.mainnet-beta.solana.com"

# Platform Wallet - YOUR MAINNET WALLET
PLATFORM_WALLET_ADDRESS="YourMainnetSolanaAddress"
PLATFORM_WALLET_PRIVATE_KEY="[1,2,3,...]"

# x402 - Solana
X402_FACILITATOR_URL="https://facilitator.payai.network"
PAYMENT_NETWORK="solana"
PAYMENT_TOKEN="USDC"

# Production settings
NEXT_PUBLIC_APP_URL="https://yourapp.com"
NEXT_PUBLIC_NETWORK="mainnet-beta"
```

### 2. Wallet Setup (Mainnet)

**Option A: Generate New Wallet (Recommended for Platform)**

```bash
# Generate mainnet wallet
node scripts/generate-wallet.js

# Save the output securely!
# Store in password manager or hardware security module
```

**Option B: Import Existing Wallet**

```bash
# If you have existing Solana wallet
# Export from Phantom/Solflare as JSON
# Convert to array format for .env
```

**Fund the Wallet:**

```bash
# Send SOL for transaction fees
# Minimum: 0.5 SOL recommended
# More if expecting high volume

# Send from exchange or another wallet to:
# PLATFORM_WALLET_ADDRESS
```

### 3. RPC Provider (Important!)

**Free RPC (May be slow):**
```env
RPC_URL="https://api.mainnet-beta.solana.com"
```

**Recommended Paid RPC Providers:**

**QuickNode** (Recommended)
```env
RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/your-key/"
```
- Sign up: https://www.quicknode.com/
- Better performance and reliability
- ~$49/month for starter plan

**Helius**
```env
RPC_URL="https://mainnet.helius-rpc.com/?api-key=your-key"
```
- Sign up: https://helius.dev/
- Free tier available
- Great for high-volume

**Alchemy**
```env
RPC_URL="https://solana-mainnet.g.alchemy.com/v2/your-key"
```
- Sign up: https://www.alchemy.com/
- Reliable and fast

### 4. USDC on Solana

**USDC Contract Address (Mainnet):**
```
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

**Key Information:**
- USDC is SPL token on Solana
- Investors need USDC in their Solana wallet
- Investors also need small amount of SOL for fees
- Platform receives USDC payments

### 5. Database Setup (Production)

**Use Managed PostgreSQL:**

**Supabase:**
```bash
# Free tier available
# https://supabase.com/
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

**Railway:**
```bash
# https://railway.app/
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

**Run Migrations:**
```bash
npx prisma migrate deploy
```

## 🚀 Deployment Steps

### 1. Pre-Deployment Checklist

- [ ] Tested everything on devnet
- [ ] Created mainnet wallet
- [ ] Funded wallet with SOL (0.5+ SOL)
- [ ] Set up production database
- [ ] Configured RPC provider
- [ ] Set strong admin password
- [ ] Prepared domain name
- [ ] SSL certificate ready

### 2. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Set Environment Variables in Vercel Dashboard:**
1. Go to Project Settings
2. Add all environment variables from `.env`
3. Mark `PLATFORM_WALLET_PRIVATE_KEY` as sensitive
4. Deploy

### 3. DNS Configuration

Point your domain to Vercel:
```
A Record: 76.76.21.21
CNAME: cname.vercel-dns.com
```

### 4. SSL/HTTPS

Vercel provides automatic SSL. Just ensure:
- Domain is verified
- DNS is configured
- Wait for propagation (5-15 minutes)

## 🔐 Security Best Practices

### Wallet Security

**Critical:**
1. **Never commit private keys to git**
2. **Use environment variables only**
3. **Backup private key in multiple secure locations:**
   - Password manager (1Password, Bitwarden)
   - Hardware security key
   - Safe deposit box (paper backup)

**Access Control:**
```bash
# Limit who has access to:
# - Database credentials
# - Platform wallet private key
# - Admin password
# - Vercel/hosting account
```

**Multi-sig (Advanced):**
- Consider using Squads Protocol for multi-sig
- Requires multiple signatures for large transactions
- Added security layer

### Platform Security

**Admin Authentication:**
```env
# Use strong password
ADMIN_PASSWORD="Use-A-Very-Strong-Password-Here-123!"

# Rotate regularly
# Use password manager to generate
```

**Rate Limiting:**
```typescript
// Add to API routes
// Implement rate limiting to prevent abuse
// Use Vercel's built-in rate limiting or upstash
```

**Monitoring:**
- Set up error tracking (Sentry)
- Monitor wallet balance
- Alert on unusual activity
- Track failed transactions

## 💰 Financial Considerations

### Platform Costs

**Monthly Operating Costs:**
- RPC Provider: $0-$99/month
- Database: $0-$25/month
- Hosting: $0-$20/month
- Domain: ~$12/year
- **Total: ~$25-$144/month**

### Revenue Model

**Platform Fees:**
- Presale creation: $100 USDC
- Successful presale: 2.5% of raised amount

**Example:**
- 10 presales created/month: $1,000
- 5 presales succeed, avg $50K raised: $6,250
- **Monthly revenue: ~$7,250**

### Transaction Fees

**Solana Fees:**
- ~0.000005 SOL per transaction
- Very low compared to Ethereum
- Budget ~0.1 SOL/month for moderate volume

## 📊 Monitoring & Maintenance

### Wallet Monitoring

**Check Balance Regularly:**
```bash
solana balance <PLATFORM_WALLET_ADDRESS> --url mainnet-beta
```

**Set Up Alerts:**
```typescript
// Add to cron job or monitoring service
// Alert if balance < 0.1 SOL
// Alert if balance > expected (security)
```

### Database Backups

```bash
# Automated daily backups
# Test restore procedure monthly
# Keep backups for 30 days
```

### Platform Health

**Monitor:**
- API response times
- Failed transactions rate
- User errors
- Wallet balance
- Database connections

**Tools:**
- Vercel Analytics
- Sentry for errors
- Custom dashboard at `/admin`

## 🧪 Testing on Mainnet

### Pre-Launch Testing

**Test Presale Creation:**
1. Create test presale with small amount
2. Pay $100 USDC creation fee
3. Verify presale appears correctly
4. Admin approval workflow

**Test Investment:**
1. Invest small amount (e.g., $10)
2. Verify payment flow
3. Check escrow received funds
4. Verify investment recorded

**Test Refunds:**
1. Create presale that will fail
2. Make test investment
3. Trigger refund
4. Verify funds returned

### Beta Launch

1. **Soft launch** with selected projects
2. Monitor closely for issues
3. Gather feedback
4. Fix any bugs
5. **Public launch** when confident

## 🆘 Troubleshooting

### Common Issues

**Issue: Transactions Failing**
```bash
# Check SOL balance
solana balance <wallet> --url mainnet-beta

# If low, send more SOL
# Minimum 0.1 SOL recommended
```

**Issue: RPC Rate Limiting**
```bash
# Free RPC may rate limit
# Solution: Upgrade to paid RPC provider
```

**Issue: Payment Verification Fails**
```bash
# Check facilitator.payai.network is responding
# Verify transaction hash is correct
# Check network (must be "solana")
```

**Issue: Escrow Balance Mismatch**
```bash
# Check EscrowTransaction records
# Verify on-chain balance
# Reconcile any discrepancies
```

## 📞 Support Resources

**Solana:**
- Docs: https://docs.solana.com/
- Discord: https://discord.gg/solana
- Forum: https://solana.stackexchange.com/

**x402:**
- Docs: https://docs.cdp.coinbase.com/x402/
- facilitator.payai.network support

**Platform Issues:**
- Check logs in Vercel
- Review database records
- Check wallet transactions on Solscan

## 🎯 Launch Checklist

Pre-Launch:
- [ ] All tests pass on devnet
- [ ] Mainnet wallet created and funded
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] RPC provider set up
- [ ] Admin password set
- [ ] Domain configured
- [ ] SSL active

Launch:
- [ ] Deploy to production
- [ ] Test presale creation
- [ ] Test investment flow
- [ ] Test admin panel
- [ ] Monitor for errors
- [ ] Announce launch

Post-Launch:
- [ ] Monitor wallet balance
- [ ] Track error rates
- [ ] Collect user feedback
- [ ] Regular backups
- [ ] Security reviews

## 🚀 You're Ready!

Your x402 presale platform is now configured for **Solana Mainnet**. 

Remember:
- ✅ Test thoroughly first
- ✅ Start small
- ✅ Monitor closely
- ✅ Scale gradually

Good luck with your launch! 🎉

