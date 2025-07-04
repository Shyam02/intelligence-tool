// systemDebug.js - Debug API route
const express = require('express');
const router = express.Router();
const { getDebugLogs, clearDebugLogs } = require('../controllers/systemDebug');

router.get('/logs', getDebugLogs);
router.post('/logs/clear', clearDebugLogs);

module.exports = router;
