# Database Setup Guide - Smoocho Bill POS

## 🚀 Quick Database Setup (Recommended)

### **Option 1: Supabase (Free PostgreSQL Cloud)**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up for free account**
3. **Create new project:**
   - Project name: `smoocho-bill-pos`
   - Database password: `YourSecurePassword123`
   - Region: Choose closest to your location
4. **Wait for project to be created (2-3 minutes)**
5. **Get connection string:**
   - Go to Settings > Database
   - Copy the "Connection string" under "Connection parameters"
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

### **Option 2: Neon (Free PostgreSQL Cloud)**

1. **Go to [neon.tech](https://neon.tech)**
2. **Sign up for free account**
3. **Create new project:**
   - Project name: `smoocho-bill-pos`
   - Database name: `smoocho_pos`
4. **Copy connection string from dashboard**

### **Option 3: Railway (Free PostgreSQL)**

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Add PostgreSQL service**
5. **Copy connection string from service**

## 🔧 Local Setup (Alternative)

If you prefer local database:

### **Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set for `postgres` user
4. Create database: `smoocho_pos`

### **macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb smoocho_pos
```

### **Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb smoocho_pos
```

## 📝 Next Steps

After getting your database connection string:

1. **Create `.env.local` file:**
   ```bash
   cp env.local.example .env.local
   ```

2. **Edit `.env.local` with your database URL:**
   ```env
   DATABASE_URL=your_connection_string_here
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   NODE_ENV=development
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🎯 Recommended: Supabase Setup

**Why Supabase?**
- ✅ Free tier with 500MB database
- ✅ Built-in dashboard for data management
- ✅ Automatic backups
- ✅ Real-time subscriptions (for future features)
- ✅ Easy to scale
- ✅ No local installation needed

**Quick Supabase Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google
4. Click "New project"
5. Fill in:
   - Name: `smoocho-bill-pos`
   - Password: `YourSecurePassword123`
   - Region: Choose closest
6. Click "Create new project"
7. Wait 2-3 minutes for setup
8. Go to Settings > Database
9. Copy the connection string
10. Use it in your `.env.local` file

That's it! Your database will be ready in minutes.
