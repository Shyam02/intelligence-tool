// Content generation routes
const express = require('express');
const router = express.Router();

// Import controllers
const { generateTwitterBriefs } = require('../controllers/twitter');

// Twitter content routes
router.post('/generateTwitterBriefs', generateTwitterBriefs);

module.exports = router;