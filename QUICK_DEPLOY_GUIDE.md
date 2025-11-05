# 🚀 Quick Deploy Guide - 5 Minutes to Production

Get your x402 presale platform live in 5 minutes!

---

## ⚡ Super Quick Deploy (If you have everything ready)

### 1. Push to GitHub (1 minute)
```bash
cd presale-platform
git init
git add .
git commit -m "Deploy x402 presale platform"
git remote add origin https://github.com/YOURUSERNAME/presale-platform.git
git push -u origin main
```

### 2. Setup Supabase Database (2 minutes)
1. Go to https://supabase.com → New Project
2. Name: `presale-platform-db`
3. Set password (save it!)
4. Wait for setup
5. **Settings** → **Database** → **Connection pooling** (Transaction mode)
6. Copy connection string:
```
postgresql://postgres.XXX:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 3. Deploy on Render (2 minutes)
1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `x402-presale`
   - **Build**: `npm install && npx prisma generate && npm run build`
   - **Start**: `npm start`
4. **Add Environment Variables**:
   ```
   DATABASE_URL=your-supabase-connection-string
   NODE_ENV=production
   NEXT_PUBLIC_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_ADMIN_PASSWORD=your-password
   PLATFORM_WALLET_PRIVATE_KEY=your-wallet-key
   NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=your-public-key
   ```
5. Click **Create Web Service**

### 4. Initialize Database (30 seconds)
After deploy succeeds:
1. Click **Shell** tab in Render
2. Run: `npx prisma db push`
3. Done! ✅

---

## 🎯 Your Platform is Live!

Visit: `https://x402-presale.onrender.com`

### First Steps:
1. ✅ Connect your Solana wallet
2. ✅ Go to `/admin` and login
3. ✅ Test creating a presale
4. ✅ Share with users!

---

## 📋 Environment Variables Checklist

Copy these exact values into Render:

```env
# Required (from Supabase)
DATABASE_URL=postgresql://postgres.yourproject:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Required (basic setup)
NODE_ENV=production
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com

# Required (your custom values)
NEXT_PUBLIC_ADMIN_PASSWORD=aranha09
PLATFORM_WALLET_PRIVATE_KEY=your-base64-key-from-wallets-folder
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=YourSolanaPublicKey123

# Optional (customize)
NEXT_PUBLIC_CREATION_FEE=10
```

---

## 🔥 One-Click Deploy (Alternative)

Use our `render.yaml` blueprint:

1. Fork repository on GitHub
2. Go to https://render.com
3. Click **New** → **Blueprint**
4. Connect repo with `render.yaml`
5. Set secret environment variables
6. Click **Apply**
7. Run `npx prisma db push` in Shell

Done! 🎉

---

## ⚠️ Important Notes

### 🐌 First Load (Free Tier)
- First visit takes **30-50 seconds** (cold start)
- After 15 min inactivity, spins down
- **Solution**: Upgrade to Starter plan ($7/month)

### 🔐 Security
- ✅ HTTPS enabled automatically
- ✅ Environment variables encrypted
- ✅ Database password required
- ⚠️ Change default admin password!

### 💾 Database
- ✅ Supabase auto-backups daily
- ✅ Free tier: 500MB (enough for testing)
- ✅ Connection pooling enabled

### 🌐 Custom Domain
1. Render → Settings → Custom Domain
2. Add: `presale.yourdomain.com`
3. Create CNAME record in your DNS
4. Wait 5-30 minutes

---

## 🐛 Quick Troubleshooting

### "Build Failed"
```bash
# Test locally first
npm install
npm run build
```

### "Database Connection Error"
- ✅ Use **Connection pooling** URL (port 6543)
- ✅ Replace `[YOUR-PASSWORD]` with actual password
- ✅ Username format: `postgres.yourprojectref`

### "Admin Login Failed"
- ✅ Use `NEXT_PUBLIC_ADMIN_PASSWORD` (not `ADMIN_PASSWORD`)
- ✅ Clear cache & redeploy after changing env vars

### "Wallet Not Connecting"
- ✅ Check browser console for errors
- ✅ Make sure using mainnet wallet
- ✅ Try different wallet (Phantom, Solflare)

---

## 📊 Monitor Your App

### View Logs
Render Dashboard → Your Service → **Logs** tab

### View Metrics  
Render Dashboard → Your Service → **Metrics** tab

### Database Admin
Supabase Dashboard → Your Project → **Table Editor**

---

## 🚀 Production Ready?

Before accepting real money:

- [ ] Test presale creation with real wallet
- [ ] Test investment flow end-to-end  
- [ ] Verify escrow wallet has correct keys
- [ ] Use premium RPC (Helius/QuickNode)
- [ ] Upgrade to paid Render plan
- [ ] Set strong admin password
- [ ] Add custom domain
- [ ] Monitor for 24 hours
- [ ] Set up error tracking (optional)

---

## 💰 Costs

**Testing**: $0/month (free tiers)

**Production**: $7-12/month
- Render Starter: $7/month
- Supabase: Free (or $25/month Pro)
- RPC: Free (or $5-50/month premium)

---

## 🆘 Need Help?

1. **Check logs** in Render Dashboard
2. **Test locally** first: `npm run dev`
3. **Verify env vars** are set correctly
4. **Check database** connection in Supabase

Common commands in Render Shell:
```bash
npx prisma db push      # Initialize database
npx prisma generate     # Regenerate Prisma client
npm run build          # Test build
```

---

## ✅ Success!

Your platform should now be live at:
`https://x402-presale.onrender.com`

Start accepting presales and grow your platform! 🎉

For detailed instructions, see: **RENDER_DEPLOYMENT.md**







