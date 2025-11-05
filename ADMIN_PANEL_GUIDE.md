# 🔐 Admin Panel Guide

Complete guide for using the admin panel to manage presales.

## 🎯 Access Admin Panel

**URL**: http://localhost:3000/admin (or https://yourapp.com/admin)

**Default Password**: Set in `.env` file
```env
ADMIN_PASSWORD="your-secure-password"
```

---

## 🔑 Login

1. Navigate to `/admin`
2. Enter admin password
3. Click "Login"
4. Access granted!

**Security Notes:**
- Password is required every session
- Use strong password in production
- Change default password before deploying
- Store securely (password manager)

---

## 📊 Dashboard Overview

### Platform Statistics

**Top Stats:**
- **Total Presales** - All presales created
- **Active Presales** - Currently accepting investments
- **Total Raised** - Sum of all funds raised
- **Total Investors** - Unique investor count

### Presale Table

Columns:
- **Project** - Name and ticker
- **Status** - Current status (dropdown)
- **Raised** - Amount raised so far
- **Hard Cap** - Target amount
- **Investors** - Number of investors
- **Featured** - Toggle featured status
- **Actions** - View presale details

---

## 🎛️ Presale Management

### Filter Presales

**Filter Buttons:**
- **All** - Show all presales
- **Draft** - Pending approval
- **Active** - Currently raising funds
- **Funded** - Reached hard cap
- **Failed** - Did not reach soft cap
- **Completed** - Successfully finished

### Change Presale Status

**Available Statuses:**
1. **DRAFT** - Created but not approved
2. **ACTIVE** - Approved and accepting investments
3. **FUNDED** - Reached funding goal
4. **FAILED** - Did not meet requirements
5. **COMPLETED** - Successfully finished
6. **CANCELLED** - Cancelled by admin

**How to Change:**
1. Find presale in table
2. Click status dropdown
3. Select new status
4. Auto-saves on selection

### Toggle Featured Status

**Featured Presales:**
- Show on homepage
- Get more visibility
- Limited to best projects

**How to Feature:**
1. Find presale in table
2. Click "Featured" button
3. Toggles between "⭐ Yes" and "No"
4. Auto-saves

---

## 🔄 Presale Workflow

### 1. New Presale Submitted (DRAFT)

**When creator submits:**
- Status: DRAFT
- Paid $100 USDC creation fee
- Awaiting admin review

**Admin Actions:**
1. Review project details
2. Check team legitimacy
3. Verify tokenomics
4. Decide: Approve or Reject

**To Approve:**
- Change status to "ACTIVE"
- Presale now visible to investors

**To Reject:**
- Change status to "CANCELLED"
- Consider refunding creation fee

### 2. Active Presale

**Status:** ACTIVE
- Accepting investments
- Funds going to escrow
- Progress tracked

**Admin Monitoring:**
- Watch raised amount
- Monitor investor count
- Check for issues
- Verify transactions

### 3. Presale Reaches Goal

**When hard cap reached:**
- Manual: Change status to "FUNDED"
- Or wait until end date

**Status:** FUNDED
- No more investments accepted
- Team can start work
- Milestones begin

### 4. Release Funds

**See:** Escrow Management section

### 5. Presale Fails

**If soft cap not reached:**
- Change status to "FAILED"
- Trigger refunds
- Notify investors

---

## 💰 Escrow Management

### View Escrow Balance

**API Endpoint:**
```
GET /api/admin/escrow?presaleId=xxx
```

**Returns:**
- Current balance
- Expected balance
- Discrepancy (if any)

### Release Funds to Team

**Prerequisites:**
- Presale status: FUNDED
- Milestone completed (if applicable)

**API Endpoint:**
```
POST /api/admin/escrow/release
Body: {
  presaleId: "xxx",
  milestoneId: "yyy" (optional)
}
```

**What Happens:**
1. Calculates release amount
2. Deducts platform fee (2.5%)
3. Sends to team wallet
4. Records transaction
5. Updates milestone status

**Security:**
- Requires admin authentication
- Verifies presale status
- Checks milestone completion
- Records all transactions

### Process Refunds

**When presale fails:**

**API Endpoint:**
```
POST /api/admin/refund
Body: {
  presaleId: "xxx"
}
```

**What Happens:**
1. Changes status to FAILED
2. Loops through all investors
3. Refunds each investment
4. Records refund transactions
5. Updates investment status

**Automatic:**
- Refunds all investors
- Full amount returned
- On-chain transactions
- Recorded in database

---

## 📋 Admin Tasks

### Daily Tasks

1. **Review New Presales**
   - Filter: "Draft"
   - Review submissions
   - Approve/reject

2. **Monitor Active Presales**
   - Filter: "Active"
   - Check progress
   - Watch for issues

3. **Check Escrow Balance**
   - Verify funds match records
   - Investigate discrepancies

### Weekly Tasks

1. **Release Milestone Funds**
   - Review milestone claims
   - Verify completion
   - Release funds

2. **Handle Failed Presales**
   - Process refunds
   - Update status
   - Notify teams

3. **Update Featured Presales**
   - Promote good projects
   - Remove completed ones

### Monthly Tasks

1. **Platform Statistics**
   - Review performance
   - Analyze success rates
   - Identify trends

2. **Fee Collection**
   - Calculate total fees
   - Verify collection
   - Financial reporting

---

## 🔐 Security Features

### Authentication
- Password-protected
- Session-based
- Logout option

### Transaction Safety
- All escrow operations recorded
- On-chain verification
- Audit trail

### Access Control
- Only admin can change status
- Only admin can release funds
- Only admin can feature presales

---

## 🎯 Best Practices

### Presale Approval

**✅ Approve if:**
- Legitimate team
- Clear project plan
- Reasonable tokenomics
- Complete information
- Professional presentation

**❌ Reject if:**
- Suspicious activity
- Incomplete information
- Unrealistic promises
- Duplicate project
- Compliance issues

### Fund Release

**✅ Release when:**
- Milestone clearly completed
- Evidence provided
- Presale succeeded
- Reasonable timeframe

**⚠️ Hold if:**
- Milestone unclear
- Team unresponsive
- Investor complaints
- Suspicious activity

### Refund Processing

**Process refunds when:**
- Soft cap not reached
- End date passed
- Team abandons project
- Compliance issues

**Timeline:**
- Process within 24-48 hours
- Communicate with investors
- Verify all refunds sent

---

## 📊 Analytics Dashboard

### Key Metrics

**Success Rate:**
```
Completed Presales / Total Presales × 100
```

**Average Raise:**
```
Total Raised / Number of Presales
```

**Platform Revenue:**
```
Creation Fees + (2.5% × Total Successful Raises)
```

### Monitoring

**Watch for:**
- Unusual activity
- Failed transactions
- Investor complaints
- Low success rates

---

## 🆘 Common Issues

### "Presale stuck in DRAFT"
**Solution:** Change status to ACTIVE to approve

### "Funds not releasing"
**Solution:**
- Check presale status is FUNDED
- Verify milestone completed
- Check wallet has SOL for fees
- Review transaction logs

### "Refund failed"
**Solution:**
- Check platform wallet balance
- Verify investor addresses
- Retry individual refunds
- Contact support if persistent

### "Can't access admin panel"
**Solution:**
- Check ADMIN_PASSWORD in .env
- Clear browser session
- Verify URL is correct (/admin)

---

## 🔄 API Endpoints

### Get All Presales
```
GET /api/presales?status=DRAFT&limit=100
```

### Update Presale
```
PATCH /api/presales/{id}
Body: { status: "ACTIVE" }
```

### Get Escrow Info
```
GET /api/admin/escrow?presaleId={id}
```

### Release Funds
```
POST /api/admin/escrow/release
Body: { presaleId: "xxx", milestoneId: "yyy" }
```

### Process Refunds
```
POST /api/admin/refund
Body: { presaleId: "xxx" }
```

---

## 📱 Mobile Access

Admin panel is responsive:
- ✅ Works on mobile browsers
- ✅ Touch-friendly buttons
- ✅ Responsive table
- ✅ Full functionality

---

## 🎓 Quick Reference

**Login:** `/admin`
**Password:** `.env` → `ADMIN_PASSWORD`

**Quick Actions:**
- Approve: Status → ACTIVE
- Featured: Click featured button
- Release: `/api/admin/escrow/release`
- Refund: `/api/admin/refund`

**Filter Shortcuts:**
- New presales: Click "Draft"
- Active fundraising: Click "Active"
- Ready to release: Click "Funded"
- Need refunds: Click "Failed"

---

## ✅ Admin Checklist

**Before Approving Presale:**
- [ ] Reviewed project details
- [ ] Verified team identity
- [ ] Checked tokenomics
- [ ] Confirmed payment received
- [ ] Set featured status (if applicable)

**Before Releasing Funds:**
- [ ] Milestone completed
- [ ] Evidence reviewed
- [ ] Presale status is FUNDED
- [ ] Platform wallet has SOL
- [ ] Transaction recorded

**After Presale Completes:**
- [ ] All funds released OR refunded
- [ ] Status updated to COMPLETED
- [ ] Transactions verified on-chain
- [ ] Platform fees collected
- [ ] Remove from featured (if listed)

---

**The admin panel is your control center for managing the entire platform!** 🎛️

All admin operations are secure, logged, and verifiable on-chain. 🔐







