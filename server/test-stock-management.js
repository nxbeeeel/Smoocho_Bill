const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test the new manual stock management system
async function testStockManagement() {
  console.log('🚀 **TESTING MANUAL STOCK MANAGEMENT SYSTEM** 🚀\n');

  // Test 1: Check current inventory
  console.log('📦 **Test 1: Current Inventory Status**');
  try {
    const inventoryResponse = await makeRequest({
      method: 'GET',
      path: '/inventory'
    });
    
    if (inventoryResponse.success) {
      console.log('✅ Current inventory items:');
      inventoryResponse.data.forEach(item => {
        console.log(`   - ${item.name}: ${item.current_stock} ${item.unit} (Min: ${item.minimum_stock}, Max: ${item.maximum_stock})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get inventory:', error.message);
  }
  console.log('');

  // Test 2: Perform daily stock count
  console.log('🌅 **Test 2: Perform Daily Stock Count**');
  try {
    const dailyCountData = {
      counts: [
        {
          inventoryItemId: 'inv-1',
          countedQuantity: 8.5,
          notes: 'Found extra 0.5 liters in storage',
          location: 'Main storage'
        },
        {
          inventoryItemId: 'inv-2',
          countedQuantity: 1.8,
          notes: 'Some sugar spilled, adjusted count',
          location: 'Kitchen storage'
        }
      ],
      countedBy: 'staff-member-1'
    };

    const dailyCountResponse = await makeRequest({
      method: 'POST',
      path: '/stock-management/counts/daily',
      body: JSON.stringify(dailyCountData),
      headers: { 'Content-Type': 'application/json' }
    });

    if (dailyCountResponse.success) {
      console.log('✅ Daily stock count completed:');
      console.log(`   Total items counted: ${dailyCountResponse.data.summary.totalCounted}`);
      console.log(`   Total variance: ${dailyCountResponse.data.summary.totalVariance}`);
      console.log(`   Items with variance: ${dailyCountResponse.data.summary.itemsWithVariance}`);
      
      console.log('   Count details:');
      dailyCountResponse.data.counts.forEach(count => {
        console.log(`     - ${count.inventoryItemName}: Counted ${count.countedQuantity}, Previous ${count.previousQuantity}, Difference ${count.difference}`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to perform daily count:', error.message);
  }
  console.log('');

  // Test 3: Perform nightly stock count
  console.log('🌙 **Test 3: Perform Nightly Stock Count**');
  try {
    const nightlyCountData = {
      counts: [
        {
          inventoryItemId: 'inv-1',
          countedQuantity: 7.2,
          notes: 'Used for evening orders',
          location: 'Main storage'
        },
        {
          inventoryItemId: 'inv-2',
          countedQuantity: 1.5,
          notes: 'Used for evening orders',
          location: 'Kitchen storage'
        }
      ],
      countedBy: 'staff-member-2'
    };

    const nightlyCountResponse = await makeRequest({
      method: 'POST',
      path: '/stock-management/counts/nightly',
      body: JSON.stringify(nightlyCountData),
      headers: { 'Content-Type': 'application/json' }
    });

    if (nightlyCountResponse.success) {
      console.log('✅ Nightly stock count completed:');
      console.log(`   Total items counted: ${nightlyCountResponse.data.summary.totalCounted}`);
      console.log(`   Total variance: ${nightlyCountResponse.data.summary.totalVariance}`);
      console.log(`   Items with variance: ${nightlyCountResponse.data.summary.itemsWithVariance}`);
    }
  } catch (error) {
    console.log('❌ Failed to perform nightly count:', error.message);
  }
  console.log('');

  // Test 4: Manual stock adjustment
  console.log('🔧 **Test 4: Manual Stock Adjustment**');
  try {
    const adjustmentData = {
      inventoryItemId: 'inv-1',
      adjustmentType: 'add',
      quantity: 2.0,
      reason: 'Received new milk delivery',
      adjustedBy: 'manager-1',
      reference: 'DEL-001',
      notes: 'Fresh milk from local supplier'
    };

    const adjustmentResponse = await makeRequest({
      method: 'POST',
      path: '/stock-management/adjustments',
      body: JSON.stringify(adjustmentData),
      headers: { 'Content-Type': 'application/json' }
    });

    if (adjustmentResponse.success) {
      console.log('✅ Stock adjustment completed:');
      console.log(`   Item: ${adjustmentResponse.data.inventoryItemName}`);
      console.log(`   Type: ${adjustmentResponse.data.adjustmentType}`);
      console.log(`   Quantity: ${adjustmentResponse.data.quantity}`);
      console.log(`   Reason: ${adjustmentResponse.data.reason}`);
      console.log(`   Adjusted by: ${adjustmentResponse.data.adjustedBy}`);
    }
  } catch (error) {
    console.log('❌ Failed to adjust stock:', error.message);
  }
  console.log('');

  // Test 5: Check updated inventory
  console.log('📦 **Test 5: Updated Inventory Status**');
  try {
    const updatedInventoryResponse = await makeRequest({
      method: 'GET',
      path: '/inventory'
    });
    
    if (updatedInventoryResponse.success) {
      console.log('✅ Updated inventory items:');
      updatedInventoryResponse.data.forEach(item => {
        console.log(`   - ${item.name}: ${item.current_stock} ${item.unit} (Min: ${item.minimum_stock}, Max: ${item.maximum_stock})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get updated inventory:', error.message);
  }
  console.log('');

  // Test 6: Generate stock report
  console.log('📊 **Test 6: Generate Stock Report**');
  try {
    const reportResponse = await makeRequest({
      method: 'GET',
      path: '/stock-management/report'
    });
    
    if (reportResponse.success) {
      console.log('✅ Stock report generated:');
      console.log(`   Total items: ${reportResponse.data.summary.totalItems}`);
      console.log(`   Normal items: ${reportResponse.data.summary.normalItems}`);
      console.log(`   Low stock items: ${reportResponse.data.summary.lowStockItems}`);
      console.log(`   Critical items: ${reportResponse.data.summary.criticalItems}`);
      console.log(`   Overstock items: ${reportResponse.data.summary.overstockItems}`);
      console.log(`   Total variance: ${reportResponse.data.summary.totalVariance}`);
      
      console.log('   Item details:');
      reportResponse.data.report.forEach(item => {
        console.log(`     - ${item.itemName}: ${item.currentStock} ${item.unit} (Status: ${item.status}, Variance: ${item.variance})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to generate stock report:', error.message);
  }
  console.log('');

  // Test 7: Get items needing count
  console.log('⚠️  **Test 7: Items Needing Count**');
  try {
    const itemsNeedingCountResponse = await makeRequest({
      method: 'GET',
      path: '/stock-management/items-needing-count?daysThreshold=1'
    });
    
    if (itemsNeedingCountResponse.success) {
      console.log('✅ Items needing count:');
      if (itemsNeedingCountResponse.data.critical.length > 0) {
        console.log('   🚨 Critical items:');
        itemsNeedingCountResponse.data.critical.forEach(item => {
          console.log(`     - ${item.itemName}: ${item.currentStock} ${item.unit} (Last counted: ${item.lastCounted.toDateString()})`);
        });
      }
      
      if (itemsNeedingCountResponse.data.warning.length > 0) {
        console.log('   ⚠️  Warning items:');
        itemsNeedingCountResponse.data.warning.forEach(item => {
          console.log(`     - ${item.itemName}: ${item.currentStock} ${item.unit} (Last counted: ${item.lastCounted.toDateString()})`);
        });
      }

      if (itemsNeedingCountResponse.data.normal.length > 0) {
        console.log('   ✅ Normal items:');
        itemsNeedingCountResponse.data.normal.forEach(item => {
          console.log(`     - ${item.itemName}: ${item.currentStock} ${item.unit} (Last counted: ${item.lastCounted.toDateString()})`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Failed to get items needing count:', error.message);
  }
  console.log('');

  // Test 8: Get daily count summary
  console.log('📅 **Test 8: Daily Count Summary**');
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const summaryResponse = await makeRequest({
      method: 'GET',
      path: `/stock-management/daily-summary/${today}`
    });
    
    if (summaryResponse.success) {
      console.log(`✅ Daily count summary for ${today}:`);
      console.log(`   Total items: ${summaryResponse.data.totalItems}`);
      console.log(`   Counted items: ${summaryResponse.data.countedItems}`);
      console.log(`   Uncounted items: ${summaryResponse.data.uncountedItems}`);
      console.log(`   Total variance: ${summaryResponse.data.totalVariance}`);
      console.log(`   Items with variance: ${summaryResponse.data.itemsWithVariance}`);
    }
  } catch (error) {
    console.log('❌ Failed to get daily count summary:', error.message);
  }
  console.log('');

  // Test 9: Get stock counts history
  console.log('📋 **Test 9: Stock Counts History**');
  try {
    const countsResponse = await makeRequest({
      method: 'GET',
      path: '/stock-management/counts?limit=5'
    });
    
    if (countsResponse.success) {
      console.log('✅ Recent stock counts:');
      countsResponse.data.forEach(count => {
        console.log(`   - ${count.inventoryItemName}: ${count.countedQuantity} ${count.unit} (${count.countType} count by ${count.countedBy} on ${new Date(count.countedAt).toDateString()})`);
        if (count.difference !== 0) {
          console.log(`     Variance: ${count.difference} ${count.unit} (${count.difference > 0 ? 'Found' : 'Missing'})`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Failed to get stock counts history:', error.message);
  }
  console.log('');

  // Test 10: Get stock adjustments history
  console.log('📝 **Test 10: Stock Adjustments History**');
  try {
    const adjustmentsResponse = await makeRequest({
      method: 'GET',
      path: '/stock-management/adjustments?limit=5'
    });
    
    if (adjustmentsResponse.success) {
      console.log('✅ Recent stock adjustments:');
      adjustmentsResponse.data.forEach(adjustment => {
        console.log(`   - ${adjustment.inventoryItemName}: ${adjustment.adjustmentType} ${adjustment.quantity} ${adjustment.unit} by ${adjustment.adjustedBy} on ${new Date(adjustment.adjustedAt).toDateString()}`);
        console.log(`     Reason: ${adjustment.reason}`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get stock adjustments history:', error.message);
  }

  console.log('\n🎉 **MANUAL STOCK MANAGEMENT SYSTEM TEST COMPLETE!** 🎉');
  console.log('\n✨ **Key Features Available:**');
  console.log('   • Daily and nightly stock counts');
  console.log('   • Manual stock adjustments (add/subtract/set)');
  console.log('   • Comprehensive stock reporting');
  console.log('   • Variance tracking and analysis');
  console.log('   • Items needing count alerts');
  console.log('   • Complete audit trail');
  console.log('   • No automatic inventory consumption');
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Run the test
if (require.main === module) {
  testStockManagement().catch(console.error);
}

module.exports = { testStockManagement };
