# Cloudflare Pages Deployment Guide

This guide will walk you through deploying the ACU Meal Accounting Dashboard to Cloudflare Pages with password protection.

## Prerequisites

1. A Cloudflare account (free tier works)
2. Git repository with your code (GitHub, GitLab, or Bitbucket)
3. Wrangler CLI installed globally (optional, but recommended)

```bash
npm install -g wrangler
```

## Method 1: Deploy via Cloudflare Dashboard (Recommended for first-time)

### Step 1: Push Code to Git Repository

If you haven't already, initialize a git repository and push to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: ACU Meal Dashboard with authentication"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create Cloudflare Pages Project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Select **Pages** tab
5. Click **Connect to Git**
6. Authorize Cloudflare to access your Git repository
7. Select your repository

### Step 3: Configure Build Settings

In the build configuration page:

- **Project name**: `acu-meal-dashboard` (or your preferred name)
- **Production branch**: `main`
- **Framework preset**: `Next.js`
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`

### Step 4: Set Environment Variables

**CRITICAL:** Before deploying, add these environment variables:

1. Click **Environment Variables** section
2. Add the following variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `DASHBOARD_PASSWORD` | Your secure password | This will be the login password |
| `SESSION_SECRET` | A random 32+ character string | Use a password generator |
| `NODE_ENV` | `production` | Set to production |

**To generate a secure SESSION_SECRET**, you can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Click **Save and Deploy**

### Step 5: Wait for Deployment

Cloudflare will:
1. Clone your repository
2. Install dependencies
3. Build the application
4. Deploy to the edge

This usually takes 2-5 minutes.

### Step 6: Access Your Dashboard

Once deployed, you'll get a URL like:
- `https://acu-meal-dashboard.pages.dev`

Or set up a custom domain:
1. Go to your Pages project
2. Click **Custom Domains**
3. Add your domain (e.g., `dashboard.yourdomain.com`)
4. Follow DNS configuration instructions

## Method 2: Deploy via CLI (Advanced)

### Step 1: Login to Wrangler

```bash
wrangler login
```

### Step 2: Build for Cloudflare

```bash
npm run pages:build
```

### Step 3: Deploy

First deployment (creates the project):
```bash
wrangler pages deploy .vercel/output/static --project-name=acu-meal-dashboard
```

Subsequent deployments:
```bash
npm run pages:deploy
```

### Step 4: Set Environment Variables via CLI

```bash
# Set dashboard password
wrangler pages secret put DASHBOARD_PASSWORD

# Set session secret
wrangler pages secret put SESSION_SECRET

# Set node environment
wrangler pages secret put NODE_ENV
```

When prompted, enter the values for each secret.

## Post-Deployment Configuration

### Set Up Custom Domain

1. In Cloudflare Dashboard, go to your Pages project
2. Navigate to **Custom Domains**
3. Click **Set up a custom domain**
4. Enter your domain (e.g., `meals.arizonachristian.edu`)
5. Follow the DNS configuration instructions:
   - Add a CNAME record pointing to `YOUR_PROJECT.pages.dev`
   - Or add provided DNS records

### Update Password

To change the dashboard password after deployment:

**Via Dashboard:**
1. Go to Workers & Pages → Your Project
2. Settings → Environment Variables
3. Edit `DASHBOARD_PASSWORD`
4. Click **Save**
5. Redeploy (Settings → Deployments → View build → Retry deployment)

**Via CLI:**
```bash
wrangler pages secret put DASHBOARD_PASSWORD --project-name=acu-meal-dashboard
```

## Testing the Deployment

1. Visit your deployment URL
2. You should be redirected to `/login`
3. Enter the password you set in `DASHBOARD_PASSWORD`
4. You should be logged in and see the dashboard
5. Click "Logout" to test logout functionality
6. Verify you're redirected back to login

## Updating Data Files

The current setup requires data files to be in the repository. To update data:

1. Replace CSV files in the `Data/` directory locally
2. Commit and push changes:
   ```bash
   git add Data/
   git commit -m "Update meal data"
   git push
   ```
3. Cloudflare Pages will automatically rebuild and deploy

## Troubleshooting

### Build Fails

**Check build logs** in Cloudflare Dashboard:
- Workers & Pages → Your Project → Deployments → View build

Common issues:
- Missing environment variables
- Node version mismatch
- Dependency installation failures

### Login Not Working

1. Verify `DASHBOARD_PASSWORD` and `SESSION_SECRET` are set
2. Check that both are at least 32 characters long
3. Try clearing browser cookies
4. Check browser console for errors (F12)

### Data Not Loading

1. Verify CSV files are in the `Data/` directory
2. Check file names match exactly:
   - `Atrium Members - Students.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 7 Meals.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 14 Meals.csv`
   - `Atrium Transactions - Student Meals - Fall 2025 - 19 Meals.csv`
   - `Atrium Transactions - Student Flex Dollars - Fall 2025 - Student Flex Dollars (1).csv`
3. Check file encoding (should be UTF-8)

### Performance Issues

If the dashboard is slow:
1. Check data file sizes (very large files may need optimization)
2. Consider implementing pagination for crosstab results
3. Add caching layers if needed

## Security Best Practices

1. **Use Strong Passwords**: Make sure `DASHBOARD_PASSWORD` is complex and unique
2. **Rotate Secrets**: Change `SESSION_SECRET` periodically
3. **Custom Domain**: Use HTTPS (automatic with Cloudflare)
4. **Access Control**: Consider adding IP restrictions in Cloudflare firewall
5. **Audit Logs**: Monitor access in Cloudflare Analytics

## Monitoring and Analytics

### View Usage Stats

1. Cloudflare Dashboard → Your Project
2. Analytics tab shows:
   - Page views
   - Unique visitors
   - Bandwidth usage
   - Geographic distribution

### Set Up Alerts

1. Go to Notifications in Cloudflare Dashboard
2. Create alerts for:
   - Deployment failures
   - High error rates
   - Unusual traffic patterns

## Cost Considerations

**Cloudflare Pages Free Tier:**
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- 1 concurrent build

This should be more than sufficient for a university dashboard with moderate usage.

## Continuous Deployment

Cloudflare Pages automatically deploys when you push to your main branch:

```bash
# Make changes locally
git add .
git commit -m "Update dashboard"
git push origin main

# Cloudflare automatically builds and deploys
```

Preview deployments are created for pull requests automatically.

## Alternative: OpenNext Adapter (Future)

**Note:** The `@cloudflare/next-on-pages` package is deprecated. For future deployments, consider migrating to OpenNext:

https://opennext.js.org/cloudflare

This will require updating the build configuration but offers better Next.js compatibility.

## Support

For issues specific to:
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Dashboard Issues**: Contact your development team

## Backup and Disaster Recovery

### Backup Strategy

1. **Code**: Stored in Git (GitHub/GitLab)
2. **Data**: CSV files in repository
3. **Environment Variables**: Document securely (not in Git!)
4. **Configuration**: All in `wrangler.toml` and repository files

### Recovery Process

If deployment fails or is deleted:
1. Re-connect repository in Cloudflare Dashboard
2. Restore environment variables
3. Redeploy

All builds are versioned, and you can rollback:
1. Go to Deployments
2. Find a previous successful deployment
3. Click "Rollback to this deployment"

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure Cloudflare Analytics
3. Set up monitoring alerts
4. Document password for authorized users
5. Train university leadership on dashboard usage
6. Schedule regular data updates

---

**Deployed URL**: Update this with your production URL after deployment
**Maintained by**: Your Team Name
**Last Updated**: 2025-12-19
