// systemDebug.js - Debug API route (placeholder)
const express = require('express');
const router = express.Router();

// Placeholder route for future debug functionality
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'System debug routes are available',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
