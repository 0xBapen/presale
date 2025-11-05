# QuantumRaise - Secure Token Presale Platform

![QuantumRaise](public/images/logo-banner.jpg)

**QuantumRaise** is the ultimate secure presale platform built on Solana, featuring quantum-inspired design and cutting-edge x402 escrow integration.

## 🚀 Features

- **Secure x402 Escrow** - Automated two-way escrow protecting both investors and developers
- **Solana Mainnet** - Lightning-fast transactions with minimal fees
- **Automated Distribution** - Tokens distributed automatically when presale succeeds
- **Full Transparency** - All transactions on-chain and verifiable
- **No Manual Claims** - Investors receive tokens directly to their wallets
- **Built-in Refunds** - Automatic USDC refunds if presale fails

## 🎯 How It Works

### For Developers

1. **Create Token** - Create your SPL token on pump.fun, raydium.io, or via Solana CLI
2. **Launch Presale** - Fill out the presale form and pay $100 USDC creation fee
3. **Deposit Tokens** - Send your tokens to the escrow address
4. **Presale Goes Live** - Platform automatically approves when tokens detected
5. **Receive USDC** - Funds automatically sent to your wallet when presale succeeds

### For Investors

1. **Browse Presales** - Explore active presales on the platform
2. **Research Projects** - Review tokenomics, team info, and milestones
3. **Invest USDC** - Connect wallet and invest via x402 protocol
4. **Receive Tokens** - Tokens automatically sent to your wallet when presale ends
5. **No Manual Claims** - Everything happens automatically!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Blockchain**: Solana Web3.js, SPL Token, Solana Wallet Adapter
- **Database**: PostgreSQL (Supabase recommended)
- **Payment**: x402 Protocol via facilitator.payai.network
- **Escrow**: Custom two-way escrow smart contract logic
- **Automation**: Cron jobs for automated execution

## 📦 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Solana wallet with USDC

### Setup

1. **Clone the repository**
```bash
git clone <your-repo>
cd presale-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local`:

```env
# Database (Use Supabase Connection Pooling string)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Solana
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Platform Wallet
PLATFORM_WALLET_ADDRESS=YourPlatformWalletPublicKey
PLATFORM_WALLET_PRIVATE_KEY=Base64EncodedPrivateKey

# x402 Configuration
X402_FACILITATOR_URL=https://facilitator.payai.network

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Optional
FEE_PERCENTAGE=2.5
```

4. **Generate platform wallet**
```bash
node scripts/generate-wallet.js
```

5. **Setup database**
```bash
npx prisma db push
```

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Deployment (Render)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Web Service on Render**
   - Connect GitHub repository
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm start`
   - Add all environment variables

3. **Create Cron Job on Render**
   - Name: `presale-checker`
   - Command: `curl https://your-app.onrender.com/api/cron/check-presales`
   - Schedule: `0 * * * *` (every hour)

4. **Deploy!**

## 📁 Project Structure

```
presale-platform/
├── app/
│   ├── components/          # React components
│   │   ├── NavBar.tsx      # Navigation with QuantumRaise branding
│   │   ├── PresaleCard.tsx # Presale display card
│   │   ├── Toast.tsx       # Toast notifications
│   │   └── WalletButton.tsx # Wallet connection
│   ├── create/             # Presale creation page
│   ├── presales/           # Presale browsing and details
│   │   └── [id]/
│   │       ├── page.tsx    # Presale detail page
│   │       └── deposit/    # Token deposit page
│   ├── dashboard/          # Investor dashboard
│   ├── admin/              # Admin panel
│   └── api/                # API routes
│       ├── presales/       # Presale CRUD
│       ├── admin/          # Admin operations
│       └── cron/           # Automated tasks
├── lib/
│   ├── escrow/
│   │   └── two-way-escrow.ts  # Main escrow logic
│   ├── token/
│   │   ├── distribution.ts     # Token distribution
│   │   └── token-factory.ts    # Token creation (optional)
│   └── x402/
│       ├── client.ts           # x402 integration
│       └── escrow.ts           # USDC escrow
├── prisma/
│   └── schema.prisma       # Database schema
└── public/
    └── images/             # QuantumRaise logos
```

## 🎨 Branding

**QuantumRaise** features a stunning quantum-inspired design:

- **Logo**: Network sphere with orbital rings (cyan to pink gradient)
- **Color Palette**: Cyan (#00F0FF), Blue (#0066FF), Purple (#9D00FF), Pink (#FF00FF)
- **Typography**: Bold, modern, gradient text effects
- **UI**: Glassmorphism, animated backgrounds, smooth transitions

## 💰 Platform Economics

### Revenue Model

- **Presale Creation Fee**: $100 USDC (one-time)
- **Success Fee**: 2.5% of funds raised

### Example
```
Presale raises $100,000:
- Creation fee: $100
- Success fee: $2,500 (2.5%)
- Total platform revenue: $2,600
- Dev team receives: $97,500
```

## 🔒 Security Features

- **Two-Way Escrow**: Both USDC and tokens held in escrow
- **Automated Execution**: No manual intervention required
- **On-Chain Verification**: All transactions verifiable on Solana
- **Automatic Refunds**: Full refunds if presale fails
- **Time-Locked**: Funds released only when conditions met

## 📚 Documentation

- [Setup Guide](SETUP.md)
- [Production Automation](PRODUCTION_AUTOMATION_GUIDE.md)
- [Option 1: External Tokens](OPTION_1_PRODUCTION_READY.md)
- [Token Distribution](TOKEN_DISTRIBUTION_GUIDE.md)
- [Deployment](DEPLOYMENT_SUMMARY.md)
- [Admin Panel](ADMIN_PANEL_GUIDE.md)

## 🤝 Support

For questions or issues:
- Check documentation in the root folder
- Review the guides (`.md` files)
- Open an issue on GitHub

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

**QuantumRaise** - Raising the future of blockchain, one presale at a time. 🚀
