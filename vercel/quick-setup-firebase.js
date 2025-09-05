// Quick Setup Script for Beloop POS Firebase Integration
// This script helps you set up everything quickly

const { DatabaseBridge } = require('./firebase-bridge');

async function quickSetup() {
  console.log('🚀 Beloop POS Firebase Quick Setup');
  console.log('=====================================');
  
  try {
    const bridge = new DatabaseBridge();
    
    console.log('📦 Step 1: Syncing your existing products to Firebase...');
    await bridge.syncProducts();
    console.log('✅ Products synced successfully!');
    
    console.log('📋 Step 2: Syncing your existing orders to Firebase...');
    await bridge.syncOrders();
    console.log('✅ Orders synced successfully!');
    
    console.log('👥 Step 3: Syncing your existing users to Firebase...');
    await bridge.syncUsers();
    console.log('✅ Users synced successfully!');
    
    console.log('⚙️ Step 4: Syncing your existing settings to Firebase...');
    await bridge.syncSettings();
    console.log('✅ Settings synced successfully!');
    
    console.log('🔍 Step 5: Verifying the sync...');
    
    const products = await bridge.getProducts();
    const orders = await bridge.getOrders();
    const users = await bridge.getUsers();
    const settings = await bridge.getSettings();
    
    console.log('📊 Sync Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Settings: ${Object.keys(settings).length}`);
    
    console.log('🎉 Quick setup completed successfully!');
    console.log('');
    console.log('📱 Next steps:');
    console.log('1. Deploy to Vercel: run deploy-vercel.bat');
    console.log('2. Update Android app with your Vercel URL');
    console.log('3. Build and test the Android app');
    console.log('4. Your Beloop POS is ready! 🚀');
    
  } catch (error) {
    console.error('❌ Quick setup failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure you have updated the Firebase service account details');
    console.log('2. Check that Firestore is enabled in Firebase Console');
    console.log('3. Verify your Firebase project ID is correct');
    throw error;
  }
}

// Run the quick setup
if (require.main === module) {
  quickSetup()
    .then(() => {
      console.log('✅ Quick setup script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Quick setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { quickSetup };
