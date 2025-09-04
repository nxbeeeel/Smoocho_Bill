# Smoocho Bill POS - Production Deployment Guide

## 🚀 Complete Production Setup

This guide will help you deploy the Smoocho Bill POS system for your shop with real-time synchronization across all devices.

## 📋 Prerequisites

- **Node.js 16+** and **npm 8+**
- **PostgreSQL 13+** database
- **Redis** (optional, for caching)
- **Domain name** (for production)
- **SSL certificate** (for HTTPS)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Device 1      │    │   Device 2      │    │   Device 3      │
│   (Tablet)      │    │   (Phone)       │    │   (Computer)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     Backend Server        │
                    │   (Node.js + Express)     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     PostgreSQL DB         │
                    │   (All Data Storage)      │
                    └───────────────────────────┘
```

## 🔧 Option 1: Cloud Hosting (Recommended)

### **AWS Deployment**

1. **Create AWS Account**
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **Setup RDS PostgreSQL**
   ```bash
   # Create RDS instance
   aws rds create-db-instance \
     --db-instance-identifier smoocho-pos-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username smoocho_user \
     --master-user-password YourSecurePassword123 \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxxxxxxxx
   ```

3. **Deploy to EC2**
   ```bash
   # Create EC2 instance
   aws ec2 run-instances \
     --image-id ami-0c02fb55956c7d316 \
     --count 1 \
     --instance-type t3.micro \
     --key-name your-key-pair \
     --security-group-ids sg-xxxxxxxxx
   ```

4. **Setup Server**
   ```bash
   # Connect to EC2
   ssh -i your-key.pem ec2-user@your-ec2-ip

   # Install dependencies
   sudo yum update -y
   sudo yum install -y nodejs npm git postgresql

   # Clone repository
   git clone https://github.com/your-username/smoocho-bill-pos.git
   cd smoocho-bill-pos/api

   # Install dependencies
   npm install

   # Setup environment
   cp env.example .env
   # Edit .env with your database URL and secrets

   # Start with PM2
   npm install -g pm2
   pm2 start server.js --name smoocho-pos
   pm2 startup
   pm2 save
   ```

### **Google Cloud Deployment**

1. **Create GCP Project**
   ```bash
   gcloud projects create smoocho-pos-project
   gcloud config set project smoocho-pos-project
   ```

2. **Setup Cloud SQL**
   ```bash
   gcloud sql instances create smoocho-pos-db \
     --database-version=POSTGRES_13 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

3. **Deploy to Compute Engine**
   ```bash
   gcloud compute instances create smoocho-pos-server \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-micro \
     --zone=us-central1-a
   ```

## 🐳 Option 2: Docker Deployment (Easiest)

### **Local Docker Setup**

1. **Install Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/smoocho-bill-pos.git
   cd smoocho-bill-pos/api

   # Start all services
   docker-compose up -d

   # Check status
   docker-compose ps
   ```

3. **Access Application**
   - Backend API: `http://localhost:3001`
   - Database: `localhost:5432`
   - Redis: `localhost:6379`

### **Production Docker Setup**

1. **Setup Production Environment**
   ```bash
   # Create production directory
   mkdir -p /opt/smoocho-pos
   cd /opt/smoocho-pos

   # Copy files
   cp -r /path/to/smoocho-bill-pos/api/* .

   # Create production .env
   cat > .env << EOF
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://smoocho_user:secure_password@postgres:5432/smoocho_pos
   JWT_SECRET=your-super-secure-jwt-secret-key
   REDIS_URL=redis://redis:6379
   EOF
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Start production services
   docker-compose -f docker-compose.yml up -d

   # Setup SSL with Let's Encrypt
   docker run -d \
     --name nginx-proxy \
     -p 80:80 -p 443:443 \
     -v /var/run/docker.sock:/tmp/docker.sock:ro \
     jwilder/nginx-proxy

   docker run -d \
     --name nginx-proxy-letsencrypt \
     --volumes-from nginx-proxy \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     jrcs/letsencrypt-nginx-proxy-companion
   ```

## 🏠 Option 3: VPS Hosting

### **DigitalOcean Droplet**

1. **Create Droplet**
   ```bash
   # Create Ubuntu 20.04 droplet
   # Minimum: 1GB RAM, 1 CPU, 25GB SSD
   # Recommended: 2GB RAM, 1 CPU, 50GB SSD
   ```

2. **Setup Server**
   ```bash
   # Connect to droplet
   ssh root@your-droplet-ip

   # Update system
   apt update && apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs

   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib

   # Setup database
   sudo -u postgres psql
   CREATE DATABASE smoocho_pos;
   CREATE USER smoocho_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE smoocho_pos TO smoocho_user;
   \q
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/smoocho-bill-pos.git
   cd smoocho-bill-pos/api

   # Install dependencies
   npm install

   # Setup environment
   cp env.example .env
   # Edit .env with your database credentials

   # Start with PM2
   npm install -g pm2
   pm2 start server.js --name smoocho-pos
   pm2 startup
   pm2 save
   ```

## 🔐 Security Configuration

### **SSL Certificate Setup**

1. **Using Let's Encrypt**
   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx

   # Get certificate
   certbot --nginx -d your-domain.com

   # Auto-renewal
   crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

2. **Using Cloudflare**
   ```bash
   # Point domain to your server
   # Enable SSL/TLS encryption mode: Full (strict)
   # Enable Always Use HTTPS
   ```

### **Firewall Configuration**

```bash
# UFW setup
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3001/tcp  # API (if direct access needed)
ufw enable
```

## 📊 Monitoring & Maintenance

### **Health Monitoring**

1. **Setup Monitoring**
   ```bash
   # Install monitoring tools
   npm install -g pm2-logrotate
   pm2 install pm2-server-monit

   # Setup log rotation
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Database Backup**
   ```bash
   # Create backup script
   cat > /opt/backup.sh << EOF
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   pg_dump smoocho_pos > /opt/backups/smoocho_pos_$DATE.sql
   find /opt/backups -name "*.sql" -mtime +7 -delete
   EOF

   chmod +x /opt/backup.sh

   # Setup cron job
   crontab -e
   # Add: 0 2 * * * /opt/backup.sh
   ```

### **Performance Optimization**

1. **Database Optimization**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at);
   CREATE INDEX CONCURRENTLY idx_products_shop_category ON products(shop_id, category);
   ```

2. **Application Optimization**
   ```bash
   # Enable compression
   # Add to server.js
   app.use(compression());

   # Setup Redis caching
   # Add Redis for session storage and caching
   ```

## 💰 Cost Estimation

### **Monthly Costs**

| Service | Small Shop | Medium Shop | Large Shop |
|---------|------------|-------------|------------|
| **VPS/Cloud** | $5-10 | $20-40 | $50-100 |
| **Database** | $0-5 | $10-20 | $30-50 |
| **Domain/SSL** | $1-2 | $1-2 | $1-2 |
| **Backup Storage** | $1-2 | $3-5 | $5-10 |
| **Total** | **$7-19** | **$34-67** | **$86-162** |

### **Recommended Providers**

1. **Budget Option**: DigitalOcean ($5-20/month)
2. **Balanced Option**: AWS/GCP ($20-50/month)
3. **Premium Option**: AWS/GCP with managed services ($50-100/month)

## 🚀 Quick Start Commands

### **Docker Quick Start**
```bash
# Clone and start
git clone https://github.com/your-username/smoocho-bill-pos.git
cd smoocho-bill-pos/api
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

### **Manual Quick Start**
```bash
# Install dependencies
npm install

# Setup database
createdb smoocho_pos
psql smoocho_pos < database.sql

# Start server
npm start
```

## 📞 Support & Maintenance

### **Regular Maintenance Tasks**

1. **Weekly**
   - Check server logs
   - Monitor disk space
   - Review error logs

2. **Monthly**
   - Update dependencies
   - Review security patches
   - Check backup integrity

3. **Quarterly**
   - Performance review
   - Security audit
   - Capacity planning

### **Troubleshooting**

1. **Common Issues**
   ```bash
   # Check server status
   pm2 status
   pm2 logs smoocho-pos

   # Check database connection
   psql -h localhost -U smoocho_user -d smoocho_pos

   # Check disk space
   df -h
   ```

2. **Performance Issues**
   ```bash
   # Check memory usage
   free -h
   top

   # Check database performance
   SELECT * FROM pg_stat_activity;
   ```

## 🎯 Production Checklist

- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Firewall configured
- [ ] Environment variables secured
- [ ] Log rotation configured
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Security headers configured
- [ ] Rate limiting enabled

## 📱 Frontend Integration

After backend deployment, update your frontend to connect to the production API:

```typescript
// Update API client configuration
const apiClient = new ApiClient('https://your-domain.com/api')

// The frontend will automatically sync with the backend
// All devices will have real-time data synchronization
```

This setup provides a production-ready POS system with real-time synchronization across all devices, professional security, and reliable backup systems.