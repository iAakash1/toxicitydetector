# 🚀 ToxiMeter Deployment Guide

This guide covers deploying ToxiMeter to production using Vercel and Neon PostgreSQL.

## 📋 Prerequisites

- GitHub account
- Vercel account
- Neon account (or other PostgreSQL provider)
- Google/GitHub OAuth apps (for authentication)

## 🗄️ Database Setup (Neon)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up and create a new project
   - Note your connection string

2. **Configure Database**
   ```bash
   # Set your production DATABASE_URL
   DATABASE_URL="postgresql://username:password@hostname/dbname?sslmode=require"
   ```

## 🔐 OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized domains and redirect URIs:
   - `https://yourapp.vercel.app`
   - `https://yourapp.vercel.app/api/auth/callback/google`

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://yourapp.vercel.app/api/auth/callback/github`

## ☁️ Vercel Deployment

### Method 1: CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```env
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=https://yourapp.vercel.app
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

3. **Deploy**
   - Push to main branch
   - Vercel will auto-deploy

## 🔧 Post-Deployment Setup

1. **Run Database Migrations**
   ```bash
   # Using Vercel CLI
   vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

2. **Verify Deployment**
   - Visit your app URL
   - Test authentication
   - Complete a sample assessment
   - Check database for records

## 📊 Monitoring & Analytics

### PostHog Setup (Optional)
1. Create account at [posthog.com](https://posthog.com)
2. Get your project API key
3. Add to Vercel environment variables:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   ```

### Vercel Analytics
Enable in Vercel dashboard under Analytics tab.

## 🛡️ Security Checklist

- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Database credentials are secure
- [ ] OAuth redirects are properly configured
- [ ] Environment variables are not exposed
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

## 🔄 CI/CD Setup

The GitHub Actions workflow will:
1. Run tests on PR/push
2. Deploy to Vercel on main branch push
3. Run database migrations
4. Generate coverage reports

### Required Secrets
Add these to GitHub repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 🚨 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL format
- Check Neon project status
- Ensure SSL mode is enabled

**Authentication Issues**
- Verify OAuth redirect URIs
- Check NEXTAUTH_URL matches deployed URL
- Ensure NEXTAUTH_SECRET is set

**Build Failures**
- Check TypeScript errors
- Verify all environment variables
- Review build logs in Vercel

**Performance Issues**
- Enable Vercel Edge Functions
- Optimize images with Next.js Image
- Use Vercel's CDN for static assets

### Logs & Debugging

```bash
# View Vercel logs
vercel logs

# Check database
npx prisma studio

# Run type checking
npm run type-check

# Test locally with production data
vercel env pull .env.local
npm run dev
```

## 📈 Scaling Considerations

### Database
- Monitor connection pool usage
- Consider read replicas for heavy traffic
- Set up automated backups

### Caching
- Use Next.js static generation where possible
- Implement Redis for session storage
- Enable Vercel's Edge Caching

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Track usage patterns (PostHog)

## 🔒 Production Hardening

1. **Security Headers**
   ```javascript
   // next.config.js
   headers: [
     {
       source: '/(.*)',
       headers: [
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
         { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
       ]
     }
   ]
   ```

2. **Rate Limiting**
   - Implement API rate limiting
   - Use Vercel's Edge Config for rules
   - Monitor for abuse patterns

3. **Data Privacy**
   - Implement GDPR compliance features
   - Add data export/deletion endpoints
   - Review data retention policies

---

## 🆘 Support

Need help with deployment?
- 📖 [Vercel Docs](https://vercel.com/docs)
- 🐘 [Neon Docs](https://neon.tech/docs)
- 🔐 [NextAuth.js Docs](https://next-auth.js.org)
- 💬 [GitHub Discussions](https://github.com/yourusername/toximeter/discussions)
