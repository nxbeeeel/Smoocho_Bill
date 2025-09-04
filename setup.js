// Smoocho Bill POS - Quick Setup Script
const fs = require('fs')
const path = require('path')

console.log('🚀 Smoocho Bill POS - Quick Setup')
console.log('=====================================\n')

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists')
} else {
  console.log('📝 Creating .env.local file...')
  
  const envContent = `# Smoocho Bill POS - Environment Configuration

# Database Configuration (Replace with your actual database URL)
DATABASE_URL=postgresql://username:password@localhost:5432/smoocho_pos

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-2024

# Development/Production flags
NODE_ENV=development`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local created successfully')
}

console.log('\n📋 Next Steps:')
console.log('1. Get a free PostgreSQL database from:')
console.log('   - Supabase: https://supabase.com (Recommended)')
console.log('   - Neon: https://neon.tech')
console.log('   - Railway: https://railway.app')
console.log('\n2. Copy the connection string and update DATABASE_URL in .env.local')
console.log('\n3. Run: npm run db:init')
console.log('\n4. Run: npm run dev')
console.log('\n5. Open: http://localhost:3000')
console.log('\n6. Login with: admin@smoochobill.com / admin123')
console.log('\n🎉 Your POS system will be ready!')
