# Smoocho Bill - Production Deployment Guide
# Vercel (Frontend) + Railway (Backend)

## 🎯 DEPLOYMENT OVERVIEW

**Frontend**: Vercel (React SPA)
**Backend**: Railway (Node.js API)
**Database**: Railway PostgreSQL
**Domain**: Custom domain with HTTPS

---

## 🚀 STEP 1: DEPLOY BACKEND TO RAILWAY

### Prerequisites
- Railway account (railway.app)
- Git repository
- Node.js 18+ installed

### 1.1 Prepare Backend for Production
```bash
cd server
npm install
npm run build
```

### 1.2 Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize Railway project
railway init

# Deploy to Railway
railway up

# Get your deployment URL
railway status
```

### 1.3 Configure Railway Environment Variables
In Railway dashboard, add:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
ENABLE_LOGGING=true
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### 1.4 Add PostgreSQL Database
- Go to Railway dashboard
- Click "New Service" → "Database" → "PostgreSQL"
- Copy connection string to environment variables

---

## 🌐 STEP 2: DEPLOY FRONTEND TO VERCEL

### Prerequisites
- Vercel account (vercel.com)
- Git repository
- Node.js 18+ installed

### 2.1 Prepare Frontend for Production
```bash
cd client

# Update API URL to Railway backend
# Edit src/config/index.ts
export const API_BASE_URL = 'https://your-railway-backend.railway.app';

# Build for production
npm run build
```

### 2.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

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

### 2.3 Configure Vercel Environment Variables
In Vercel dashboard, add:
```
REACT_APP_API_URL=https://your-railway-backend.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

---

## 🔧 STEP 3: CONFIGURE PRODUCTION SETTINGS

### 3.1 Update Frontend Configuration
```typescript
// client/src/config/index.ts
export const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-railway-backend.railway.app',
    timeout: 30000,
  },
  app: {
    name: 'Smoocho Bill',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'production',
  }
};
```

### 3.2 Update Backend CORS
```typescript
// server/src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 🌍 STEP 4: CUSTOM DOMAIN SETUP

### 4.1 Frontend Domain (Vercel)
- Go to Vercel dashboard
- Click "Settings" → "Domains"
- Add your custom domain (e.g., pos.yourcompany.com)
- Configure DNS records as instructed

### 4.2 Backend Domain (Railway)
- Go to Railway dashboard
- Click "Settings" → "Custom Domains"
- Add your custom domain (e.g., api.yourcompany.com)
- Configure DNS records

### 4.3 DNS Configuration
```
# Frontend
pos.yourcompany.com → CNAME → your-app.vercel.app

# Backend  
api.yourcompany.com → CNAME → your-railway-backend.railway.app
```

---

## ✅ STEP 5: VERIFY DEPLOYMENT

### 5.1 Test Backend
```bash
# Health check
curl https://api.yourcompany.com/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"production"}
```

### 5.2 Test Frontend
- Open https://pos.yourcompany.com
- Navigate to POS page
- Test responsive design
- Test hard refresh
- Verify no horizontal scrolling

### 5.3 Test Integration
- Add items to cart
- Complete a test order
- Verify API communication

---

## 🔒 STEP 6: SECURITY & MONITORING

### 6.1 Security Headers
Vercel automatically provides:
- HTTPS/SSL
- Security headers
- DDoS protection
- Global CDN

### 6.2 Monitoring
- Railway: Built-in monitoring
- Vercel: Analytics and performance
- Custom: Add Sentry for error tracking

---

## 📱 STEP 7: MOBILE/TABLET TESTING

### 7.1 Test Responsive Design
- **Mobile**: 375px-767px (single column)
- **Tablet**: 768px-1023px (two columns)  
- **Desktop**: 1024px+ (three columns)

### 7.2 Verify No Horizontal Scroll
- Menu fits perfectly on all screen sizes
- No left/right scrolling needed
- Touch-friendly interactions

---

## 🚀 FINAL DEPLOYMENT COMMANDS

```bash
# 1. Deploy Backend
cd server
railway up

# 2. Deploy Frontend  
cd client
vercel --prod

# 3. Test Everything
curl https://api.yourcompany.com/health
open https://pos.yourcompany.com
```

---

## 🎯 PRODUCTION URLs

- **Frontend**: https://pos.yourcompany.com
- **Backend**: https://api.yourcompany.com
- **Health Check**: https://api.yourcompany.com/health
- **Admin Panel**: https://pos.yourcompany.com/admin

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domains set up
- [ ] DNS records configured
- [ ] HTTPS working
- [ ] API communication tested
- [ ] Responsive design verified
- [ ] No horizontal scrolling
- [ ] Hard refresh working
- [ ] Security headers enabled
- [ ] Monitoring configured

---

## 🆘 TROUBLESHOOTING

### Common Issues:
1. **CORS errors**: Check CORS_ORIGIN in Railway
2. **API not found**: Verify API_BASE_URL in frontend
3. **Build failures**: Check Node.js version (18+)
4. **Domain not working**: Wait for DNS propagation (up to 48 hours)

### Support:
- Railway: Discord community
- Vercel: Documentation and support
- This guide: Reference for configuration
