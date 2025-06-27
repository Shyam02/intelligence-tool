// Main server file - simplified and modular
const express = require('express');
const cors = require('cors');
const path = require('path');
const { config, validateConfig } = require('./config/config');

// Import separated route files
const testingRoutes = require('./routes/testing');
const intelligenceRoutes = require('./routes/intelligence');
const contentRoutes = require('./routes/content');
const searchRoutes = require('./routes/search');
const redditRoutes = require('./routes/reddit');

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

// Mount all API routes on /api prefix
app.use('/api', testingRoutes);
app.use('/api', intelligenceRoutes);
app.use('/api', contentRoutes);
app.use('/api', searchRoutes);
app.use('/api', redditRoutes);

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
  console.log('   - Reddit API service');
  console.log('   - Separated controllers (5 files)');
  console.log('   - Separated routes (5 files)');
  console.log('   - API testing routes');
  console.log('   - Intelligence routes');
  console.log('   - Content routes');
  console.log('   - Search routes');
  console.log('   - Reddit routes');
});