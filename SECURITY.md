# Security Documentation

## Authentication System

The ACU Meal Accounting Dashboard uses a secure, session-based authentication system to protect sensitive student meal data.

### How It Works

1. **Login Page** (`/login`)
   - User enters password
   - Password is sent securely to server via HTTPS
   - Server validates against `DASHBOARD_PASSWORD` environment variable

2. **Session Management** (using iron-session)
   - Successful login creates encrypted session cookie
   - Cookie is httpOnly (not accessible via JavaScript)
   - Cookie is secure (HTTPS only in production)
   - Session expires after 24 hours
   - Uses `SESSION_SECRET` to encrypt session data

3. **Middleware Protection** (`middleware.ts`)
   - All routes except `/login` and `/api/auth/*` are protected
   - Unauthenticated users are redirected to login page
   - Session is validated on every request

4. **Logout**
   - Destroys session cookie
   - Redirects to login page

## Security Features

### ✅ Implemented

- **Password Protection**: Single shared password for authorized users
- **Encrypted Sessions**: iron-session provides strong encryption
- **HTTP-only Cookies**: Prevents XSS attacks
- **Secure Cookies**: HTTPS-only in production
- **Automatic HTTPS**: Cloudflare provides SSL certificate
- **Session Expiration**: 24-hour timeout
- **No Credentials in Code**: All secrets in environment variables
- **CSRF Protection**: Built into Next.js forms

### Environment Variables

Two critical secrets must be set:

1. **DASHBOARD_PASSWORD**
   - The shared login password
   - Should be strong and unique
   - Minimum 12 characters recommended
   - Example: `ACU_Meals_2025!SecurePass`

2. **SESSION_SECRET**
   - Used to encrypt session cookies
   - Must be at least 32 characters
   - Should be random and unguessable
   - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Best Practices

#### For Local Development

1. Use `.env.local` for local secrets
2. Never commit `.env.local` to git
3. Use different passwords than production
4. Test logout functionality regularly

#### For Production

1. **Strong Password**
   ```
   ✅ Good: M3@lD@t@_ACU_2025!Secure
   ❌ Bad: password123
   ```

2. **Secure SESSION_SECRET**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Regular Rotation**
   - Change `DASHBOARD_PASSWORD` quarterly
   - Change `SESSION_SECRET` when team members leave
   - Document password changes securely

4. **Access Control**
   - Only share password with authorized personnel
   - Use password manager for storage
   - Never send password via email
   - Consider using Cloudflare Access for IP restrictions

## Data Security

### Sensitive Data in Dashboard

The dashboard displays:
- Student names and IDs
- Meal plan information
- Transaction history
- Demographic data
- Financial information (flex dollars)

### Data Protection Measures

1. **At Rest**
   - Data files stored in private GitHub repository
   - Access controlled via GitHub permissions
   - No sensitive data in public repositories

2. **In Transit**
   - All connections use HTTPS
   - Cloudflare provides DDoS protection
   - Encrypted communication throughout

3. **At Runtime**
   - Data processed server-side
   - No sensitive data in client-side JavaScript
   - Sessions encrypted with iron-session

### Compliance Considerations

**FERPA (Family Educational Rights and Privacy Act)**
- Dashboard displays student education records
- Ensure only authorized staff have access
- Document who has the password
- Log access if required by institution policy

**Data Minimization**
- Only load necessary data
- Consider filtering personally identifiable information
- Implement role-based access if needed

## Threat Model

### Protected Against

✅ **Unauthorized Access**
- Middleware blocks unauthenticated requests
- All routes except login require valid session

✅ **Session Hijacking**
- HttpOnly cookies prevent JavaScript access
- Secure cookies require HTTPS
- Sessions expire after 24 hours

✅ **Man-in-the-Middle**
- HTTPS enforced by Cloudflare
- Secure cookie flag in production

✅ **XSS (Cross-Site Scripting)**
- React automatically escapes output
- HttpOnly cookies not accessible to scripts

### Additional Considerations

⚠️ **Brute Force Attacks**
- Current implementation has no rate limiting
- Consider adding after failed login attempts
- Cloudflare can provide WAF rules for this

⚠️ **Shared Password**
- Single password means no individual accountability
- Consider implementing individual user accounts for audit requirements
- Future enhancement: integrate with university SSO

⚠️ **Session Fixation**
- Sessions regenerated on login
- But consider implementing session ID rotation

## Recommended Enhancements

### Short Term (Nice to Have)

1. **Rate Limiting**
   ```typescript
   // Add to login route
   const loginAttempts = new Map();
   if (loginAttempts.get(ip) > 5) {
     return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
   }
   ```

2. **Audit Logging**
   - Log successful logins
   - Log failed login attempts
   - Log data access patterns
   - Store in Cloudflare Analytics or external service

3. **Session Activity Timeout**
   - Auto-logout after 30 minutes of inactivity
   - Warning before timeout

### Long Term (For Future)

1. **Multi-User System**
   - Individual user accounts
   - Role-based access control (admin, viewer)
   - Activity logging per user

2. **SSO Integration**
   - Integrate with university Azure AD / Okta
   - Use existing institutional credentials
   - Automatic access revocation

3. **IP Whitelisting**
   - Restrict access to campus network
   - Use Cloudflare Access for IP-based rules
   - VPN requirement for remote access

4. **Two-Factor Authentication**
   - Add 2FA for additional security
   - Use TOTP (Google Authenticator, Authy)

## Incident Response

### If Password is Compromised

1. **Immediate Actions**
   ```bash
   # Change password via Cloudflare Dashboard
   # Or via CLI:
   wrangler pages secret put DASHBOARD_PASSWORD
   ```

2. **Rotate Session Secret**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Update in Cloudflare
   wrangler pages secret put SESSION_SECRET
   ```

3. **Notify Users**
   - Inform authorized users of password change
   - Distribute new password securely

4. **Review Access Logs**
   - Check Cloudflare Analytics for unusual activity
   - Look for unauthorized access patterns

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security contact: [your-security-email@arizonachristian.edu]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

## Security Checklist

### Before Production Deployment

- [ ] Changed `DASHBOARD_PASSWORD` from default
- [ ] Generated random `SESSION_SECRET` (32+ characters)
- [ ] Verified HTTPS is enabled
- [ ] Tested login/logout functionality
- [ ] Confirmed session expiration works
- [ ] Removed any debug/console.log statements
- [ ] Set `NODE_ENV=production`
- [ ] Verified data files are not publicly accessible
- [ ] Documented who has access to password
- [ ] Set up monitoring/alerts in Cloudflare

### Regular Maintenance

- [ ] Review access logs monthly
- [ ] Rotate password quarterly
- [ ] Update dependencies for security patches
- [ ] Review and update this security documentation
- [ ] Test disaster recovery process

## Contact

**Security Officer**: [Your Name/Title]
**Email**: [security@arizonachristian.edu]
**Last Security Review**: 2025-12-19

---

**Remember**: Security is an ongoing process. Regularly review and update these measures as threats evolve and the application grows.
