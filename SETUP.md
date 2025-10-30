# x402 Presale Platform Setup Guide

Complete guide to set up and deploy your presale platform.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Database Configuration](#database-configuration)
3. [Wallet Setup](#wallet-setup)
4. [x402 Integration](#x402-integration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/presale_platform"

# Network (devnet for testing)
NETWORK="devnet"
RPC_URL="https://api.devnet.solana.com"

# Platform Wallet
PLATFORM_WALLET_PRIVATE_KEY=""
PLATFORM_WALLET_ADDRESS=""

# x402
X402_FACILITATOR_URL="https://x402-facilitator.coinbase.com"
X402_API_KEY=""
PAYMENT_NETWORK="base"
PAYMENT_TOKEN="USDC"

# Admin
ADMIN_PASSWORD="changeme"
JWT_SECRET="random-secret-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_NETWORK="devnet"
```

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Database Configuration

### PostgreSQL Setup

**Local PostgreSQL:**

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start  # Ubuntu

# Create database
createdb presale_platform
```

**Or use Supabase (free):**

1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Use in DATABASE_URL

### Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database in browser
npx prisma studio
```

## Wallet Setup

### Generate Platform Wallet

**Option 1: Using Solana CLI**

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Generate keypair
solana-keygen new --outfile platform-wallet.json

# Get address
solana-keygen pubkey platform-wallet.json

# Convert to array for .env
cat platform-wallet.json
```

**Option 2: Using Script**

Create `scripts/generate-wallet.js`:

```javascript
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');

const keypair = Keypair.generate();
const privateKey = Array.from(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

console.log('Public Key:', publicKey);
console.log('Private Key Array:', JSON.stringify(privateKey));

// Save to file
fs.writeFileSync('platform-wallet.json', JSON.stringify(privateKey));
```

Run: `node scripts/generate-wallet.js`

### Fund Wallet (Devnet)

```bash
# Airdrop SOL (devnet only)
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```

### Configure Environment

```env
PLATFORM_WALLET_PRIVATE_KEY="[32,54,76,...]"
PLATFORM_WALLET_ADDRESS="your-public-key-here"
```

## x402 Integration

### 1. Get x402 Credentials

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create account/login
3. Create new project
4. Enable x402 API
5. Get API key and facilitator URL

### 2. Configure x402

```env
X402_FACILITATOR_URL="https://x402-facilitator.coinbase.com"
X402_API_KEY="your-api-key-here"
PAYMENT_NETWORK="base"  # or "solana", "ethereum", etc.
PAYMENT_TOKEN="USDC"
```

### 3. Test x402 Integration

Create test file `tests/x402.test.ts`:

```typescript
import { x402Client } from '@/lib/x402/client';

async function testX402() {
  // Generate payment instructions
  const instructions = await x402Client.generatePaymentInstructions(
    'test-presale-id',
    100,
    'recipient-wallet-address'
  );
  
  console.log('Payment Instructions:', instructions);
}

testX402();
```

Run: `npx ts-node tests/x402.test.ts`

## Testing

### Unit Tests

```bash
npm run test
```

### Manual Testing Flow

1. **Create Presale:**
   - Go to `/create`
   - Fill in project details
   - Submit presale

2. **Admin Approval:**
   - Go to `/admin` (password: your ADMIN_PASSWORD)
   - Change status from DRAFT to ACTIVE

3. **Make Investment:**
   - Go to presale page
   - Connect wallet
   - Enter investment amount
   - Complete x402 payment

4. **Check Dashboard:**
   - Go to `/dashboard`
   - View your investments

### Test with Mock Data

Create seed file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test presale
  const presale = await prisma.presale.create({
    data: {
      projectName: 'Test Token',
      ticker: 'TEST',
      description: 'A test token presale',
      teamName: 'Test Team',
      teamWallet: 'test-wallet-address',
      hardCap: 100000,
      minInvestment: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalSupply: '1000000000',
      presaleAllocation: 40,
      tokenomicsType: 'FAIR_LAUNCH',
      tokenDecimals: 9,
      status: 'ACTIVE',
      featured: true,
    },
  });

  console.log('Created test presale:', presale);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `npx ts-node prisma/seed.ts`

## Production Deployment

### 1. Choose Hosting Platform

**Recommended Options:**
- Vercel (easiest for Next.js)
- Railway
- Render
- AWS/GCP/Azure

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### 3. Database (Production)

Use managed PostgreSQL:
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Heroku Postgres**
- **AWS RDS**

### 4. Environment Variables

Set in hosting platform:

```env
DATABASE_URL="your-production-db-url"
NETWORK="mainnet-beta"  # or "mainnet" for Base
RPC_URL="your-rpc-url"
PLATFORM_WALLET_PRIVATE_KEY="[...]"
PLATFORM_WALLET_ADDRESS="..."
X402_FACILITATOR_URL="..."
X402_API_KEY="..."
PAYMENT_NETWORK="base"
PAYMENT_TOKEN="USDC"
ADMIN_PASSWORD="secure-password"
JWT_SECRET="secure-random-string"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_NETWORK="mainnet"
```

### 5. Security Checklist

- [ ] Use strong ADMIN_PASSWORD
- [ ] Secure PLATFORM_WALLET_PRIVATE_KEY (use secrets manager)
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Configure logging

### 6. Post-Deployment

1. **Test all flows:**
   - Create presale
   - Make investment
   - Admin approval
   - Refund process

2. **Monitor:**
   - Set up error tracking (Sentry)
   - Monitor escrow wallet balance
   - Track transaction success rate

3. **Backup:**
   - Database backups
   - Wallet backup (CRITICAL)

### 7. Mainnet Considerations

**Before launching on mainnet:**

- [ ] Audit smart contracts
- [ ] Test escrow logic thoroughly
- [ ] Verify x402 integration
- [ ] Legal compliance (KYC/AML if needed)
- [ ] Insurance/security measures
- [ ] Customer support system
- [ ] Terms of service & privacy policy

### 8. Scaling

As platform grows:

- Use CDN for static assets
- Implement caching (Redis)
- Database connection pooling
- Load balancing
- Background job queue
- Real-time updates (WebSockets)

## Troubleshooting

### Common Issues

**Database connection fails:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string format
postgresql://user:password@host:5432/database
```

**Wallet errors:**
```bash
# Verify wallet has SOL for fees
solana balance <address> --url devnet

# Check RPC connection
curl <RPC_URL> -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1, "method":"getHealth"}'
```

**x402 verification fails:**
- Check API key is valid
- Verify network matches
- Check facilitator URL

## Support

Need help?
- Check documentation
- Open GitHub issue
- Join [CDP Discord](https://discord.gg/cdp)

---

Happy building! 🚀

