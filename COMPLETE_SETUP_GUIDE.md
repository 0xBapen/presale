# 🚀 Complete Setup Guide - x402 Presale Platform

Step-by-step guide to set up the platform from scratch.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** database ([Install](https://www.postgresql.org/download/) or use [Supabase](https://supabase.com))
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **Code editor** (VS Code recommended)
- ✅ **Solana wallet** for testing (Phantom or Solflare)

---

## Step 1: Install Node.js

**Check if installed:**
```bash
node --version
npm --version
```

**If not installed:**
- Download from https://nodejs.org/
- Install LTS version (18 or higher)
- Restart terminal after installation

---

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer
# Remember your password!

# After installation, create database:
# Open "SQL Shell (psql)"
CREATE DATABASE presale_platform;
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
createdb presale_platform
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql
sudo systemctl start postgresql
createdb presale_platform
```

### Option B: Supabase (Recommended - Free & Easy)

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Name: `presale-platform`
   - Database Password: (generate strong password)
   - Region: Choose closest to you
5. Wait for setup (~2 minutes)
6. Go to Settings → Database
7. Copy "Connection string" under "URI"
8. Save it - you'll need this for `.env`

---

## Step 3: Navigate to Project

```bash
# Open terminal/command prompt
cd presale-platform
```

---

## Step 4: Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

---

## Step 5: Generate Solana Wallet

**Generate new wallet for platform escrow:**

```bash
node scripts/generate-wallet.js
```

**Output will look like:**
```
Public Key (Address):
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

Private Key Array (for .env):
[123,45,67,89,...]
```

**⚠️ IMPORTANT:**
- Save both public key and private key array
- Keep private key SECRET
- Don't share or commit to git
- Backup in safe place

---

## Step 6: Configure Environment Variables

### Create `.env` file

```bash
# Windows
copy .env.solana-devnet .env

# Mac/Linux
cp .env.solana-devnet .env
```

### Edit `.env` file

Open `.env` in your code editor and update:

```env
# ===================================
# DATABASE
# ===================================
# If using Supabase, paste your connection string:
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# If using local PostgreSQL:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/presale_platform"


# ===================================
# SOLANA NETWORK (Start with devnet)
# ===================================
NETWORK="devnet"
RPC_URL="https://api.devnet.solana.com"


# ===================================
# PLATFORM WALLET (From Step 5)
# ===================================
# Paste YOUR public key here:
PLATFORM_WALLET_ADDRESS="YOUR_PUBLIC_KEY_FROM_STEP_5"

# Paste YOUR private key array here:
PLATFORM_WALLET_PRIVATE_KEY="[123,45,67,89,...]"


# ===================================
# x402 CONFIGURATION (No API key needed!)
# ===================================
X402_FACILITATOR_URL="https://facilitator.payai.network"
PAYMENT_NETWORK="solana-devnet"
PAYMENT_TOKEN="USDC"


# ===================================
# ADMIN (Change this password!)
# ===================================
ADMIN_PASSWORD="your-secure-admin-password-here"
JWT_SECRET="your-random-jwt-secret-here"


# ===================================
# NEXT.JS
# ===================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_NETWORK="devnet"
```

**Important Settings:**
- Replace `YOUR_PUBLIC_KEY_FROM_STEP_5` with your public key
- Replace `[123,45,67,89,...]` with your private key array
- Change `your-secure-admin-password-here` to a strong password
- Update `DATABASE_URL` with your database connection

---

## Step 7: Fund Devnet Wallet (For Testing)

Your wallet needs SOL to pay for transaction fees on Solana.

```bash
# Fund with 2 SOL on devnet (free testnet SOL)
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

**Don't have Solana CLI?**

Install it:
```bash
# Windows (PowerShell as Admin)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Mac/Linux
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Then restart terminal and try airdrop again
```

**Alternative - Without CLI:**
- Use https://solfaucet.com/
- Paste your wallet address
- Request devnet SOL

---

## Step 8: Set Up Database

Generate Prisma client and create database tables:

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push
```

**You should see:**
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

**Check database (optional):**
```bash
npx prisma studio
```
This opens a browser to view your database tables.

---

## Step 9: Start Development Server

```bash
npm run dev
```

**You should see:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in Xms
```

---

## Step 10: Test the Platform

### Open Browser
Visit: **http://localhost:3000**

You should see the landing page with:
- "Launch Your Token Presale On Solana with x402 Escrow"
- Solana statistics (400ms, $0.00025, etc.)

### Test Admin Panel
1. Go to http://localhost:3000/admin
2. Enter password from `.env` (ADMIN_PASSWORD)
3. You should see admin dashboard

### Test Creating Presale
1. Go to http://localhost:3000/create
2. Click "Connect Wallet"
3. Fill in presale details
4. Try to submit (will need to pay $100 USDC via x402)

---

## 🎉 Success! Platform is Running

Your platform is now set up and running locally!

---

## 🔧 Troubleshooting

### "Command not found" errors
```bash
# Make sure you're in the correct directory
cd presale-platform
pwd  # Should show path to presale-platform

# Check Node.js is installed
node --version
npm --version
```

### Database connection errors
```bash
# Check DATABASE_URL is correct in .env
# For Supabase: Make sure password is correct
# For local PostgreSQL: Make sure PostgreSQL is running

# Windows:
services.msc  # Check "postgresql" service is running

# Mac:
brew services list  # Check postgresql is started

# Linux:
sudo systemctl status postgresql
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Wallet airdrop fails
```bash
# Try different RPC
solana airdrop 1 YOUR_WALLET --url https://api.devnet.solana.com

# Or use web faucet:
# https://solfaucet.com/
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📚 Next Steps

### For Development (Devnet Testing)

You're all set! Keep using devnet for testing:
- ✅ Create test presales
- ✅ Test investment flow
- ✅ Test admin features
- ✅ Free devnet SOL for testing

### For Production (Mainnet)

When ready to go live:

1. **Switch to Mainnet:**
```bash
cp .env.solana-mainnet .env
```

2. **Generate New Wallet:**
```bash
node scripts/generate-wallet.js
# Keep this wallet VERY secure!
```

3. **Fund Mainnet Wallet:**
- Send real SOL from exchange or another wallet
- Recommended: 0.5-1 SOL for transaction fees

4. **Update `.env`:**
```env
NETWORK="mainnet-beta"
RPC_URL="https://api.mainnet-beta.solana.com"
PAYMENT_NETWORK="solana"
NEXT_PUBLIC_NETWORK="mainnet-beta"
```

5. **Use Paid RPC (Recommended):**
- QuickNode: https://www.quicknode.com/ (~$49/mo)
- Helius: https://helius.dev/ (free tier available)
- Better performance than free RPC

6. **Deploy:**
- See `SOLANA_MAINNET_GUIDE.md` for deployment steps
- Recommended: Vercel for hosting

---

## 🔐 Security Reminders

**Critical:**
- ✅ Never commit `.env` file to git
- ✅ Keep private keys absolutely secret
- ✅ Backup wallet and database
- ✅ Use strong admin password
- ✅ Test everything on devnet first

---

## 📖 Documentation

- **`README.md`** - Overview
- **`SETUP.md`** - Detailed setup
- **`SOLANA_MAINNET_GUIDE.md`** - Production deployment
- **`SOLANA_ONLY.md`** - Solana configuration
- **`X402_INTEGRATION.md`** - x402 protocol details
- **`TROUBLESHOOTING.md`** - Common issues

---

## 🆘 Need Help?

### Check Logs
```bash
# Terminal running npm run dev shows all logs
# Look for error messages
```

### Common Issues
- Database connection → Check DATABASE_URL
- Wallet issues → Check private key format
- Port issues → Kill process on port 3000
- Module errors → Reinstall dependencies

### Resources
- **Solana Docs**: https://docs.solana.com/
- **x402 Docs**: https://docs.cdp.coinbase.com/x402/
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## ✅ Setup Complete!

You now have a fully functional x402 presale platform running on Solana! 🎉

**What you can do:**
- ✅ Create presales
- ✅ Accept investments
- ✅ Manage escrow
- ✅ Admin dashboard
- ✅ All on Solana devnet

**Ready for production?**
- Read `SOLANA_MAINNET_GUIDE.md`
- Switch to mainnet configuration
- Deploy to Vercel
- Launch! 🚀







