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

// Route to get competitor intelligence debug data
router.get('/competitor-debug', (req, res) => {
  try {
    const debugData = global.competitorDebugData || null;
    if (debugData) {
      res.json({
        success: true,
        data: debugData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'No competitor intelligence debug data available',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching competitor debug data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
