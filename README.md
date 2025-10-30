# x402 Presale Platform

A decentralized presale platform powered by the [x402 payment protocol](https://docs.cdp.coinbase.com/x402/welcome) that acts as an escrow between presale investors and development teams.

## 🚀 Features

- **Secure Escrow**: Platform holds funds in escrow using x402 protocol until conditions are met
- **Milestone-Based Releases**: Release funds in phases as projects complete milestones
- **Transparent**: All transactions on-chain with real-time tracking
- **Instant Payments**: x402 enables instant, automatic stablecoin payments over HTTP
- **Fair Launch**: Customizable investment limits per wallet
- **Refund Protection**: Automatic refunds if presale fails to reach soft cap
- **Admin Dashboard**: Complete presale management and oversight

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Solana Mainnet
- **Payment Protocol**: x402 via facilitator.payai.network
- **Escrow**: Platform-controlled Solana wallet

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Solana mainnet wallet (for platform escrow)
- SOL for transaction fees
- No x402 API key required (using facilitator.payai.network)

## 🛠️ Installation

1. **Clone the repository**
```bash
cd presale-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/presale_platform"

# Solana Network (use mainnet-beta for production)
NETWORK="mainnet-beta"
RPC_URL="https://api.mainnet-beta.solana.com"

# Platform Wallet (Escrow)
PLATFORM_WALLET_PRIVATE_KEY="[your-private-key-array]"
PLATFORM_WALLET_ADDRESS="your-wallet-address"

# x402 Configuration (Solana)
X402_FACILITATOR_URL="https://facilitator.payai.network"
PAYMENT_NETWORK="solana"
PAYMENT_TOKEN="USDC"

# Admin Authentication
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-jwt-secret"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_NETWORK="mainnet-beta"
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your presale platform!

## 📖 How It Works

### For Project Teams (Sellers)

1. **Create Presale**: Fill out project details, tokenomics, and funding goals
2. **Set Milestones**: Define milestones for phased fund releases (optional)
3. **Get Approved**: Platform reviews and activates presale
4. **Receive Funds**: Funds released from escrow as milestones are completed

### For Investors (Buyers)

1. **Browse Presales**: Explore active token presales
2. **Invest**: Use x402 to pay instantly with USDC
3. **Track Progress**: Monitor presale progress in real-time
4. **Claim Tokens**: Receive tokens when presale completes
5. **Get Refunds**: Automatic refunds if presale fails

### x402 Escrow Flow

1. Investor initiates investment → receives 402 Payment Required
2. Investor completes x402 payment → funds go to platform escrow
3. Platform verifies payment through x402 facilitator
4. Funds held in escrow until presale succeeds or fails
5. Success → funds released to team based on milestones
6. Failure → automatic refunds to all investors

## 🔐 Security Features

- **Escrow Protection**: Funds never go directly to project teams
- **x402 Verification**: All payments verified through facilitator
- **Milestone Gating**: Funds released incrementally
- **Soft Cap Protection**: Refunds if minimum not reached
- **Admin Oversight**: Platform reviews all presales
- **On-Chain Transparency**: All transactions verifiable

## 🎯 API Endpoints

### Presales

- `GET /api/presales` - List presales
- `POST /api/presales` - Create presale
- `GET /api/presales/[id]` - Get presale details
- `PATCH /api/presales/[id]` - Update presale (admin)

### Investments

- `POST /api/presales/[id]/invest` - Initiate investment (returns 402)
- `POST /api/presales/[id]/invest` - Verify payment
- `GET /api/presales/[id]/invest?wallet=` - Get investment status

### Admin

- Admin dashboard at `/admin` (password protected)
- Presale approval and management
- Escrow fund monitoring

## 🔄 Presale Lifecycle

```
DRAFT → ACTIVE → FUNDED → COMPLETED
         ↓
       FAILED (refunds issued)
```

- **DRAFT**: Awaiting admin approval
- **ACTIVE**: Accepting investments
- **FUNDED**: Target reached, awaiting completion
- **COMPLETED**: Project delivered, tokens distributed
- **FAILED**: Did not reach soft cap, refunds processed

## 💰 Platform Fees

- Default: 2.5% of total raised
- Collected when funds are released from escrow
- Configurable in `PlatformSettings`

## 🧪 Testing

```bash
npm run test
```

## 📦 Production Deployment

### Database Setup

1. Create production PostgreSQL database
2. Run migrations: `npx prisma migrate deploy`

### Platform Wallet

1. Generate secure wallet for escrow
2. Fund with SOL/ETH for transaction fees
3. Store private key securely (use secrets manager)

### x402 Setup

1. Sign up at [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Get x402 API credentials
3. Configure facilitator URL and network

### Environment

- Set all production environment variables
- Use strong admin password
- Enable HTTPS
- Set up monitoring and alerts

## 🛡️ Admin Panel

Access at `/admin` with admin password.

Features:
- View all presales and statistics
- Approve/reject presales
- Update presale status
- Feature presales
- Monitor escrow balances
- Manage platform settings

## 📚 Resources

**x402 Protocol:**
- [x402 Documentation](https://docs.cdp.coinbase.com/x402/welcome)
- [facilitator.payai.network](https://facilitator.payai.network) - No API key required

**Solana:**
- [Solana Documentation](https://docs.solana.com/)
- [Solana Mainnet Explorer (Solscan)](https://solscan.io/)
- [Solana Web3.js Guide](https://solana-labs.github.io/solana-web3.js/)

**Development:**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Open a GitHub issue
- Contact platform admin
- Join [CDP Discord](https://discord.gg/cdp)

## 🎉 What's Next?

- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Advanced tokenomics options
- [ ] KYC/AML integration
- [ ] Token vesting contracts
- [ ] DAO governance for presale approvals
- [ ] Mobile app

---

Built with ❤️ using [x402 Payment Protocol](https://docs.cdp.coinbase.com/x402/welcome)

