// systemDebug.js - Debug UI handler

async function fetchDebugLogs() {
    try {
        const res = await fetch('/api/systemDebug/logs');
        const data = await res.json();
        if (data.success) {
            window.appState.debugLogs = data.logs;
            renderDebugLogs();
        }
    } catch (err) {
        console.error('Failed to load debug logs:', err);
        document.getElementById('systemDebugContainer').innerHTML = '<div class="error">Failed to load debug logs.</div>';
    }
}

function renderDebugLogs() {
    const container = document.getElementById('systemDebugContainer');
    if (!container) return;
    const logs = window.appState.debugLogs || [];
    container.innerHTML = createSystemDebugTemplate(logs);
}

function toggleDebugLogDetails(id) {
    const details = document.getElementById('debug-log-details-' + id);
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

function clearDebugLogs() {
    fetch('/api/systemDebug/logs/clear', { method: 'POST' })
        .then(() => fetchDebugLogs());
}

// Expose for HTML
window.fetchDebugLogs = fetchDebugLogs;
window.toggleDebugLogDetails = toggleDebugLogDetails;
window.clearDebugLogs = clearDebugLogs;
