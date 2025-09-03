const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});
