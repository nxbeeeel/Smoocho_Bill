// Migration Script for Existing Database to Firebase
// This script helps you migrate your existing data to Firebase

const { DatabaseBridge } = require('./firebase-bridge');

async function migrateExistingData() {
  console.log('🚀 Starting migration of existing data to Firebase...');
  
  try {
    const bridge = new DatabaseBridge();
    
    // Step 1: Sync all existing data to Firebase
    console.log('📦 Step 1: Syncing products...');
    await bridge.syncProducts();
    
    console.log('📋 Step 2: Syncing orders...');
    await bridge.syncOrders();
    
    console.log('👥 Step 3: Syncing users...');
    await bridge.syncUsers();
    
    console.log('⚙️ Step 4: Syncing settings...');
    await bridge.syncSettings();
    
    console.log('✅ Migration completed successfully!');
    
    // Step 2: Verify the migration
    console.log('🔍 Verifying migration...');
    
    const products = await bridge.getProducts();
    const orders = await bridge.getOrders();
    const users = await bridge.getUsers();
    const settings = await bridge.getSettings();
    
    console.log('📊 Migration Summary:');
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Settings: ${Object.keys(settings).length}`);
    
    console.log('🎉 All data has been successfully migrated to Firebase!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateExistingData()
    .then(() => {
      console.log('✅ Migration script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateExistingData };
