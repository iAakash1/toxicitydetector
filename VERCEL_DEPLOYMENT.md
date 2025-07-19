# Deployment Guide

## Vercel Deployment Steps

### 1. Remove Conflicting Configuration ✅
- Removed `vercel.json` (conflicts with Next.js auto-deployment)

### 2. Vercel Dashboard Setup
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import from GitHub: `iAakash1/toxicitydetector`
4. Framework should auto-detect as **Next.js**

### 3. Environment Variables (REQUIRED)
Add these in Vercel dashboard during deployment setup:

```env
DATABASE_URL=postgresql://your-db-url
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

**For testing/demo purposes, you can use:**
```env
DATABASE_URL=postgresql://temp:temp@localhost:5432/temp
NEXTAUTH_SECRET=demo-secret-replace-with-real-32-chars
NEXTAUTH_URL=https://toxicitydetector.vercel.app
NODE_ENV=production
```

### 4. Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Database (Optional for demo)
- The app will work without a database for the basic functionality
- Authentication features require a proper PostgreSQL database
- Consider using Supabase, PlanetScale, or Neon for production

## Troubleshooting

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Make sure the repository is public or Vercel has access

### Common issues:
- Missing `NEXTAUTH_SECRET` environment variable
- Invalid `DATABASE_URL` format
- Build process failing due to missing dependencies

## Project Structure
This is a Next.js 15 application with:
- App Router architecture
- NextAuth.js v5 for authentication
- tRPC for API layer
- Prisma for database
- Tailwind CSS for styling
