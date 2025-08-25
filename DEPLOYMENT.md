# 🚀 Deployment Guide - Edikan Udoibuot Portfolio

## Quick Deploy to Vercel

### Method 1: Automatic Deployment
1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will automatically detect Next.js and deploy

### Method 2: Manual Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow the prompts
```

## Important Notes

### 🔧 **Build Configuration**
- **Install Command**: `npm install --legacy-peer-deps`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x or higher

### 🌍 **Environment Variables**
No environment variables needed for basic deployment.

### 📦 **Dependencies**
The project uses React 19 and Next.js 15.2.4, which require the `--legacy-peer-deps` flag during installation.

## Alternative Hosting Options

### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set install command: `npm install --legacy-peer-deps`

### Railway
1. Connect GitHub repository
2. Railway will auto-detect Next.js
3. Deployment will happen automatically

### GitHub Pages (Static Export)
```bash
# Add to next.config.mjs
output: 'export',
trailingSlash: true,
images: { unoptimized: true }

# Build and export
npm run build
```

## 🔧 Local Development Fix

If you're experiencing module errors locally:

```bash
# Complete reset (recommended)
npm run dev:reset

# Or manual reset
rm -rf .next node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm run dev
```

## ✅ Verification

After deployment, verify these pages load correctly:
- Homepage: `/`
- Projects: `/projects`
- Case Studies: `/case-studies`
- Blog: `/blog`
- Individual blog posts: `/blog/ai-marketing-transformation`

## 🆘 Troubleshooting

### Build Fails
- Ensure `--legacy-peer-deps` flag is used
- Check Node.js version (18.x+ required)
- Verify all TypeScript errors are resolved

### Images Don't Load
- Check that image domains are whitelisted in `next.config.mjs`
- Verify external image URLs are accessible

### Runtime Errors
- Check browser console for client-side errors
- Verify server logs for SSR issues

---

**Last Updated**: 2025-08-17  
**Status**: Ready for deployment ✅