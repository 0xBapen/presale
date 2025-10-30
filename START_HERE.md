# 🎯 START HERE - Quick Setup

The fastest way to get your x402 presale platform running!

## ⚡ Super Quick Setup (5 Minutes)

### 1. Install Dependencies
```bash
cd presale-platform
npm install
```

### 2. Generate Wallet
```bash
node scripts/generate-wallet.js
```
**Save the output!** You'll need both public key and private key array.

### 3. Setup Database

**Option A: Supabase (Easiest)**
1. Go to https://supabase.com
2. Create new project
3. Copy connection string

**Option B: Local PostgreSQL**
```bash
createdb presale_platform
```

### 4. Configure Environment
```bash
# Copy template
cp .env.solana-devnet .env

# Edit .env and update:
# - DATABASE_URL (from Supabase or local)
# - PLATFORM_WALLET_ADDRESS (from step 2)
# - PLATFORM_WALLET_PRIVATE_KEY (from step 2)
# - ADMIN_PASSWORD (your secure password)
```

### 5. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 6. Fund Wallet (Devnet)
```bash
# Get free test SOL
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# OR use web faucet: https://solfaucet.com/
```

### 7. Start Server
```bash
npm run dev
```

### 8. Open Browser
Visit: **http://localhost:3000**

## ✅ That's It!

Your platform is now running! 🎉

---

## 📖 Need More Details?

See **`COMPLETE_SETUP_GUIDE.md`** for:
- Detailed step-by-step instructions
- Troubleshooting tips
- Production deployment
- Security best practices

---

## 🧪 Quick Test

1. **Admin Panel**: http://localhost:3000/admin
   - Login with your ADMIN_PASSWORD
   
2. **Create Presale**: http://localhost:3000/create
   - Connect wallet
   - Fill form
   - Test x402 payment flow

3. **Browse Presales**: http://localhost:3000/presales
   - View active presales
   - Test investment flow

---

## 🚀 Going to Production?

When ready for mainnet:

1. Read **`SOLANA_MAINNET_GUIDE.md`**
2. Generate new mainnet wallet
3. Fund with real SOL
4. Update `.env` to mainnet
5. Deploy to Vercel

---

## 🆘 Having Issues?

**Most Common Issues:**

**"Module not found"**
```bash
npm install
```

**"Database connection failed"**
```bash
# Check DATABASE_URL in .env
```

**"Port 3000 in use"**
```bash
# Kill process on port 3000
# Windows: taskkill /F /IM node.exe
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**"Prisma error"**
```bash
npx prisma generate
npx prisma db push
```

---

## 📚 Documentation

- **Complete Setup**: `COMPLETE_SETUP_GUIDE.md`
- **Mainnet Deploy**: `SOLANA_MAINNET_GUIDE.md`
- **Features**: `FEATURES.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

---

**You're all set! Let's build something amazing! 🚀**

