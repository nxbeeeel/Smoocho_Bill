# 🚀 Smoocho Bill Deployment Guide

## Overview
This guide will help you deploy Smoocho Bill to production and create an Android APK for offline use.

## 📋 Pre-Deployment Checklist

### **Required Software**
- [ ] Docker Desktop (for containerized deployment)
- [ ] Node.js 18+ (for building)
- [ ] Git (for version control)
- [ ] SSL certificates (for HTTPS)

### **Environment Setup**
- [ ] Domain name configured
- [ ] Database server ready
- [ ] Email service configured
- [ ] Payment gateway configured

## 🏗️ **Option 1: Docker Deployment (Recommended)**

### **Step 1: Update Environment Variables**
Edit `production.env` with your actual values:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your-actual-jwt-secret-here
JWT_REFRESH_SECRET=your-actual-refresh-secret-here
SESSION_SECRET=your-actual-session-secret-here

# Domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# External Services
PAYTM_ENV=production
PAYTM_WEBSITE=WEBPROD
```

### **Step 2: Configure SSL Certificates**
Place your SSL certificates in the `ssl/` directory:
- `ssl/cert.pem` - Your SSL certificate
- `ssl/key.pem` - Your private key

### **Step 3: Deploy**
```powershell
# Run the deployment script
.\deploy-production.ps1
```

### **Step 4: Verify Deployment**
- Web App: https://yourdomain.com
- API: https://yourdomain.com/api
- Health Check: https://yourdomain.com/health

## 🏗️ **Option 2: Traditional Server Deployment**

### **Step 1: Build Applications**
```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build
```

### **Step 2: Deploy to Server**
```bash
# Copy built files to server
scp -r client/dist/* user@server:/var/www/smoocho-bill/
scp -r server/dist/* user@server:/opt/smoocho-bill/

# Install dependencies on server
ssh user@server
cd /opt/smoocho-bill
npm install --production
```

### **Step 3: Configure Nginx**
Copy the `nginx.conf` to your server and update the domain.

### **Step 4: Start Services**
```bash
# Start the application
pm2 start dist/index.js --name "smoocho-bill"

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

## 📱 **Android APK Creation**

### **Method 1: Using Build Script**
```powershell
# Run the Android build script
.\build-android.ps1
```

### **Method 2: Using PWA Builder Online**
1. Build your client: `cd client && npm run build`
2. Visit [PWA Builder](https://www.pwabuilder.com/)
3. Upload your `client/dist/` folder
4. Download the generated APK

### **Method 3: Manual Android Studio Build**
1. Install Android Studio
2. Open the generated `android-app/` project
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. Install APK on your tablet

## 🔧 **Post-Deployment Configuration**

### **1. Database Setup**
```sql
-- Create database
CREATE DATABASE smoocho_bill;

-- Run migrations (if using Prisma)
npx prisma migrate deploy
npx prisma db seed
```

### **2. User Management**
```bash
# Create admin user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

### **3. Payment Gateway Setup**
- Configure Paytm credentials in environment
- Test payment processing
- Set up webhook endpoints

### **4. Printer Configuration**
- Install printer drivers on tablet
- Configure print settings in the app
- Test receipt printing

## 📊 **Monitoring & Maintenance**

### **Health Checks**
```bash
# Check application health
curl https://yourdomain.com/health

# Check Docker services
docker-compose ps

# View logs
docker-compose logs -f
```

### **Backup Strategy**
```bash
# Database backup
pg_dump smoocho_bill > backup_$(date +%Y%m%d).sql

# File backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### **Updates**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

#### **Database Connection Issues**
- Check database server status
- Verify connection string
- Check firewall settings

#### **SSL Certificate Issues**
- Verify certificate validity
- Check certificate chain
- Ensure private key permissions

#### **Performance Issues**
- Check server resources
- Optimize database queries
- Enable caching

## 📞 **Support & Resources**

### **Documentation**
- [Security Guide](SECURITY.md)
- [API Documentation](docs/API.md)
- [User Manual](docs/USER_MANUAL.md)

### **Contact**
- **Technical Support**: support@smoocho.com
- **Security Issues**: security@smoocho.com
- **Emergency**: +1-555-SUPPORT

### **Useful Commands**
```bash
# View all running containers
docker ps

# View service logs
docker-compose logs -f smoocho-server

# Restart specific service
docker-compose restart smoocho-server

# Scale services
docker-compose up -d --scale smoocho-server=3

# Update services
docker-compose pull && docker-compose up -d
```

## 🎯 **Next Steps After Deployment**

1. **Test All Features**
   - User authentication
   - POS operations
   - Payment processing
   - Inventory management
   - Reporting

2. **Configure Monitoring**
   - Set up alerts
   - Configure logging
   - Monitor performance

3. **User Training**
   - Staff training sessions
   - User manual distribution
   - Support contact information

4. **Go Live**
   - Announce to staff
   - Monitor initial usage
   - Gather feedback

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Next Review**: January 2025
