# Deploy x402 Presale Platform on Render

Complete guide to deploy your Solana presale platform on Render.

## 📋 Prerequisites

- GitHub account with your code pushed to a repository
- Render account (sign up at https://render.com)
- Supabase account for PostgreSQL database (or use Render PostgreSQL)

---

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Using Supabase (Recommended - Free Tier Available)

1. **Go to Supabase** (https://supabase.com)
2. **Create a new project**:
   - Click "New Project"
   - Choose organization
   - Set project name: `presale-platform-db`
   - Set a strong database password (save this!)
   - Choose region closest to you
   - Click "Create new project"

3. **Get Connection String**:
   - Wait for project to finish setting up (~2 minutes)
   - Go to **Settings** → **Database**
   - Scroll to **Connection string** section
   - **IMPORTANT**: Use **Connection pooling** (Transaction mode)
   - Copy the connection string that looks like:
   ```
   postgresql://postgres.yourprojectref:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   - Replace `[YOUR-PASSWORD]` with your actual database password

4. **Save this connection string** - you'll need it for Render!

### Option B: Using Render PostgreSQL

1. In Render dashboard, click **New** → **PostgreSQL**
2. Set name: `presale-platform-db`
3. Choose **Free** tier (or paid for production)
4. Click **Create Database**
5. Wait for creation, then copy the **Internal Database URL**

---

## 🚀 Step 2: Deploy Web Service on Render

### 2.1 Push Your Code to GitHub

```bash
cd presale-platform
git init
git add .
git commit -m "Initial commit - x402 presale platform"
git branch -M main
git remote add origin https://github.com/yourusername/presale-platform.git
git push -u origin main
```

### 2.2 Create Web Service on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **Web Service**
3. **Connect your GitHub repository**:
   - Click "Connect account" if not connected
   - Search for your `presale-platform` repository
   - Click "Connect"

4. **Configure Web Service**:

   | Setting | Value |
   |---------|-------|
   | **Name** | `x402-presale-platform` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Root Directory** | Leave empty (or `presale-platform` if it's in subfolder) |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | Free (or paid for production) |

5. **Click "Advanced"** to add environment variables

---

## 🔐 Step 3: Configure Environment Variables

Click **"Add Environment Variable"** and add each of these:

### Required Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | Your Supabase/Render connection string | PostgreSQL connection |
| `NODE_ENV` | `production` | Production environment |
| `NEXT_PUBLIC_NETWORK` | `mainnet-beta` | Solana network |
| `NEXT_PUBLIC_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | `your-secure-password` | Admin panel password |
| `PLATFORM_WALLET_PRIVATE_KEY` | Your Base64 wallet key | Platform escrow wallet |
| `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS` | Your wallet public key | Platform wallet address |

### Optional Variables (for production):

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_RPC_URL` | `https://your-helius-url.com` | Use Helius/QuickNode for better reliability |
| `NEXT_PUBLIC_CREATION_FEE` | `10` | Fee in USDC to create presale (default: 10) |

### Example Configuration:

```bash
# Database
DATABASE_URL=postgresql://postgres.abcd1234:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Environment
NODE_ENV=production

# Solana Network
NEXT_PUBLIC_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password

# Platform Wallet (from wallets/platform-wallet-base64.txt)
PLATFORM_WALLET_PRIVATE_KEY=your-base64-private-key-here
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=YourPublicKeyHere123456789

# Optional
NEXT_PUBLIC_CREATION_FEE=10
```

---

## 🎯 Step 4: Deploy!

1. **Click "Create Web Service"**
2. Render will start building your app
3. **Watch the logs** - build takes 2-5 minutes
4. Wait for "Deploy succeeded" message

---

## 🔄 Step 5: Initialize Database

After successful deployment, you need to push the database schema:

### Option 1: Using Render Shell (Recommended)

1. In your web service dashboard, click **"Shell"** tab
2. Run these commands:
```bash
npx prisma db push
```

### Option 2: From Your Local Machine

1. Create a `.env.production` file locally:
```bash
DATABASE_URL="your-supabase-connection-string"
```

2. Run Prisma:
```bash
npx prisma db push --schema=./prisma/schema.prisma
```

---

## ✅ Step 6: Verify Deployment

1. **Open your app**: `https://x402-presale-platform.onrender.com`
2. **Test the homepage** - should load without errors
3. **Connect Wallet** - click "Connect Wallet" and connect Phantom/Solflare
4. **Test Admin Panel**:
   - Go to `/admin`
   - Login with your `NEXT_PUBLIC_ADMIN_PASSWORD`
   - Should see empty presales list

---

## 🎨 Step 7: Custom Domain (Optional)

1. In Render dashboard, go to **Settings** → **Custom Domains**
2. Click "Add Custom Domain"
3. Enter your domain: `presale.yourdomain.com`
4. Add the CNAME record to your DNS provider:
   ```
   CNAME: presale.yourdomain.com → x402-presale-platform.onrender.com
   ```
5. Wait for DNS propagation (5-30 minutes)

---

## 🔧 Common Issues & Solutions

### Issue 1: "Build Failed" - Module Not Found

**Solution**: Check `package.json` has all dependencies:
```bash
npm install
npm run build  # Test locally first
```

### Issue 2: "Database Connection Failed"

**Symptoms**: 
- `P1001: Can't reach database server`
- `FATAL: Tenant or user not found`

**Solution**:
- ✅ Use **Connection pooling** URL from Supabase (port 6543)
- ✅ Verify username format: `postgres.yourprojectref`
- ✅ Replace `[YOUR-PASSWORD]` with actual password
- ❌ Don't use Direct connection (port 5432)

**Correct format**:
```
postgresql://postgres.yvcrqjkkukzmjovixzfk:[ACTUAL_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Issue 3: "Prisma Schema Not Found"

**Solution**: Update build command to:
```bash
npm install && npx prisma generate && npm run build
```

### Issue 4: "Environment Variables Not Working"

**Solution**:
- Client-side vars MUST start with `NEXT_PUBLIC_`
- After adding env vars, click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Issue 5: "Application Error" After Deploy

**Check Logs**:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for error messages

**Common fixes**:
- Add `NODE_ENV=production`
- Verify all required env vars are set
- Check database is accessible

### Issue 6: Cold Starts (Free Tier)

**Problem**: Free tier spins down after 15 minutes of inactivity

**Solutions**:
- Upgrade to paid plan ($7/month) for always-on
- Use a uptime monitor (https://uptimerobot.com) to ping your site
- Accept 30-50 second cold start delay

---

## 📊 Monitoring Your App

### View Logs
1. Go to service dashboard
2. Click **"Logs"** tab
3. See real-time application logs

### View Metrics
1. Click **"Metrics"** tab
2. See CPU, Memory, HTTP requests

### Set Up Alerts
1. Go to **Settings** → **Notifications**
2. Add email/Slack for deployment failures

---

## 🔄 Updating Your App

### Auto-Deploy (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Update feature"
git push
```

2. **Render auto-deploys** new commits automatically!

### Manual Deploy

1. Go to service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🚀 Production Checklist

Before going live with real users:

- [ ] **Use paid RPC provider** (Helius, QuickNode) instead of public Solana RPC
- [ ] **Set strong admin password** (20+ characters)
- [ ] **Upgrade Render plan** to Standard ($7/month) for always-on
- [ ] **Set up custom domain** for professional look
- [ ] **Enable HTTPS** (automatic on Render)
- [ ] **Test wallet connections** with Phantom, Solflare, Backpack
- [ ] **Test presale creation flow** end-to-end
- [ ] **Test investment flow** with small amounts
- [ ] **Monitor logs** for first 24 hours
- [ ] **Set up database backups** (automatic on Supabase)
- [ ] **Add error tracking** (Sentry, LogRocket)

---

## 💰 Cost Estimate

### Free Tier (Testing):
- Render Web Service: **Free** (with limitations)
- Supabase Database: **Free** (500MB, good for testing)
- **Total**: $0/month

### Production (Recommended):
- Render Web Service (Starter): **$7/month**
- Supabase Pro: **$25/month** (or keep free if low usage)
- Custom Domain: **$10-15/year**
- RPC Provider (Helius/QuickNode): **$5-50/month** depending on usage
- **Total**: ~$12-82/month

---

## 🆘 Need Help?

### Check Logs First:
```bash
# In Render Shell
npm run build  # Check build errors
npx prisma db push  # Check database errors
```

### Common Commands:
```bash
# Check database connection
npx prisma db pull

# Reset database (CAUTION: deletes all data)
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

---

## 🎉 You're Live!

Once deployed, your platform will be available at:
- **Render URL**: `https://x402-presale-platform.onrender.com`
- **Custom Domain** (if configured): `https://presale.yourdomain.com`

Share the link and start accepting presales! 🚀

---

## 📱 Quick Deploy Summary

For experienced users, here's the TL;DR:

```bash
# 1. Setup Supabase database
# 2. Push to GitHub
git push origin main

# 3. Create Render Web Service:
Build: npm install && npx prisma generate && npm run build
Start: npm start

# 4. Add environment variables (see Step 3)

# 5. After deploy, initialize database:
npx prisma db push

# Done! 🎉
```

