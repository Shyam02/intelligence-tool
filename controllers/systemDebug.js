const systemLogger = require('../services/systemLogger');

// Serve debug logs
function getDebugLogs(req, res) {
    try {
        const logs = systemLogger.getLogs();
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Clear debug logs
function clearDebugLogs(req, res) {
    try {
        systemLogger.clearLogs();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    getDebugLogs,
    clearDebugLogs
};
