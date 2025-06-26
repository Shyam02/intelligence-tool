// Intelligence-related routes
const express = require('express');
const router = express.Router();

// Import controllers
const { generateIntelligence } = require('../controllers/businessIntelligence');
const { generateQueries } = require('../controllers/queryGeneration');
const { crawlWebsiteController } = require('../controllers/websiteCrawling');

// Website crawling route
router.post('/crawl-website', crawlWebsiteController);

// Intelligence generation routes
router.post('/generate-intelligence', generateIntelligence);
router.post('/generate-queries', generateQueries);

module.exports = router;