# Smoocho Bill - Vercel Frontend Deployment

## 🚀 Deploy Frontend to Vercel

### Prerequisites
- Vercel account (free)
- Git repository
- Node.js 18+ installed

### Step 1: Prepare for Production Build
```bash
cd client
npm run build
```

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy from client directory
cd client
vercel --prod

# Follow prompts:
# - Set project name: smoocho-bill-frontend
# - Set build command: npm run build
# - Set output directory: dist
# - Set install command: npm install
```

### Step 4: Configure Environment Variables
In Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
```

### Step 5: Custom Domain (Optional)
- Add custom domain in Vercel dashboard
- Configure DNS records
- Enable HTTPS automatically

## ✅ Benefits
- Automatic HTTPS
- Global CDN
- Automatic deployments
- Preview deployments
- Analytics included

## 🔗 URLs
- Production: https://your-app.vercel.app
- Preview: https://your-branch.vercel.app
