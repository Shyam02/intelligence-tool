// Content generation routes
const express = require('express');
const router = express.Router();

// Import controllers
const { generateTwitterBriefs } = require('../controllers/twitter');
const { generateTwitterContent, regenerateContent } = require('../controllers/contentGeneration');

// Twitter content routes
router.post('/generateTwitterBriefs', generateTwitterBriefs);

// NEW: Content generation routes
router.post('/generateTwitterContent', generateTwitterContent);
router.post('/regenerateContent', regenerateContent);

module.exports = router;