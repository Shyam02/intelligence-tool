// API testing routes
const express = require('express');
const router = express.Router();

// Import services for testing
const { testClaudeAPI } = require('../services/ai');
const { testBraveAPI } = require('../services/search');
const { testRedditAPI } = require('../services/reddit');

// Test API key endpoint
router.get('/test', async (req, res) => {
  try {
    const results = {};
    
    // Test Claude API
    results.claude = await testClaudeAPI();
    
    // Test Brave API
    results.brave = await testBraveAPI();
    
    // Test Reddit API
    results.reddit = await testRedditAPI();
    
    // Determine overall status
    const allSuccessful = results.claude.status === 'success' && 
                         results.brave.status === 'success' && 
                         results.reddit.status === 'success';
    
    res.json({ 
      timestamp: new Date().toISOString(),
      tests: results,
      overall_status: allSuccessful ? 'success' : 'partial'
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    res.status(500).json({ 
      error: 'API test failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;