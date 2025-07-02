// ===== routes/intelligence.js =====
// Intelligence-related routes
const express = require('express');
const router = express.Router();

// Import controllers
const { generateIntelligence } = require('../controllers/businessIntelligence');
const { generateQueries } = require('../controllers/webSearchQueries');
const { crawlWebsiteController } = require('../controllers/websiteCrawling');
const { generateContentStrategy } = require('../controllers/contentStrategy');

// Website crawling route
router.post('/crawlWebsite', crawlWebsiteController);

// Intelligence generation routes
router.post('/generateIntelligence', generateIntelligence);
router.post('/generateQueries', generateQueries);
router.post('/generateContentStrategy', generateContentStrategy);

module.exports = router;