# Cloudflare Pages - Quick Start

## 5-Minute Deployment Guide

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "ACU Meal Dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Create Cloudflare Pages Project

1. Visit https://dash.cloudflare.com/
2. **Workers & Pages** → **Create Application** → **Pages**
3. Connect your GitHub repository
4. Use these settings:
   - **Build command**: `npm run pages:build`
   - **Build output**: `.vercel/output/static`

### 3. Add Environment Variables (IMPORTANT!)

Add these in the Environment Variables section:

```
DASHBOARD_PASSWORD = YourSecurePassword123!
SESSION_SECRET = (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV = production
```

### 4. Deploy

Click **Save and Deploy**

### 5. Access

Your dashboard will be at: `https://YOUR_PROJECT.pages.dev`

Login with the password you set in `DASHBOARD_PASSWORD`.

---

## Testing Locally First

```bash
# Start development server
npm run dev

# Visit http://localhost:3001/login
# Default password: ACU2025Dashboard! (from .env.local)
```

## Update Data

Just update CSV files in `Data/` folder and push:

```bash
git add Data/
git commit -m "Update data"
git push
```

Cloudflare auto-deploys on push!

## Change Password

**Via Cloudflare Dashboard:**
1. Project → Settings → Environment Variables
2. Edit `DASHBOARD_PASSWORD`
3. Redeploy

**Via CLI:**
```bash
wrangler pages secret put DASHBOARD_PASSWORD
```

## Custom Domain

1. Project → Custom Domains
2. Add your domain
3. Update DNS records as instructed

---

**Default Login Credentials for Local Testing:**
- Password: `ACU2025Dashboard!` (change in `.env.local`)

**Remember:** Change both `DASHBOARD_PASSWORD` and `SESSION_SECRET` to secure values before deploying to production!
