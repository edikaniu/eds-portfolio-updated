# Development Guide & Troubleshooting

## 🚨 Preventing Styling Issues

### Root Causes of Styling Breaks
1. **Corrupted webpack cache** - Causes module loading errors
2. **Package dependency conflicts** - React version mismatches  
3. **Malformed component edits** - Syntax errors in components
4. **Development server instability** - Hot reloading failures

### 🛡️ Safeguards Implemented

#### 1. Enhanced Package Scripts
```bash
npm run dev:clean      # Clean .next cache and start dev server
npm run dev:reset      # Full reset: cache, modules, reinstall
npm run type-check     # Check TypeScript without building
npm run fresh-install  # Complete clean reinstall
```

#### 2. Next.js Configuration
- Image domains whitelisted for external sources
- Security headers configured
- Development stability optimizations

#### 3. Environment Configuration
- `.env.local` with telemetry disabled
- Webpack cache configured for stability

#### 4. Reset Scripts
- `scripts/reset-dev.bat` (Windows)
- `scripts/reset-dev.sh` (Unix/Mac)

### 🔧 Troubleshooting Workflow

#### When Styling Breaks:
1. **First, try cleaning cache:**
   ```bash
   npm run dev:clean
   ```

2. **If still broken, full reset:**
   ```bash
   npm run dev:reset
   ```

3. **Check for syntax errors:**
   ```bash
   npm run type-check
   ```

4. **Verify production build:**
   ```bash
   npm run build
   ```

#### Common Error Patterns:
- `__webpack_modules__[moduleId] is not a function` → Corrupted cache
- `CSS files returning 404/500` → Development server issue
- `Module not found` → Dependency or import issue
- `TypeError: Cannot read property` → Component syntax error

### 📋 Pre-Development Checklist

Before making changes:
- [ ] Current dev server running without errors
- [ ] All pages loading correctly (test `/`, `/projects`, `/case-studies`, `/blog`)
- [ ] Production build successful (`npm run build`)
- [ ] TypeScript compilation clean (`npm run type-check`)

### 🔄 Safe Development Practices

#### Component Editing:
1. **Always read component first** before editing
2. **Use specific old_string matches** to avoid unintended replacements
3. **Test TypeScript compilation** after major changes
4. **Verify pages still load** after component modifications

#### Batch Edits:
1. **Avoid `sed` commands** that modify multiple files simultaneously
2. **Use MultiEdit tool** for controlled batch operations
3. **Test after each significant change**
4. **Keep development server running** to catch issues immediately

#### Image Replacements:
1. **Use replace_all=true** only when appropriate
2. **Test image URLs** before batch replacement
3. **Maintain consistent image dimensions**
4. **Use reliable CDN sources** (Simple Icons, Unsplash)

### 🚀 Performance Optimizations

#### Image Handling:
- External domains whitelisted in next.config.mjs
- Proper image preloading configured
- Optimized URLs with proper dimensions

#### Development Server:
- Filesystem webpack cache enabled
- Environment variables configured
- Memory and cache management improved

### 📚 Recovery Commands

```bash
# Quick fixes
npm run dev:clean

# Full reset (use when above fails)
npm run dev:reset

# Manual reset (if scripts fail)
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run dev

# Verification
npm run type-check
npm run build
```

### 🔍 Monitoring & Debugging

#### Server Logs:
- Monitor webpack compilation status
- Watch for module loading errors
- Check CSS/JS file 404/500 errors

#### Build Verification:
- Production build should always succeed
- TypeScript compilation should be clean
- No webpack warnings in build output

### ⚠️ Red Flags

Stop development immediately if you see:
- Repeated webpack module errors
- CSS files returning 500 errors
- Multiple compilation failures
- Development server crashing repeatedly

**Solution:** Use `npm run dev:reset` and start fresh.

### 🚨 CRITICAL: Module Loading Errors - PERMANENTLY FIXED

**Previous Problem:** `Error: Cannot find module './447.js'` and similar webpack module errors

**ROOT CAUSE IDENTIFIED AND FIXED:**
1. **Client-side code in server components** - FIXED ✅
2. **Webpack cache instability** - FIXED ✅
3. **Image loading race conditions** - FIXED ✅

### 🔧 **PERMANENT FIXES IMPLEMENTED:**

#### 1. Component Architecture Fix
- **Fixed:** Blog post pages now properly separate client and server code
- **Before:** Client-side handlers in server components causing webpack conflicts
- **After:** `ShareButton` and `ShareSection` client components handle all browser APIs

#### 2. Enhanced Webpack Configuration
- **Added:** Deterministic module and chunk IDs for stable builds
- **Added:** Enhanced filesystem cache with proper invalidation
- **Added:** Optimized watch options to prevent rapid file change conflicts

#### 3. Image Loading Optimization
- **Added:** Lazy loading for all external images
- **Added:** Error handling with fallback to placeholder images
- **Added:** Staggered animation delays to prevent simultaneous loading

#### 4. Development Environment Stability
- **Added:** Pre-development TypeScript checking
- **Added:** Enhanced environment variables for webpack optimization
- **Added:** New stable development scripts

### 🚀 **NEW DEVELOPMENT COMMANDS:**

```bash
# Standard development (with TypeScript pre-check)
npm run dev

# Stable development (clears cache, disables turbo)
npm run dev:stable

# Quick cache clear (without full reset)
npm run cache:clear

# Emergency reset (if needed)
npm run dev:reset
```

### ✅ **VERIFICATION CHECKLIST:**

**After Starting Dev Server:**
- [ ] No webpack module errors in console
- [ ] All pages load without 500 errors
- [ ] Images load progressively without errors
- [ ] Hot reload works without breaking styling
- [ ] Production build succeeds: `npm run build`

### 🛡️ **PREVENTION MEASURES:**

1. **Automatic TypeScript checking** before dev server starts
2. **Deterministic webpack module IDs** prevent cache corruption
3. **Proper server/client component separation** prevents rendering conflicts
4. **Enhanced error boundaries** with fallback mechanisms
5. **Optimized image loading** with lazy loading and error handling

### 📊 **SUCCESS INDICATORS:**

✅ **Server starts cleanly** on first try
✅ **All pages return HTTP 200** without module errors
✅ **Hot reload works consistently** without cache corruption
✅ **Images load progressively** without overwhelming webpack
✅ **TypeScript compilation** is clean before each dev session
✅ **Production builds succeed** every time

### 🚨 **IF ISSUES PERSIST:**

**Emergency Protocol:**
1. Stop dev server
2. Run: `npm run cache:clear`
3. Run: `npm run type-check`
4. Run: `npm run dev:stable`

**If still broken (should be extremely rare now):**
```bash
npm run dev:reset
```

**The original module errors should no longer occur due to the architectural fixes implemented.**

### 📞 Support

If issues persist after following this guide:
1. Check Next.js documentation for updates
2. Verify React/Next.js version compatibility
3. Consider updating dependencies
4. Review recent component changes for syntax errors

---

**Last Updated:** 2025-08-17
**Verified Working:** Next.js 15.2.4, React 19