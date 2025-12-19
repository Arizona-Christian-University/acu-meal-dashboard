# Deploy to Cloudflare Pages NOW

## Your dashboard is ready to deploy!

**GitHub Repository:** https://github.com/Arizona-Christian-University/acu-meal-dashboard

---

## Step-by-Step Deployment (5 minutes)

### 1. Go to Cloudflare Pages

Visit: https://dash.cloudflare.com/ → **Workers & Pages**

### 2. Create New Pages Project

1. Click **Create Application**
2. Select **Pages** tab
3. Click **Connect to Git**

### 3. Connect GitHub Repository

1. If prompted, authorize Cloudflare to access GitHub
2. Select: **Arizona-Christian-University/acu-meal-dashboard**
3. Click **Begin setup**

### 4. Configure Build Settings

Use these EXACT settings:

```
Project name: acu-meal-dashboard
Production branch: main
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
```

### 5. Set Environment Variables (CRITICAL!)

Click **Environment variables** and add these 3 variables:

| Variable Name | Production Value | Preview Value |
|---------------|------------------|---------------|
| `DASHBOARD_PASSWORD` | `YourSecurePassword123!` | same |
| `SESSION_SECRET` | (generate below) | same |
| `NODE_ENV` | `production` | `production` |

**To generate SESSION_SECRET**, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as SESSION_SECRET value.

### 6. Deploy!

1. Click **Save and Deploy**
2. Wait 2-5 minutes for build to complete
3. You'll get a URL like: `https://acu-meal-dashboard.pages.dev`

---

## After Deployment

### Test Your Dashboard

1. Visit your Cloudflare Pages URL
2. You should see the login page
3. Enter the password you set in `DASHBOARD_PASSWORD`
4. Verify data loads correctly

### Set Up Custom Domain (Optional)

1. In Cloudflare Pages project, go to **Custom Domains**
2. Click **Set up a custom domain**
3. Enter: `meals.arizonachristian.edu` (or your preferred domain)
4. Follow DNS configuration instructions

### Update Password Anytime

1. Go to your Cloudflare Pages project
2. **Settings** → **Environment variables**
3. Edit `DASHBOARD_PASSWORD`
4. Click **Save**
5. Go to **Deployments** → **View build** → **Retry deployment**

---

## Important Security Notes

✅ **Change the password!** Don't use the default or example passwords

✅ **Keep SESSION_SECRET secure** - it should be 64+ characters of random hex

✅ **Document who has access** - Only share password with authorized staff

✅ **Use HTTPS** - Cloudflare provides this automatically

---

## Troubleshooting

### Build Fails

**Check build logs** in Cloudflare:
- Go to **Deployments** → Click on failed deployment → View build logs

Common fixes:
- Verify all 3 environment variables are set
- Make sure `NODE_ENV` is set to `production`
- Check that build command is `npm run build`

### Login Not Working

- Clear browser cookies
- Verify `DASHBOARD_PASSWORD` is set correctly (case-sensitive!)
- Check browser console for errors (F12)

### Data Not Loading

- Verify CSV files are in the GitHub repository under `Data/` directory
- Check file names match exactly (case-sensitive)
- Look at browser Network tab (F12) for API errors

---

## Your Deployment URLs

Once deployed, update these:

- **Production URL:** `https://acu-meal-dashboard.pages.dev`
- **Custom Domain:** `https://meals.arizonachristian.edu` (if configured)

---

## Next Steps

After successful deployment:

1. ✅ Test login with your password
2. ✅ Verify data loads correctly
3. ✅ Set up custom domain (optional but recommended)
4. ✅ Share password securely with authorized university staff
5. ✅ Bookmark the dashboard URL
6. ✅ Set up monitoring/alerts in Cloudflare

---

**Ready to deploy? Go to:** https://dash.cloudflare.com/

**Need help?** Check the full deployment guide in `DEPLOYMENT.md`
