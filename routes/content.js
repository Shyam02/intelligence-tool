// Content generation routes
const express = require('express');
const router = express.Router();

// Import controllers
const { generateContentBriefs } = require('../controllers/contentBriefs');
const { generateTwitterContent, regenerateContent } = require('../controllers/contentGeneration');

// Content brief routes
router.post('/generateContentBriefs', generateContentBriefs);

// NEW: Content generation routes
router.post('/generateTwitterContent', generateTwitterContent);
router.post('/regenerateContent', regenerateContent);

module.exports = router;