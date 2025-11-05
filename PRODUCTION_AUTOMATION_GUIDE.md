# 🚀 Production Automation Guide

## Complete End-to-End Automated Presale System

This guide shows how everything works **automatically in production** with zero manual intervention (except admin approval).

---

## 🎯 Complete Automated Flow

```
┌────────────────────────────────────────────────────────────┐
│          FULLY AUTOMATED PRESALE LIFECYCLE                 │
└────────────────────────────────────────────────────────────┘

1️⃣ PRESALE CREATION (Dev Team)
┌──────────────────────────────────────────┐
│ Dev creates presale on platform          │
│ • Sets token price: $0.10                │
│ • Sets hard cap: $100,000                │
│ • Sets deadline: 30 days                 │
│ Status: PENDING                          │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ System calculates required tokens        │
│ $100,000 / $0.10 = 1,000,000 tokens     │
│ Shows deposit address to dev             │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│ Dev deposits 1M tokens to platform       │
│ • Sends to platform wallet               │
│ • Platform verifies receipt              │
│ ✅ AUTO-APPROVED: Status → ACTIVE        │
└──────────────────────────────────────────┘

─────────────────────────────────────────────────────────────

2️⃣ INVESTMENT PHASE (Investors)
┌──────────────────────────────────────────┐
│ Investors see ACTIVE presale             │
│ • Connect Solana wallet                  │
│ • Pay USDC via x402                      │
│ • USDC goes to platform escrow ✓         │
│ Status: CONFIRMED                        │
└──────────────────────────────────────────┘

Multiple investors → Platform holds:
• USDC in escrow ✓
• Tokens in escrow ✓

─────────────────────────────────────────────────────────────

3️⃣ DEADLINE REACHED (Automated Check)
┌──────────────────────────────────────────┐
│ CRON JOB runs every hour                 │
│ Checks: Has deadline passed?             │
│ Checks: Reached soft cap?                │
└──────────────────────────────────────────┘

IF SUCCESS (Raised ≥ Soft Cap):
┌──────────────────────────────────────────┐
│ ✅ AUTOMATED SUCCESS EXECUTION            │
│                                          │
│ 1. USDC Transfer:                        │
│    Platform → Dev Team (minus 2.5% fee) │
│    Transaction on Solana ✓              │
│                                          │
│ 2. Token Distribution:                   │
│    Platform → All Investors              │
│    1000+ transactions automatically ✓    │
│                                          │
│ 3. Status Update:                        │
│    ACTIVE → FUNDED → COMPLETED ✓         │
│                                          │
│ Result: Everyone gets their assets! ✨   │
└──────────────────────────────────────────┘

IF FAILURE (Raised < Soft Cap):
┌──────────────────────────────────────────┐
│ ❌ AUTOMATED FAILURE EXECUTION            │
│                                          │
│ 1. USDC Refunds:                         │
│    Platform → All Investors              │
│    Full refund automatically ✓           │
│                                          │
│ 2. Token Return:                         │
│    Platform → Dev Team                   │
│    All tokens back ✓                     │
│                                          │
│ 3. Status Update:                        │
│    ACTIVE → FAILED ✓                     │
│                                          │
│ Result: Everyone gets refunded! ✓        │
└──────────────────────────────────────────┘
```

---

## ⚙️ Production Setup

### **Step 1: Environment Variables**

```bash
# Solana Network
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://your-helius-rpc.com  # Use premium RPC
RPC_URL=https://your-helius-rpc.com

# Platform Wallet (holds USDC and tokens during escrow)
PLATFORM_WALLET_PRIVATE_KEY=your-base64-private-key
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=YourPlatformPublicKey

# Database
DATABASE_URL=postgresql://...

# Cron Job Security
CRON_SECRET=your-random-secret-key-here  # Generate with: openssl rand -base64 32

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
```

---

### **Step 2: Setup Cron Job (Automated Checks)**

Your platform needs to automatically check presales every hour. Two options:

#### **Option A: Render Cron Jobs (Recommended)**

Add to `render.yaml`:

```yaml
services:
  # ... your web service ...

  # Automated Presale Checker
  - type: cron
    name: presale-checker
    env: node
    schedule: "0 * * * *"  # Every hour
    buildCommand: npm install
    startCommand: |
      curl -X POST \
        -H "Authorization: Bearer $CRON_SECRET" \
        https://your-app.onrender.com/api/cron/check-presales
```

#### **Option B: External Cron Service**

Use https://cron-job.org (free):

1. Create account
2. Add job:
   - **URL**: `https://your-app.onrender.com/api/cron/check-presales`
   - **Schedule**: Every 1 hour
   - **Headers**: `Authorization: Bearer your-cron-secret`

---

### **Step 3: Deploy to Production**

```bash
# 1. Update database
npx prisma db push

# 2. Build
npm run build

# 3. Test cron endpoint locally
curl -X POST http://localhost:3000/api/cron/check-presales \
  -H "Authorization: Bearer your-cron-secret"

# 4. Deploy to Render
git push origin main
```

---

## 📊 Real Transaction Examples

### **Example: Successful Presale**

**Setup:**
- Target: $100,000
- Soft Cap: $50,000
- Token Price: $0.10
- Investors: 200 people
- Total Raised: $75,000 ✅

**What Happens Automatically:**

```typescript
// 1. Cron job detects presale ended
[2025-10-30 12:00:00] Cron: Checking presales...
[2025-10-30 12:00:01] Found presale_abc123: $75k raised, soft cap met ✅

// 2. Execute USDC transfer to dev
[2025-10-30 12:00:02] Transferring $73,125 USDC to dev team...
[2025-10-30 12:00:03] ✅ USDC sent: 5XyZ...abc (Solana TX)

// 3. Distribute tokens to 200 investors
[2025-10-30 12:00:04] Distributing tokens to 200 investors...
[2025-10-30 12:00:05] ✅ Investor 1: 1,000 tokens (3AbC...xyz)
[2025-10-30 12:00:06] ✅ Investor 2: 500 tokens (7DeF...123)
... (all 200 transactions in ~5 minutes)
[2025-10-30 12:05:00] ✅ Distribution complete: 200/200 succeeded

// 4. Update status
[2025-10-30 12:05:01] Status: COMPLETED ✓
```

**Actual Solana Transactions:**
- 1 USDC transfer (dev team)
- 200 token transfers (investors)
- All recorded on blockchain
- All viewable on Solscan

---

### **Example: Failed Presale**

**Setup:**
- Target: $100,000
- Soft Cap: $50,000
- Raised: $35,000 ❌
- Investors: 100 people

**What Happens Automatically:**

```typescript
// 1. Cron job detects presale failed
[2025-10-30 12:00:00] Cron: Checking presales...
[2025-10-30 12:00:01] Found presale_xyz789: $35k raised, below soft cap ❌

// 2. Refund USDC to all 100 investors
[2025-10-30 12:00:02] Refunding 100 investors...
[2025-10-30 12:00:03] ✅ Investor 1: $500 refunded (9GhI...456)
[2025-10-30 12:00:04] ✅ Investor 2: $200 refunded (2JkL...789)
... (all 100 refunds)
[2025-10-30 12:02:30] ✅ Refunds complete: 100/100 succeeded

// 3. Return tokens to dev team
[2025-10-30 12:02:31] Returning 1,000,000 tokens to dev...
[2025-10-30 12:02:32] ✅ Tokens returned: 4MnO...012 (Solana TX)

// 4. Update status
[2025-10-30 12:02:33] Status: FAILED, all refunded ✓
```

---

## 🔐 Security in Production

### **Platform Wallet Security**

Your platform wallet holds BOTH USDC and tokens during escrow:

```
Platform Wallet Contents During Active Presale:
├─ USDC: $75,000 (from investors)
├─ ABC Tokens: 1,000,000 (from dev team)
└─ SOL: 0.1 (for transaction fees)

Security Measures:
✅ Private key in encrypted env variable
✅ Only accessed by platform backend
✅ All transactions logged
✅ Multi-sig recommended for large presales
```

### **Cron Job Security**

```typescript
// API endpoint protected
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized
}
```

**Best Practices:**
- Use strong random CRON_SECRET (32+ characters)
- Only call from trusted cron service
- Monitor logs for unauthorized attempts

---

## 📱 User Experience

### **For Developers:**

```
Day 1: Create Presale
├─ Fill form
├─ Get deposit address
├─ Send 1M tokens
└─ ✅ Auto-approved → ACTIVE

Day 1-30: Monitor Progress
├─ View dashboard
├─ See real-time investments
└─ Track toward goal

Day 31: Automatic Completion
├─ Cron checks deadline
├─ ✅ Success: USDC auto-sent to wallet
└─ ✨ Check wallet: $73,125 USDC received!
```

### **For Investors:**

```
Day 1-30: Invest
├─ Browse presales
├─ Pay USDC
└─ Investment confirmed

Day 31: Automatic Distribution
├─ No action needed
├─ Tokens auto-sent to wallet
└─ ✨ Check wallet: 1,000 tokens received!

If presale fails:
├─ No action needed
├─ USDC auto-refunded
└─ ✨ Check wallet: Full refund received!
```

---

## 🎯 Manual Override (Emergency)

If automation fails or you need manual control:

### **Force Success Execution:**
```bash
curl -X POST https://your-app.onrender.com/api/admin/execute-success \
  -H "Content-Type: application/json" \
  -d '{"presaleId": "presale123"}'
```

### **Force Refund:**
```bash
curl -X POST https://your-app.onrender.com/api/admin/execute-refund \
  -H "Content-Type: application/json" \
  -d '{"presaleId": "presale123"}'
```

---

## 📊 Monitoring & Logging

### **Check Cron Job Status:**
```bash
# View logs
https://your-app.onrender.com/api/cron/check-presales/logs

# Manual trigger
curl -X POST https://your-app.onrender.com/api/cron/check-presales \
  -H "Authorization: Bearer your-cron-secret"
```

### **Monitor Active Presales:**
```sql
-- Database query
SELECT 
  id,
  projectName,
  currentRaised,
  hardCap,
  endDate,
  status
FROM "Presale"
WHERE status IN ('ACTIVE', 'FUNDED')
  AND endDate < NOW();
```

---

## 🚨 Error Handling

### **What if token distribution fails?**

The system handles this gracefully:

```typescript
// Failed distributions are tracked
{
  distributed: 195,
  failed: 5,  // 5 investors had issues
  errors: [
    "investor1: Token account creation failed",
    "investor2: Insufficient SOL for rent",
    ...
  ]
}
```

**Solutions:**
1. System logs all failures
2. Admin can retry manually
3. Investors can contact support
4. Platform holds tokens until resolved

---

## ✅ Production Checklist

Before going live:

### **Infrastructure**
- [ ] Premium Solana RPC (Helius/QuickNode)
- [ ] Render Pro plan ($7/month for always-on)
- [ ] Cron job configured and tested
- [ ] Database backups enabled

### **Security**
- [ ] Strong CRON_SECRET generated
- [ ] Platform wallet private key secured
- [ ] Admin password changed from default
- [ ] HTTPS enabled (automatic on Render)

### **Testing**
- [ ] Test successful presale flow on devnet
- [ ] Test failed presale refunds on devnet
- [ ] Test cron job manually
- [ ] Verify USDC transfers work
- [ ] Verify token distributions work

### **Monitoring**
- [ ] Set up error alerts
- [ ] Monitor cron job logs
- [ ] Track transaction success rates
- [ ] Set up uptime monitoring

---

## 🎉 Result

With this setup, your platform is **100% automated**:

✅ **Zero manual intervention needed**
✅ **Investors get tokens automatically**
✅ **Dev teams get USDC automatically**
✅ **Refunds happen automatically**
✅ **Everything on Solana blockchain**
✅ **Production-ready and scalable**

Just deploy, set up the cron job, and let it run! 🚀

---

## 📚 API Endpoints Summary

```
Automated (Cron):
POST /api/cron/check-presales
└─ Runs every hour, executes success/failure automatically

Manual (Admin):
POST /api/admin/execute-success
POST /api/admin/execute-refund
GET  /api/admin/distribute?presaleId=xxx

Public (Info):
GET  /api/presales/:id/escrow
POST /api/presales/:id/escrow/deposit-info
```

Your presale platform is now fully automated and production-ready! 🎊







