# x402 Protocol Integration Guide

This document explains how the x402 payment protocol is integrated into the presale platform.

## What is x402?

x402 is a new open payment protocol developed by Coinbase that enables instant, automatic stablecoin payments directly over HTTP. It revives the HTTP 402 "Payment Required" status code to let services monetize APIs and digital content onchain.

**Learn more:** https://docs.cdp.coinbase.com/x402/welcome

## How x402 Works in This Platform

### 1. Payment Request Flow

When an investor wants to invest in a presale:

```typescript
// 1. Investor initiates investment
POST /api/presales/[id]/invest
Body: {
  investorWallet: "0x...",
  amount: 1000
}

// 2. Server responds with 402 Payment Required
Status: 402
Body: {
  error: "Payment Required",
  paymentInstructions: {
    facilitator: "https://x402-facilitator.coinbase.com",
    network: "base",
    token: "USDC",
    amount: "1000",
    recipient: "platform-escrow-wallet",
    memo: "presale:abc123"
  }
}
```

### 2. Payment Execution

The client (wallet) processes the payment instructions:

```typescript
// Client makes payment via x402
const payment = await x402Wallet.pay({
  to: paymentInstructions.recipient,
  amount: paymentInstructions.amount,
  token: paymentInstructions.token,
  memo: paymentInstructions.memo
});
```

### 3. Payment Verification

After payment, the transaction is verified:

```typescript
// 3. Client sends proof of payment
POST /api/presales/[id]/invest
Body: {
  investorWallet: "0x...",
  transactionHash: "0x123...",
  amount: "1000",
  network: "base",
  token: "USDC",
  timestamp: 1234567890
}

// 4. Server verifies via x402 facilitator
const verification = await x402Client.verifyPayment({
  transactionHash: "0x123...",
  from: "0x...",
  to: "platform-escrow-wallet",
  amount: "1000",
  network: "base",
  token: "USDC",
  timestamp: 1234567890
});

// 5. Server responds with confirmation
Status: 200
Body: {
  success: true,
  investment: {...},
  presale: {...}
}
```

## Implementation Details

### x402 Client (`lib/x402/client.ts`)

The x402 client handles all protocol interactions:

```typescript
export class X402Client {
  // Generate payment instructions
  async generatePaymentInstructions(
    presaleId: string,
    amount: number,
    recipientWallet: string
  ): Promise<X402PaymentInstructions>

  // Verify payment through facilitator
  async verifyPayment(
    payload: X402PaymentPayload
  ): Promise<X402PaymentResponse>

  // Check payment status
  async checkPaymentStatus(
    paymentId: string
  ): Promise<PaymentStatus>
}
```

### Escrow Manager (`lib/x402/escrow.ts`)

Manages escrow wallet and fund distribution:

```typescript
export class EscrowManager {
  // Verify escrow balance matches investments
  async verifyEscrowBalance(presaleId: string)

  // Release funds to project team
  async releaseFunds(presaleId: string, milestoneId?: string)

  // Refund investors if presale fails
  async refundInvestors(presaleId: string)

  // Calculate platform fees
  async collectPlatformFees(presaleId: string)
}
```

## x402 Configuration

### Environment Variables

```env
# x402 Facilitator
X402_FACILITATOR_URL="https://x402-facilitator.coinbase.com"
X402_API_KEY="your-api-key"

# Payment Network
PAYMENT_NETWORK="base"  # or "solana", "ethereum"
PAYMENT_TOKEN="USDC"

# Platform Escrow Wallet
PLATFORM_WALLET_ADDRESS="your-wallet-address"
PLATFORM_WALLET_PRIVATE_KEY="[...]"
```

### Getting x402 Credentials

1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create account or login
3. Create new project
4. Enable x402 API
5. Copy API key and facilitator URL

## Payment Flow Diagram

```
Investor                Platform               x402 Facilitator         Blockchain
   |                       |                           |                      |
   |--1. Invest Request--->|                           |                      |
   |                       |                           |                      |
   |<--2. 402 Required-----|                           |                      |
   |   (instructions)      |                           |                      |
   |                       |                           |                      |
   |--3. Execute Payment--------------------------------|--4. Tx to Chain---->|
   |                       |                           |                      |
   |                       |                           |<--5. Confirmation----|
   |                       |                           |                      |
   |--6. Proof of Payment->|                           |                      |
   |                       |                           |                      |
   |                       |--7. Verify Payment------->|                      |
   |                       |                           |                      |
   |                       |<--8. Verification Result--|                      |
   |                       |                           |                      |
   |<--9. Investment OK----|                           |                      |
   |                       |                           |                      |
```

## Escrow Flow

### Investment (Funds In)

```
Investor Wallet → x402 Payment → Platform Escrow Wallet
                                         ↓
                                  (Held in escrow)
                                         ↓
                             Investment record created
```

### Success (Funds Out)

```
Platform Escrow Wallet → Milestone Completed?
         ↓
    Yes: Release X%
         ↓
    Team Wallet (receives funds)
         ↓
    Platform Fee (2.5% collected)
```

### Failure (Refunds)

```
Platform Escrow Wallet → Soft Cap Not Met?
         ↓
    Yes: Process Refunds
         ↓
    Investor Wallets (full refund)
```

## Benefits of x402

### For Platform
- ✅ Instant payment verification
- ✅ No chargebacks
- ✅ Low fees (compared to traditional payment processors)
- ✅ Automated settlement
- ✅ Direct on-chain payments

### For Investors
- ✅ No account creation needed
- ✅ Pay with stablecoins (USDC)
- ✅ Transparent on-chain transactions
- ✅ Instant confirmation
- ✅ No credit card required

### For Project Teams
- ✅ Instant settlement
- ✅ Global access
- ✅ Lower fees than traditional fundraising
- ✅ Programmable fund release
- ✅ Built-in escrow protection

## Security Considerations

### Payment Verification

All payments are verified through the x402 facilitator:

```typescript
const verification = await x402Client.verifyPayment(payload);

if (!verification.success || !verification.verified) {
  throw new Error('Payment verification failed');
}
```

### Escrow Protection

- Funds held by platform wallet, not project teams
- Smart contract or manual verification before release
- Milestone-based releases
- Automatic refunds for failed presales

### Transaction Recording

Every payment is recorded:

```typescript
await prisma.escrowTransaction.create({
  data: {
    presaleId,
    type: 'DEPOSIT',
    amount: investment.amount,
    fromWallet: investorWallet,
    toWallet: platformWallet,
    transactionHash: txHash,
  },
});
```

## Testing x402 Integration

### Devnet Testing

```bash
# 1. Set up devnet environment
NETWORK="devnet"
PAYMENT_NETWORK="base-goerli"  # or "solana-devnet"

# 2. Fund test wallet
solana airdrop 2 <wallet> --url devnet

# 3. Run test investment
curl -X POST http://localhost:3000/api/presales/[id]/invest \
  -H "Content-Type: application/json" \
  -d '{"investorWallet":"...","amount":100}'
```

### Mock Facilitator

For local testing without x402 API:

```typescript
// lib/x402/mock-client.ts
export class MockX402Client extends X402Client {
  async verifyPayment(payload: X402PaymentPayload) {
    // Mock successful verification
    return {
      success: true,
      paymentId: 'mock-' + Date.now(),
      verified: true,
      transactionHash: payload.transactionHash,
    };
  }
}
```

## Monitoring

### Track Payment Success Rate

```typescript
const stats = await prisma.investment.groupBy({
  by: ['status'],
  _count: true,
});

console.log('Payment success rate:', 
  stats.CONFIRMED / (stats.CONFIRMED + stats.FAILED)
);
```

### Monitor Escrow Balance

```typescript
const balance = await escrowManager.verifyEscrowBalance(presaleId);

if (balance.discrepancy > 0.01) {
  console.warn('Escrow balance discrepancy detected!');
}
```

## Resources

- [x402 Documentation](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 Quickstart](https://docs.cdp.coinbase.com/x402/quickstart)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [x402 Core Concepts](https://docs.cdp.coinbase.com/x402/core-concepts)

## Support

For x402-specific issues:
- [CDP Discord](https://discord.gg/cdp)
- [CDP Documentation](https://docs.cdp.coinbase.com/)

For platform issues:
- Open GitHub issue
- Check troubleshooting guide

---

Built with x402 payment protocol by Coinbase 🚀

