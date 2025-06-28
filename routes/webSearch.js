// ===== routes/webSearch.js =====
// Web search-related routes
const express = require('express');
const router = express.Router();

// Import controllers
const { executeSearch } = require('../controllers/webSearch');

// Web search routes
router.post('/executeSearch', executeSearch);

module.exports = router;