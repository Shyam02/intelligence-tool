// Search-related routes
const express = require('express');
const router = express.Router();

// Import controllers
const { executeSearch } = require('../controllers/search');

// Search routes
router.post('/executeSearch', executeSearch);

module.exports = router;