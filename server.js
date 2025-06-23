// Main server file - simplified and modular
const express = require('express');
const cors = require('cors');
const path = require('path');
const { config, validateConfig } = require('./config/config');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Validate configuration on startup
if (!validateConfig()) {
  console.error('❌ Server startup failed due to configuration errors');
  process.exit(1);
}

// API routes
app.use('/api', apiRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log('✅ Configuration validated successfully');
  console.log('📁 Modular architecture loaded:');
  console.log('   - Config management');
  console.log('   - Claude AI service');
  console.log('   - Brave Search service');
  console.log('   - Intelligence controller');
  console.log('   - Search controller');
  console.log('   - Twitter controller');
  console.log('   - API routes');
});