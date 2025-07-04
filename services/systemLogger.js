// systemLogger.js
// Modular logging service for debug dashboard

const logs = [];
const MAX_LOGS = 50;

function startOperation(operationType, meta = {}) {
    const id = Date.now() + Math.random().toString(36).slice(2);
    const entry = {
        id,
        operationType,
        meta,
        startTime: Date.now(),
        request: null,
        response: null,
        background: null,
        tokens: null,
        cost: null,
        error: null,
        duration: null
    };
    logs.push(entry);
    if (logs.length > MAX_LOGS) logs.shift();
    return id;
}

function endOperation(id, { request, response, background, tokens, cost, error }) {
    const entry = logs.find(l => l.id === id);
    if (!entry) return;
    entry.request = request;
    entry.response = response;
    entry.background = background;
    entry.tokens = tokens;
    entry.cost = cost;
    entry.error = error || null;
    entry.duration = Date.now() - entry.startTime;
}

function getLogs() {
    // Return a copy to avoid mutation
    return logs.slice().reverse();
}

function clearLogs() {
    logs.length = 0;
}

function logStep(id, step) {
    const entry = logs.find(l => l.id === id);
    if (!entry) return;
    if (!entry.background) entry.background = [];
    entry.background.push(step);
}

module.exports = {
    startOperation,
    logStep,
    endOperation,
    getLogs,
    clearLogs
};
