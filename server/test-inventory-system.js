const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test the new inventory-linked menu system
async function testInventorySystem() {
  console.log('🚀 **TESTING INVENTORY-LINKED MENU SYSTEM** 🚀\n');

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
        console.log(`   - ${item.name}: ${item.current_stock} ${item.unit} (Min: ${item.minimum_stock})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get inventory:', error.message);
  }
  console.log('');

  // Test 2: Check recipe for Hazelnut Kunafa
  console.log('🍰 **Test 2: Recipe for Hazelnut Kunafa**');
  try {
    const recipeResponse = await makeRequest({
      method: 'GET',
      path: '/orders/recipes/prod-1'
    });
    
    if (recipeResponse.success) {
      console.log('✅ Recipe found:');
      console.log(`   Menu Item: ${recipeResponse.data.menuItemName}`);
      console.log(`   Total Cost: $${recipeResponse.data.totalCost.toFixed(2)}`);
      console.log(`   Preparation Time: ${recipeResponse.data.preparationTime} minutes`);
      console.log('   Ingredients:');
      recipeResponse.data.ingredients.forEach(ing => {
        console.log(`     - ${ing.inventoryItemName}: ${ing.quantity} ${ing.unit} (Cost: $${ing.costPerUnit})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get recipe:', error.message);
  }
  console.log('');

  // Test 3: Check ingredients availability
  console.log('🔍 **Test 3: Check if we can make 2 Hazelnut Kunafa**');
  try {
    const availabilityResponse = await makeRequest({
      method: 'GET',
      path: '/orders/recipes/prod-1/availability?quantity=2'
    });
    
    if (availabilityResponse.success) {
      console.log('✅ Availability check:');
      console.log(`   Can make: ${availabilityResponse.data.canMake}`);
      console.log(`   Available quantity: ${availabilityResponse.data.availableQuantity}`);
      if (availabilityResponse.data.missingIngredients.length > 0) {
        console.log('   Missing ingredients:');
        availabilityResponse.data.missingIngredients.forEach(ing => {
          console.log(`     - ${ing}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Failed to check availability:', error.message);
  }
  console.log('');

  // Test 4: Create and process an order
  console.log('🛒 **Test 4: Create and Process Order**');
  try {
    // Create order
    const orderData = {
      customerId: 'cust-1',
      items: [
        {
          menuItemId: 'prod-1',
          menuItemName: 'Hazelnut Kunafa',
          quantity: 2,
          unitPrice: 60.0,
          totalPrice: 120.0
        }
      ],
      totalAmount: 120.0,
      status: 'pending',
      isTakeaway: false,
      tableNumber: 5
    };

    const createOrderResponse = await makeRequest({
      method: 'POST',
      path: '/orders/create',
      body: JSON.stringify(orderData),
      headers: { 'Content-Type': 'application/json' }
    });

    if (createOrderResponse.success) {
      console.log('✅ Order created successfully:');
      console.log(`   Order ID: ${createOrderResponse.data.orderId}`);
      console.log(`   Total Amount: $${createOrderResponse.data.totalAmount}`);
      console.log(`   Status: ${createOrderResponse.data.status}`);

      // Now process the order to consume inventory
      const processOrderResponse = await makeRequest({
        method: 'POST',
        path: `/orders/${createOrderResponse.data.orderId}/process`
      });

      if (processOrderResponse.success) {
        console.log('✅ Order processed successfully!');
        console.log('   Inventory consumed:');
        processOrderResponse.data.inventoryConsumption.forEach(consumed => {
          console.log(`     - Item ${consumed.inventoryItemId}: ${consumed.quantityConsumed} units consumed`);
          console.log(`       Remaining stock: ${consumed.remainingStock}`);
          console.log(`       Low stock alert: ${consumed.lowStockAlert ? 'YES' : 'NO'}`);
        });

        if (processOrderResponse.data.lowStockAlerts.length > 0) {
          console.log('   ⚠️  Low stock alerts:');
          processOrderResponse.data.lowStockAlerts.forEach(alert => {
            console.log(`     - ${alert}`);
          });
        }
      } else {
        console.log('❌ Failed to process order:', processOrderResponse.message);
      }
    }
  } catch (error) {
    console.log('❌ Failed to create/process order:', error.message);
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
        console.log(`   - ${item.name}: ${item.current_stock} ${item.unit} (Min: ${item.minimum_stock})`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get updated inventory:', error.message);
  }
  console.log('');

  // Test 6: Get low stock alerts
  console.log('⚠️  **Test 6: Low Stock Alerts**');
  try {
    const alertsResponse = await makeRequest({
      method: 'GET',
      path: '/orders/low-stock-alerts'
    });
    
    if (alertsResponse.success) {
      console.log('✅ Low stock alerts:');
      if (alertsResponse.data.critical.length > 0) {
        console.log('   🚨 Critical alerts:');
        alertsResponse.data.critical.forEach(alert => {
          console.log(`     - ${alert.menuItem}: ${alert.ingredient} - Current: ${alert.currentStock}, Min: ${alert.minimumStock}`);
        });
      }
      
      if (alertsResponse.data.warning.length > 0) {
        console.log('   ⚠️  Warning alerts:');
        alertsResponse.data.warning.forEach(alert => {
          console.log(`     - ${alert.menuItem}: ${alert.ingredient} - Current: ${alert.currentStock}, Min: ${alert.minimumStock}`);
        });
      }

      if (alertsResponse.data.critical.length === 0 && alertsResponse.data.warning.length === 0) {
        console.log('   ✅ No low stock alerts at the moment');
      }
    }
  } catch (error) {
    console.log('❌ Failed to get low stock alerts:', error.message);
  }
  console.log('');

  // Test 7: Cost analysis
  console.log('💰 **Test 7: Cost Analysis for Hazelnut Kunafa**');
  try {
    const costAnalysisResponse = await makeRequest({
      method: 'GET',
      path: '/orders/recipes/prod-1/cost-analysis'
    });
    
    if (costAnalysisResponse.success) {
      console.log('✅ Cost analysis:');
      console.log(`   Menu Item: ${costAnalysisResponse.data.menuItem}`);
      console.log(`   Total Cost: $${costAnalysisResponse.data.totalCost.toFixed(2)}`);
      console.log(`   Suggested Price: $${costAnalysisResponse.data.suggestedPrice.toFixed(2)}`);
      console.log(`   Profit Margin: ${costAnalysisResponse.data.profitMargin.toFixed(1)}%`);
      console.log('   Cost breakdown:');
      costAnalysisResponse.data.ingredients.forEach(ing => {
        console.log(`     - ${ing.name}: $${ing.cost.toFixed(2)} (${ing.percentage.toFixed(1)}%)`);
      });
    }
  } catch (error) {
    console.log('❌ Failed to get cost analysis:', error.message);
  }

  console.log('\n🎉 **INVENTORY SYSTEM TEST COMPLETE!** 🎉');
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
  testInventorySystem().catch(console.error);
}

module.exports = { testInventorySystem };
