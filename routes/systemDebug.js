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

// Route to get content strategy debug data
router.get('/content-strategy-debug', (req, res) => {
  try {
    const debugData = global.contentStrategyDebugData || null;
    if (debugData) {
      res.json({
        success: true,
        data: debugData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'No content strategy debug data available',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching content strategy debug data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route to get web search debug data
router.get('/web-search-debug', (req, res) => {
  try {
    const debugData = global.webSearchDebugData || null;
    if (debugData) {
      res.json({
        success: true,
        data: debugData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'No web search debug data available',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching web search debug data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route to get reddit debug data
router.get('/reddit-debug', (req, res) => {
  try {
    const debugData = global.redditDebugData || null;
    if (debugData) {
      res.json({
        success: true,
        data: debugData,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: false,
        message: 'No reddit debug data available',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error fetching reddit debug data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
