# Token Distribution System - How It Works

## 🎯 Overview

When a presale succeeds, investors **automatically receive their tokens** through our secure SPL token distribution system on Solana.

---

## 📊 Complete Flow

### **Phase 1: Presale Creation (Developer)**

```
1. Developer creates presale
2. Sets token price (e.g., $0.10 per token)
3. Creates SPL token on Solana (if not already created)
4. Deposits tokens into platform escrow wallet
5. Presale goes ACTIVE
```

**Database Updates:**
```typescript
Presale {
  tokenAddress: "TokenMintAddress123...",
  tokenDecimals: 9,
  tokenPrice: 0.10,  // $0.10 per token
  totalSupply: "1000000000",  // 1 billion tokens
  presaleAllocation: 30,  // 30% for presale = 300M tokens
}
```

---

### **Phase 2: Investment (Investors)**

```
1. Investor connects Solana wallet (Phantom, Solflare, etc.)
2. Invests USDC (e.g., $100)
3. USDC held in platform escrow
4. Investment recorded with calculated token allocation
```

**Example Investment:**
```
Investor pays: $100 USDC
Token price: $0.10
Tokens allocated: 1,000 tokens (100 / 0.10)
```

**Database Updates:**
```typescript
Investment {
  investorWallet: "InvestorPublicKey456...",
  amount: 100,  // $100 USDC
  tokenAmount: "1000000000000",  // 1000 tokens * 10^9 decimals
  status: "CONFIRMED"
}
```

---

### **Phase 3: Presale Success**

```
1. Presale reaches hard cap OR deadline passes with soft cap met
2. Admin marks presale as FUNDED
3. USDC funds released to dev team (minus 2.5% platform fee)
4. Presale ready for token distribution
```

**Status Changes:**
```
ACTIVE → FUNDED
```

---

### **Phase 4: Automatic Token Distribution** ✨

This is where the magic happens!

#### **Option A: Automatic (Recommended)**

When presale status changes to `FUNDED`, a cron job or admin triggers:

```bash
POST /api/admin/distribute
{
  "presaleId": "presale123"
}
```

**What Happens:**

```typescript
For each investor:
1. Calculate token amount: investment / tokenPrice
2. Create/find investor's SPL token account
3. Transfer tokens from platform escrow → investor wallet
4. Update investment status to "CLAIMED"
5. Record distribution transaction
```

**Real Transaction Flow:**
```
Platform Token Account (ATA)
    ↓ [Transfer 1000 tokens]
Investor Token Account (ATA) ✅
```

#### **Technical Details:**

```typescript
// Example: Investor invested $100, token price $0.10
const tokenAmount = 100 / 0.10 = 1000 tokens

// Convert to smallest unit (9 decimals)
const rawAmount = 1000 * 10^9 = 1,000,000,000,000

// Create SPL token transfer instruction
createTransferInstruction(
  platformTokenAccount,  // From
  investorTokenAccount,  // To
  platformKeypair,       // Signer
  1_000_000_000_000      // Amount in smallest units
)
```

---

## 🔧 Implementation Details

### **1. Token Distribution Manager** (`lib/token/distribution.ts`)

```typescript
class TokenDistributor {
  async distributeTokens(config) {
    // 1. Verify presale is FUNDED
    // 2. Get all confirmed investments
    // 3. For each investor:
    //    - Calculate token amount
    //    - Create ATA if needed
    //    - Transfer tokens
    //    - Update status to CLAIMED
    //    - Record distribution
    // 4. Return results
  }
}
```

**Key Features:**
- ✅ Automatic ATA (Associated Token Account) creation
- ✅ Batch processing of all investors
- ✅ Error handling for failed distributions
- ✅ Transaction tracking
- ✅ Status updates

---

### **2. Database Schema**

```prisma
model Presale {
  tokenAddress      String?  // SPL token mint address
  tokenDecimals     Int      @default(9)
  tokenPrice        Float?   // Price per token in USD
  // ... other fields
}

model Investment {
  amount          Float              // USDC invested
  tokenAmount     String?            // Tokens allocated (BigInt as string)
  status          InvestmentStatus   // PENDING → CONFIRMED → CLAIMED
  claimedAt       DateTime?
  distribution    TokenDistribution?
}

model TokenDistribution {
  investmentId    String   @unique
  tokenAmount     Float    // Tokens distributed
  transactionHash String   // Solana transaction signature
  createdAt       DateTime
}
```

---

### **3. API Endpoints**

#### **Distribute Tokens (Admin Only)**

```http
POST /api/admin/distribute
Content-Type: application/json

{
  "presaleId": "clxxx123"
}

Response:
{
  "success": true,
  "distributed": 150,  // Investors who received tokens
  "failed": 2,         // Failed distributions (retry manually)
  "transactions": [
    "5XyZ...abc",      // Solana transaction signatures
    "3AbC...xyz"
  ],
  "message": "Successfully distributed tokens to 150 investors"
}
```

#### **Check Distribution Status**

```http
GET /api/admin/distribute?presaleId=clxxx123

Response:
{
  "totalInvestors": 152,
  "distributed": 150,
  "pending": 2,
  "distributions": [
    {
      "investorWallet": "Abc123...",
      "investedAmount": 100,
      "tokensReceived": 1000,
      "transactionHash": "5XyZ...abc",
      "distributedAt": "2025-10-30T12:00:00Z"
    }
  ]
}
```

---

## 💡 Token Calculation Examples

### **Example 1: Simple 1:1 Ratio**

```
Token Price: $1.00
Investor pays: $500
Tokens received: 500 tokens
```

### **Example 2: Fractional Price**

```
Token Price: $0.05
Investor pays: $250
Tokens received: 5,000 tokens
```

### **Example 3: Multiple Decimals**

```
Token Price: $0.001
Token Decimals: 6
Investor pays: $100
Tokens received: 100,000 tokens = 100,000,000,000 (raw with decimals)
```

---

## 🔐 Security Features

### **1. Escrow Protection**
- ✅ Tokens held in platform wallet until distribution
- ✅ Only admin can trigger distribution
- ✅ Distribution only after presale FUNDED

### **2. Transaction Safety**
- ✅ All transactions signed by platform keypair
- ✅ Solana network confirmation required
- ✅ Failed distributions logged for retry

### **3. Investor Safety**
- ✅ Automatic ATA creation (no manual setup needed)
- ✅ Tokens go directly to investor wallet
- ✅ Transaction hashes recorded for transparency

---

## 📱 User Experience

### **For Investors**

**Before Distribution:**
```
Dashboard → Your Investments
Status: ✓ CONFIRMED
Action: Waiting for token distribution
```

**After Distribution:**
```
Dashboard → Your Investments
Status: ✓ CLAIMED
Tokens: 1,000 ABC tokens
Transaction: View on Solscan ↗
Action: Tokens in your wallet! Check Phantom/Solflare
```

**In Wallet:**
```
Phantom Wallet
├─ SOL: 0.5
├─ USDC: 50
└─ ABC Token: 1,000 ← New! ✨
```

---

## 🚀 Setup Instructions

### **1. Update Database Schema**

```bash
npx prisma db push
```

This adds:
- `tokenPrice` field to Presale
- `TokenDistribution` model

### **2. Prepare Platform Wallet**

The platform wallet must hold the presale tokens:

```typescript
// Developer sends tokens to platform wallet
// Platform wallet address: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS
```

### **3. Set Token Details in Presale**

When creating presale, require:
```typescript
{
  tokenAddress: "MintAddress123...",  // SPL token mint
  tokenDecimals: 9,                   // Usually 9 for Solana
  tokenPrice: 0.10,                   // Price in USD
}
```

### **4. Trigger Distribution**

After presale succeeds:

```bash
# Option A: Admin panel button
Admin Dashboard → Select Presale → "Distribute Tokens"

# Option B: API call
curl -X POST https://yoursite.com/api/admin/distribute \
  -H "Content-Type: application/json" \
  -d '{"presaleId": "clxxx123"}'
```

---

## 🎯 Automation Options

### **Option 1: Manual (Safest)**
Admin manually triggers distribution after verifying presale success.

### **Option 2: Semi-Automatic**
Admin clicks "Distribute" button in dashboard.

### **Option 3: Fully Automatic (Advanced)**
Use a cron job or webhook:

```typescript
// Check for FUNDED presales and auto-distribute
// Run every hour
cron: "0 * * * *"

async function autoDistribute() {
  const fundedPresales = await prisma.presale.findMany({
    where: { status: 'FUNDED' }
  });
  
  for (const presale of fundedPresales) {
    if (!presale.tokenAddress) continue;
    
    await tokenDistributor.distributeTokens({
      presaleId: presale.id,
      tokenMintAddress: presale.tokenAddress,
      tokenDecimals: presale.tokenDecimals,
    });
  }
}
```

---

## 📊 Distribution Dashboard

Add to Admin Panel:

```tsx
<div className="glass-effect rounded-2xl p-6">
  <h2>Token Distribution Status</h2>
  
  <div className="grid grid-cols-3 gap-4">
    <StatCard
      label="Total Investors"
      value="152"
      icon={<Users />}
    />
    <StatCard
      label="Tokens Distributed"
      value="150"
      icon={<CheckCircle className="text-green-400" />}
    />
    <StatCard
      label="Pending"
      value="2"
      icon={<Clock className="text-yellow-400" />}
    />
  </div>
  
  <button
    onClick={distributeTokens}
    className="gradient-bg px-6 py-3 rounded-xl"
  >
    Distribute Tokens Now
  </button>
</div>
```

---

## ✅ Checklist

- [ ] Update Prisma schema with `tokenPrice` and `TokenDistribution`
- [ ] Run `npx prisma db push`
- [ ] Test token distribution on devnet
- [ ] Set up platform wallet with tokens
- [ ] Add distribution button to admin panel
- [ ] Test with real investors on mainnet
- [ ] Monitor distribution transactions
- [ ] Set up error alerts for failed distributions

---

## 🆘 Troubleshooting

### **Distribution Failed**

**Error**: "Insufficient tokens in platform wallet"
**Fix**: Ensure platform wallet has enough tokens for all investors

**Error**: "Invalid token mint address"
**Fix**: Verify `tokenAddress` is correct SPL token mint

**Error**: "Investor ATA creation failed"
**Fix**: Usually auto-retries, check Solana network status

---

## 🎉 Summary

**How it works in 3 steps:**

1. **Investor pays** → USDC goes to escrow
2. **Presale succeeds** → USDC released to dev team
3. **Tokens distributed** → Tokens automatically sent to investor wallets ✨

**Key Points:**
- ✅ 100% automatic once triggered
- ✅ Secure SPL token transfers on Solana
- ✅ Instant delivery to investor wallets
- ✅ Full transaction transparency
- ✅ No manual claiming needed

Investors simply check their wallet and see their new tokens! 🚀







