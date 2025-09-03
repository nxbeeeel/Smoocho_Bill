const http = require('http');

async function testNewFeatures() {
  console.log('🚀 **TESTING NEW FEATURES** 🚀\n');
  
  // Test menu endpoints
  console.log('📋 **Testing Menu Endpoints:**');
  try {
    const menuResponse = await makeRequest('GET', '/menu/items');
    console.log('✅ Menu items:', menuResponse.data.length, 'items found');
    
    if (menuResponse.data.length > 0) {
      console.log('   Sample item:', menuResponse.data[0].name);
    }
  } catch (error) {
    console.log('❌ Menu items failed:', error.message);
  }
  
  // Test settings endpoints
  console.log('\n⚙️ **Testing Settings Endpoints:**');
  try {
    const settingsResponse = await makeRequest('GET', '/settings');
    console.log('✅ Settings loaded successfully');
    console.log('   Available settings:', Object.keys(settingsResponse.data).join(', '));
    
    if (settingsResponse.data.system) {
      console.log('   Business name:', settingsResponse.data.system.business_name);
    }
  } catch (error) {
    console.log('❌ Settings failed:', error.message);
  }
  
  // Test inventory endpoints
  console.log('\n📦 **Testing Inventory Endpoints:**');
  try {
    const inventoryResponse = await makeRequest('GET', '/inventory');
    console.log('✅ Inventory:', inventoryResponse.data.length, 'items found');
    
    if (inventoryResponse.data.length > 0) {
      console.log('   Sample item:', inventoryResponse.data[0].name);
    }
  } catch (error) {
    console.log('❌ Inventory failed:', error.message);
  }
  
  // Test stock management endpoints
  console.log('\n📊 **Testing Stock Management Endpoints:**');
  try {
    const stockReportResponse = await makeRequest('GET', '/stock-management/report');
    console.log('✅ Stock report generated successfully');
    console.log('   Total items:', stockReportResponse.data.summary.totalItems);
  } catch (error) {
    console.log('❌ Stock management failed:', error.message);
  }
  
  console.log('\n🎉 **NEW FEATURES TEST COMPLETE!** 🎉');
  console.log('\n✨ **What\'s Now Available:**');
  console.log('   • 📋 Menu Management (CRUD operations)');
  console.log('   • ⚙️ System Settings (Business, POS, Notifications)');
  console.log('   • 📦 Inventory Management (Manual stock control)');
  console.log('   • 📊 Stock Management (Daily/nightly counts)');
  console.log('   • 🤖 AI Features (Predictions, analytics)');
  console.log('   • 🔧 Order Management (Without auto-inventory)');
}

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

if (require.main === module) {
  testNewFeatures().catch(console.error);
}

module.exports = { testNewFeatures };
