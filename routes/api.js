// API routes definition
const express = require('express');
const router = express.Router();

// Import services
const { testClaudeAPI } = require('../services/claude');
const { testBraveAPI } = require('../services/brave');

// Import controllers
const { generateIntelligence, generateQueries, crawlWebsiteController } = require('../controllers/intelligence');
const { executeSearch } = require('../controllers/search');
const { generateTwitterBriefs } = require('../controllers/twitter');

// Test API key endpoint
router.get('/test', async (req, res) => {
  try {
    const results = {};
    
    // Test Claude API
    results.claude = await testClaudeAPI();
    
    // Test Brave API
    results.brave = await testBraveAPI();
    
    res.json({ 
      timestamp: new Date().toISOString(),
      tests: results,
      overall_status: (results.claude.status === 'success' && results.brave.status === 'success') ? 'success' : 'partial'
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    res.status(500).json({ 
      error: 'API test failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Website crawling route (NEW)
router.post('/crawl-website', crawlWebsiteController);

// Intelligence generation routes
router.post('/generate-intelligence', generateIntelligence);
router.post('/generate-queries', generateQueries);

// Search routes
router.post('/execute-search', executeSearch);

// Twitter content routes
router.post('/generate-twitter-briefs', generateTwitterBriefs);

module.exports = router;