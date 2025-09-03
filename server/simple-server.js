const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Simple server is running!'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
});
