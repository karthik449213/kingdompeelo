# Netlify Deployment Guide - Peel O Juice

Complete step-by-step guide to deploy the **kingdompeelo** frontend on Netlify and configure backend API.

---

## 📋 Prerequisites

✅ GitHub account with repository pushed  
✅ Netlify account (free tier available at netlify.com)  
✅ Backend API running (Render, Heroku, or custom server)  
✅ Environment variables configured  

---

## Step 1: Backend Deployment (Deploy First!)

### Option A: Deploy Backend on Render.com (Recommended - Free)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account
   - Connect your GitHub repository

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your `kingdomfoods` repository
   - Configure:
     ```
     Name: kingdomfoods-api
     Environment: Node
     Build Command: npm install
     Start Command: node backend/server.js
     ```

3. **Set Environment Variables** (In Render Dashboard)
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kingdompeelo
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your-super-secret-key-generate-random
   NODE_ENV=production
   ALLOW_ADMIN_REGISTER=false
   FRONTEND_ORIGIN=https://your-netlify-domain.netlify.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy the service URL: `https://kingdomfoods-api.onrender.com`

### Option B: Deploy Backend on Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create kingdomfoods-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://..."
   heroku config:set CLOUDINARY_NAME="..."
   heroku config:set JWT_SECRET="your-secret"
   heroku config:set NODE_ENV="production"
   heroku config:set ALLOW_ADMIN_REGISTER="false"
   heroku config:set FRONTEND_ORIGIN="https://your-netlify-domain.netlify.app"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Copy API URL**: `https://kingdomfoods-api.herokuapp.com`

---

## Step 2: Configure Environment Variables

### Create `.env.production` in Frontend Root

```bash
# In kingdompeelo/ root directory
VITE_API_URL=https://kingdomfoods-api.onrender.com
VITE_APP_TITLE=peel O juice
```

### Update `.env.example`

```bash
# Development
VITE_API_URL=http://localhost:5000

# Production (Render.com)
VITE_API_URL=https://kingdomfoods-api.onrender.com

# Production (Heroku)
VITE_API_URL=https://kingdomfoods-api.herokuapp.com

# App Title
VITE_APP_TITLE=peel O juice
```

---

## Step 3: Configure Netlify Build Settings

### Option A: Connect via Netlify Dashboard (Easiest)

1. **Go to netlify.com**
   - Sign up or login
   - Click "Add new site" → "Import an existing project"

2. **Connect GitHub**
   - Select your GitHub account
   - Choose `kingdompeelo` repository
   - Click "Continue"

3. **Build Settings**
   ```
   Base directory: (leave empty or use: /)
   Build command: npm run build
   Publish directory: dist/public
   ```

4. **Environment Variables** (In Netlify UI)
   - Go to Site Settings → Build & Deploy → Environment
   - Add:
     ```
     VITE_API_URL=https://kingdomfoods-api.onrender.com
     VITE_APP_TITLE=peel O juice
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - View live site at `https://your-domain.netlify.app`

### Option B: Using netlify.toml (Advanced) - RECOMMENDED FOR 404 FIX

**⚠️ IMPORTANT: If you're getting 404 on page reload, use this method!**

Create `netlify.toml` in root directory:

```toml
[build]
base = "/"
command = "npm run build"
publish = "dist/public"

[build.environment]
NODE_VERSION = "18.17.0"

# SPA Routing Fix - Redirect all routes to index.html
# This fixes the 404 error when reloading /menu or other routes
[[redirects]]
from = "/*"
to = "/index.html"
status = 200

# API proxy - direct requests to backend
[[redirects]]
from = "/api/*"
to = "https://kingdomfoods-api.onrender.com/api/:splat"
status = 200
force = false

[dev]
command = "npm run dev:client"
port = 5173

# Security Headers
[[headers]]
for = "/*"
[headers.values]
X-Content-Type-Options = "nosniff"
X-Frame-Options = "DENY"
X-XSS-Protection = "1; mode=block"
Referrer-Policy = "strict-origin-when-cross-origin"

# Cache HTML (no cache)
[[headers]]
for = "/index.html"
[headers.values]
Cache-Control = "no-cache, no-store, must-revalidate"

# Cache static assets (1 year)
[[headers]]
for = "/assets/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

# Cache images
[[headers]]
for = "/images/*"
[headers.values]
Cache-Control = "public, max-age=604800"
```

Then deploy:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Step 4: Connect Frontend to Backend

### Update .env.example for Others

```bash
# Update to your deployed backend URL
VITE_API_URL=https://kingdomfoods-api.onrender.com
VITE_APP_TITLE=peel O juice
```

### Verify API Connection

In `client/src/lib/utils.ts`, the API URL is automatically set:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;
```

When deployed to Netlify:
- `import.meta.env.VITE_API_URL` = `https://kingdomfoods-api.onrender.com`
- `API_URL` = `https://kingdomfoods-api.onrender.com/api`

---

## Step 5: Configure CORS on Backend

### Update Backend Environment Variable

In Render/Heroku dashboard, set:

```
FRONTEND_ORIGIN=https://your-netlify-domain.netlify.app
```

### Backend CORS Configuration

In `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_ORIGIN 
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

---

## Step 6: Deploy & Test

### Netlify Deployment Checklist

- [ ] Backend API deployed (Render/Heroku)
- [ ] Backend URL copied
- [ ] VITE_API_URL environment variable set in Netlify
- [ ] FRONTEND_ORIGIN set in backend
- [ ] GitHub repository pushed to main branch
- [ ] netlify.toml file in root (optional)
- [ ] Build command verified: `npm run build`
- [ ] Publish directory verified: `dist/public`

### Test Deployment

1. **Check Build Logs**
   - Go to Netlify dashboard
   - Click "Deploys"
   - View latest deployment logs
   - Look for ✓ (success) or ✗ (error)

2. **Test API Connection**
   ```bash
   # Open browser console and run:
   fetch('https://kingdomfoods-api.onrender.com/api/menu/categories')
     .then(r => r.json())
     .then(console.log)
   ```

3. **Test Pages**
   - Home page loads
   - Menu page shows items (from API)
   - Admin login accessible at `/admin/login`
   - Geolocation works (click "Use my location" in checkout)
   - WhatsApp order button works

---

## Step 7: Custom Domain (Optional)

1. **Register Domain** (GoDaddy, Namecheap, etc.)

2. **Point to Netlify**
   - In Netlify: Site Settings → Domain Management → Add custom domain
   - Update nameservers to Netlify's nameservers
   - Or: Update CNAME record to `your-domain.netlify.app`

3. **Enable HTTPS**
   - Netlify auto-generates SSL certificate (Let's Encrypt)
   - Automatic renewal

---

## Step 8: Post-Deployment Configuration

### Update Backend FRONTEND_ORIGIN

If using custom domain:

```
FRONTEND_ORIGIN=https://your-domain.com
```

In Render/Heroku dashboard, update environment variable.

### Update Admin Panel

Add admin user:
```bash
# Temporarily set ALLOW_ADMIN_REGISTER=true in backend
# Visit https://your-domain.com/admin/login
# Click register to create admin account
# Then set ALLOW_ADMIN_REGISTER=false
```

### Configure Analytics (Optional)

Add Netlify Analytics:
- Site Settings → Analytics
- Enable Site Analytics
- View visitor stats

---

## Troubleshooting

### 🔴 Page Shows 404 When Reloading on Specific Routes

**Problem**: 
- Home page loads fine
- Navigation to `/menu` works
- But reloading `/menu` page shows 404 error

**Root Cause**: 
Netlify is trying to find a physical file at `/menu` but it doesn't exist. React Router needs `index.html` to handle routing.

**Solution**: Add `netlify.toml` to root directory

1. **Create netlify.toml** (if not already created)
   ```toml
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Push to GitHub**
   ```bash
   git add netlify.toml
   git commit -m "fix: add netlify redirects for SPA routing"
   git push origin main
   ```

3. **Redeploy on Netlify**
   - Go to Netlify Dashboard
   - Click "Deploys" → "Trigger deploy" → "Deploy site"
   - Wait for deployment to complete

4. **Test**
   - Go to `/menu`, `/about`, `/visit-us`, `/checkout`
   - Try reloading each page (Ctrl+R or Cmd+R)
   - Should NOT show 404

**Why This Works**:
```
User visits: https://your-domain.netlify.app/menu
↓
Netlify looks for physical file → not found
↓
Redirect rule: /* → /index.html (status 200)
↓
React Router gets /index.html
↓
Wouter detects current path is /menu
↓
Renders Menu component
```

### Build Fails on Netlify

**Error**: `Cannot find module '@/components/...`

**Solution**: 
- Check file paths use forward slashes `/`
- Ensure tsconfig.json has correct path aliases
- Verify all imports use `@/` prefix

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"]
    }
  }
}
```

### API Calls Return 404

**Error**: `Failed to fetch from https://kingdomfoods-api.onrender.com/api/...`

**Solutions**:
1. Verify backend is running: `curl https://kingdomfoods-api.onrender.com/api/menu/categories`
2. Check VITE_API_URL in Netlify environment variables
3. Verify FRONTEND_ORIGIN in backend environment
4. Check CORS headers in browser DevTools Network tab

### CORS Error

**Error**: `Access-Control-Allow-Origin header missing`

**Solutions**:
1. Update FRONTEND_ORIGIN in backend to match Netlify domain
2. Verify CORS middleware in `backend/server.js`
3. Ensure credentials: true in frontend fetch calls

### Images Not Loading

**Error**: Images on menu page are broken

**Solutions**:
1. Verify Cloudinary URLs are HTTPS
2. Check Cloudinary credentials in backend
3. Re-upload images through admin dashboard

---

## Performance Optimization

### Netlify Functions (Optional)

For serverless functions (e.g., email notifications):

```bash
# Create netlify/functions/notify-order.js
exports.handler = async (event) => {
  // Send email, SMS, etc.
  return { statusCode: 200, body: 'OK' };
};
```

### Netlify Edge Functions

For redirect rules at edge (faster):

```toml
# netlify.toml
[[edge_functions]]
path = "/api/*"
function = "api-proxy"
```

### Cache Settings

In `netlify.toml`:

```toml
[[headers]]
for = "/assets/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/index.html"
[headers.values]
Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## Monitoring & Logs

### View Build Logs
```bash
netlify logs --tail
```

### View Runtime Logs
```bash
netlify logs --function=function-name
```

### Monitoring Tools

1. **Netlify Analytics**
   - Site Settings → Analytics

2. **Error Tracking** (Sentry)
   ```bash
   npm install @sentry/react
   ```
   Configure in `client/src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "https://your-key@sentry.io/project",
     environment: "production",
   });
   ```

3. **Performance Monitoring** (Web Vitals)
   ```bash
   npm install web-vitals
   ```

---

## Continuous Deployment

### Auto-Deploy on Push

Netlify automatically deploys when you push to main branch.

To change:
1. Site Settings → Build & Deploy → Deploy contexts
2. Configure:
   - Production branch: `main`
   - Deploy on push: `Enabled`
   - Deploy preview: `Enabled`

### Deploy Preview

Every PR gets a preview URL:
- `https://deploy-preview-123--your-domain.netlify.app`
- Test changes before merging

---

## Rollback

If deployment fails:

1. **Netlify Dashboard**
   - Click "Deploys"
   - Select previous successful deployment
   - Click "Publish deploy"

Or via CLI:
```bash
netlify deploy --prod --dir=dist/public
```

---

## Environment Variables Reference

### Frontend (.env files)

| Variable | Development | Production |
|----------|-------------|-----------|
| VITE_API_URL | http://localhost:5000 | https://kingdomfoods-api.onrender.com |
| VITE_APP_TITLE | peel O juice | peel O juice |

### Backend (Render/Heroku)

| Variable | Value |
|----------|-------|
| MONGODB_URI | Your MongoDB connection string |
| CLOUDINARY_NAME | Your Cloudinary cloud name |
| CLOUDINARY_API_KEY | Your API key |
| CLOUDINARY_API_SECRET | Your API secret |
| JWT_SECRET | Random 32+ character string |
| NODE_ENV | production |
| ALLOW_ADMIN_REGISTER | false |
| FRONTEND_ORIGIN | https://your-netlify-domain.netlify.app |

---

## Quick Start Commands

```bash
# 1. Prepare for deployment
git add .
git commit -m "chore: prepare for netlify deployment"
git push origin main

# 2. Deploy via Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod

# 3. Or: Use Netlify Dashboard
# Go to https://app.netlify.com
# Connect GitHub repo
# Click "Deploy"
```

---

## Summary

✅ **Frontend**: Deployed on Netlify  
✅ **Backend**: Deployed on Render.com  
✅ **Database**: MongoDB Atlas (cloud)  
✅ **Images**: Cloudinary CDN  
✅ **Domain**: Custom domain with auto HTTPS  
✅ **CI/CD**: Auto-deploy on push  

**Expected Costs** (Monthly):
- Netlify: Free (up to 300 build minutes)
- Render: Free (500 hours/month auto-sleep)
- MongoDB: Free (up to 512MB)
- Cloudinary: Free (25GB/month)
- **Total: $0 for hobby projects** ✨

---

## Support & Documentation

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **Vite Deploy Guide**: https://vitejs.dev/guide/static-deploy.html
- **React SPA Routing**: https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server

---

**Last Updated**: December 5, 2025
