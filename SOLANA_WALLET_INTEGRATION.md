# 🔐 Solana Wallet Integration Guide

Complete guide for Solana wallet integration with x402 payments.

## ✅ Integrated Wallets

The platform now supports all major Solana wallets:

### 🦊 Phantom
- Most popular Solana wallet
- Browser extension & mobile app
- Download: https://phantom.app/

### ☀️ Solflare
- Feature-rich Solana wallet
- Browser extension & mobile app
- Download: https://solflare.com/

### 🔵 Torus
- Social login wallet
- No extension needed
- Built-in support

### 🔐 Ledger
- Hardware wallet support
- Maximum security
- Connect via USB

## 🎯 How It Works

### 1. User Connects Wallet
```typescript
// Component automatically shows wallet selector
<WalletMultiButton />

// User can choose from:
// - Phantom
// - Solflare  
// - Torus
// - Ledger
// - More...
```

### 2. Wallet Provides Public Key
```typescript
const { publicKey, connected } = useWallet();

if (connected && publicKey) {
  const address = publicKey.toBase58();
  // Use for x402 payments
}
```

### 3. x402 Payment Flow
```typescript
// 1. User initiates action (create presale/invest)
// 2. Platform returns 402 Payment Required
// 3. Payment instructions include wallet address
// 4. User pays via their Solana wallet
// 5. Platform verifies via x402 facilitator
// 6. Action completes
```

## 📱 Supported Platforms

### Desktop
- ✅ Chrome/Brave/Edge with wallet extension
- ✅ Firefox with wallet extension
- ✅ Safari with wallet extension

### Mobile
- ✅ Phantom mobile browser
- ✅ Solflare mobile browser
- ✅ Wallet Connect integration

## 🔧 Installation for Users

### For Investors/Users

1. **Install Phantom (Recommended)**
   - Go to https://phantom.app/
   - Download browser extension
   - Create or import wallet
   - Fund with SOL & USDC

2. **Alternative: Solflare**
   - Go to https://solflare.com/
   - Install extension
   - Set up wallet
   - Add funds

### For Testing (Devnet)

1. Install Phantom
2. Go to Settings → "Change Network" → Select "Devnet"
3. Get free SOL: https://solfaucet.com/
4. Get devnet USDC from faucet

### For Production (Mainnet)

1. Keep wallet on "Mainnet Beta"
2. Buy SOL from exchange
3. Transfer to wallet
4. Swap some SOL for USDC (on Jupiter, Raydium, etc.)

## 💰 Token Requirements

### For Investors

**To invest in presales:**
- USDC (investment amount)
- ~0.001 SOL (transaction fees)

**Example:**
- Want to invest $100?
- Need: $100 USDC + $0.05 SOL for fees

### For Project Teams

**To create presale:**
- 100 USDC (creation fee)
- ~0.001 SOL (transaction fees)

## 🔄 Wallet Connection Flow

### On Landing Page
```
1. User clicks "Connect Wallet"
2. Modal shows available wallets
3. User selects wallet (e.g., Phantom)
4. Wallet prompts for approval
5. User approves
6. Connected! Public key available
```

### On Create Presale Page
```
1. User fills presale details
2. Must connect wallet to continue
3. Clicks "Pay 100 USDC & Create"
4. Gets x402 payment instructions
5. Wallet prompts for USDC payment
6. User approves transaction
7. Platform verifies payment
8. Presale created!
```

### On Investment Page
```
1. User browses presale
2. Enters investment amount
3. Connects wallet
4. Clicks "Invest with x402"
5. Gets payment instructions
6. Wallet prompts for payment
7. User approves
8. Investment recorded in escrow
```

## 🎨 UI Components

### Wallet Button
```tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

<WalletMultiButton />
```

**States:**
- Not connected: "Select Wallet"
- Connected: Shows address (e.g., "7xKX...gAsU")
- Clicking when connected: Disconnect/Copy Address

### Custom Integration
```tsx
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey, connected, connecting } = useWallet();

  if (connecting) return <div>Connecting...</div>;
  if (!connected) return <div>Please connect wallet</div>;
  
  return <div>Connected: {publicKey?.toBase58()}</div>;
}
```

## 🔐 Security Features

### Automatic Features

**Transaction Approval**
- User must approve each transaction
- No automatic spending
- Amount clearly shown

**Network Detection**
- Wallet shows which network (devnet/mainnet)
- Prevents wrong network transactions

**Connection Permissions**
- Website can only see public key
- Cannot access private keys
- Cannot initiate transactions without approval

### Best Practices for Users

1. ✅ **Verify Website**
   - Check URL is correct
   - Look for HTTPS
   - Bookmark official site

2. ✅ **Review Transactions**
   - Check recipient address
   - Verify amount
   - Confirm network

3. ✅ **Secure Wallet**
   - Use strong password
   - Backup seed phrase
   - Never share private keys

4. ✅ **Test Small First**
   - Start with small amount
   - Verify it works
   - Then invest more

## 📊 Network Configuration

### Environment Variables
```env
# Devnet
NEXT_PUBLIC_NETWORK="devnet"
NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com"

# Mainnet
NEXT_PUBLIC_NETWORK="mainnet-beta"
NEXT_PUBLIC_RPC_URL="https://api.mainnet-beta.solana.com"
```

### Automatic Network Detection
```typescript
const network = process.env.NEXT_PUBLIC_NETWORK;
// Wallets automatically use correct network
```

## 🧪 Testing

### Test Wallet Connection

1. **Start Platform**
```bash
npm run dev
```

2. **Install Phantom**
   - Browser extension

3. **Switch to Devnet**
   - Phantom Settings → Network → Devnet

4. **Get Devnet Funds**
   - https://solfaucet.com/

5. **Test Connection**
   - Visit http://localhost:3000
   - Click "Connect Wallet"
   - Select Phantom
   - Approve connection
   - Should see address in navbar

### Test Payment Flow

1. **Go to Create Presale**
2. Fill in details
3. Click "Pay 100 USDC & Create"
4. Wallet should prompt for payment
5. (On devnet, can use test USDC)

## 🐛 Troubleshooting

### "Wallet not detected"
```
Solution: Make sure wallet extension is installed and enabled
- Check browser extensions
- Refresh page
- Try different browser
```

### "Wrong network"
```
Solution: Switch wallet to correct network
- Phantom: Settings → Change Network
- Solflare: Settings → Network
- Select "Devnet" for testing or "Mainnet Beta" for production
```

### "Transaction failed"
```
Solution: Check wallet has enough SOL for fees
- Need ~0.001 SOL per transaction
- Get more SOL if balance low
```

### "Insufficient funds"
```
Solution: 
- For investing: Need USDC + small SOL for fees
- For creating: Need 100 USDC + small SOL
- Swap SOL for USDC if needed
```

## 🔗 Resources

**Wallets:**
- Phantom: https://phantom.app/
- Solflare: https://solflare.com/
- Ledger: https://www.ledger.com/

**Get USDC:**
- Jupiter: https://jup.ag/ (Swap SOL → USDC)
- Raydium: https://raydium.io/
- Buy directly: Moonpay, Ramp

**Devnet Faucets:**
- SOL: https://solfaucet.com/
- USDC: https://spl-token-faucet.com/

**Documentation:**
- Solana Wallet Adapter: https://github.com/solana-labs/wallet-adapter
- Solana Docs: https://docs.solana.com/

## ✨ Features

✅ **Multi-Wallet Support** - Phantom, Solflare, Torus, Ledger
✅ **Auto Network Detection** - Devnet/Mainnet
✅ **Transaction Approval** - User must approve each payment
✅ **Address Display** - Shows connected wallet
✅ **Disconnect Option** - Easy to switch wallets
✅ **Mobile Support** - Works on wallet mobile browsers
✅ **x402 Integration** - Seamless payment flow

---

**Your platform now supports real Solana wallets with x402 payments!** 🚀⚡

