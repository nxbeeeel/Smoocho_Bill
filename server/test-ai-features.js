const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const tests = [
  // Core Inventory Tests
  {
    name: 'Inventory Check Availability',
    method: 'POST',
    path: '/inventory/check-availability',
    body: JSON.stringify({ productIds: ['prod-1', 'prod-2'] }),
    headers: { 'Content-Type': 'application/json' }
  },
  
  // AI Service Tests
  {
    name: 'AI Inventory Predictions',
    method: 'GET',
    path: '/ai/inventory/predictions'
  },
  {
    name: 'AI Reorder Recommendations',
    method: 'GET',
    path: '/ai/inventory/reorder-recommendations'
  },
  {
    name: 'AI Sales Forecast',
    method: 'GET',
    path: '/ai/sales/forecast?timeframe=weekly&days=30'
  },
  {
    name: 'AI Seasonal Trends',
    method: 'GET',
    path: '/ai/trends/seasonal'
  },
  
  // Analytics Tests
  {
    name: 'Business Metrics (Daily)',
    method: 'GET',
    path: '/ai/analytics/metrics/daily'
  },
  {
    name: 'Business Metrics (Weekly)',
    method: 'GET',
    path: '/ai/analytics/metrics/weekly'
  },
  {
    name: 'Business Metrics (Monthly)',
    method: 'GET',
    path: '/ai/analytics/metrics/monthly'
  },
  {
    name: 'Business Metrics (Yearly)',
    method: 'GET',
    path: '/ai/analytics/metrics/yearly'
  },
  {
    name: 'Real-time Analytics',
    method: 'GET',
    path: '/ai/analytics/real-time'
  },
  {
    name: 'Customer Segments',
    method: 'GET',
    path: '/ai/analytics/customer-segments'
  },
  {
    name: 'Market Position Analysis',
    method: 'GET',
    path: '/ai/analytics/market-position'
  },
  {
    name: 'Operational Efficiency',
    method: 'GET',
    path: '/ai/analytics/operational-efficiency'
  },
  
  // Customer Experience Tests
  {
    name: 'Customer Profile',
    method: 'GET',
    path: '/ai/customers/profile/cust-1'
  },
  {
    name: 'Loyalty Tiers',
    method: 'GET',
    path: '/ai/customers/loyalty-tiers'
  },
  {
    name: 'Personalized Recommendations',
    method: 'GET',
    path: '/ai/customers/recommendations/cust-1'
  },
  {
    name: 'Customer Journey Optimization',
    method: 'GET',
    path: '/ai/customers/journey/cust-1'
  },
  {
    name: 'Customer Satisfaction',
    method: 'GET',
    path: '/ai/customers/satisfaction/daily'
  },
  
  // Operations Tests
  {
    name: 'Supply Chain Management',
    method: 'GET',
    path: '/ai/operations/supply-chain'
  },
  {
    name: 'Quality Control',
    method: 'GET',
    path: '/ai/operations/quality-control'
  },
  {
    name: 'Maintenance Schedule',
    method: 'GET',
    path: '/ai/operations/maintenance'
  },
  {
    name: 'Process Automation',
    method: 'GET',
    path: '/ai/operations/automation'
  },
  {
    name: 'Performance Monitoring',
    method: 'GET',
    path: '/ai/operations/performance'
  },
  {
    name: 'Risk Assessment',
    method: 'GET',
    path: '/ai/operations/risks'
  },
  {
    name: 'Improvement Plan',
    method: 'GET',
    path: '/ai/operations/improvement-plan'
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: test.path,
      method: test.method,
      headers: test.headers || {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            name: test.name,
            status: res.statusCode,
            success: jsonData.success,
            message: jsonData.message,
            dataLength: jsonData.data ? (Array.isArray(jsonData.data) ? jsonData.data.length : Object.keys(jsonData.data).length) : 0
          });
        } catch (e) {
          resolve({
            name: test.name,
            status: res.statusCode,
            success: false,
            message: 'Invalid JSON response',
            dataLength: 0
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({
        name: test.name,
        error: err.message
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 **SMOOCHO BILL AI FEATURES TEST SUITE** 🚀\n');
  console.log('Testing all AI-powered endpoints...\n');
  
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test);
      results.push(result);
      
      if (result.status === 200 && result.success) {
        console.log(`✅ ${result.name}`);
        console.log(`   Status: ${result.status} | Data: ${result.dataLength} items | Message: ${result.message}`);
        passed++;
      } else {
        console.log(`❌ ${result.name}`);
        console.log(`   Status: ${result.status} | Success: ${result.success} | Message: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.error}`);
      failed++;
    }
    console.log('');
  }
  
  // Summary
  console.log('📊 **TEST RESULTS SUMMARY** 📊');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 **ALL TESTS PASSED!** 🎉');
    console.log('Your Smoocho Bill POS system is working perfectly with all AI features!');
  } else {
    console.log('\n⚠️  **SOME TESTS FAILED** ⚠️');
    console.log('Please check the failed endpoints above.');
  }
  
  return { passed, failed, total: tests.length };
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, tests };
