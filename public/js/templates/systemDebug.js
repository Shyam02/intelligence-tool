// systemDebug.js - Debug display template
// Follows dataDisplay.js structure

function createSystemDebugTemplate(logs) {
    if (!logs || logs.length === 0) {
        return '<div class="no-data">No debug logs available.</div>';
    }
    return `
        <div class="debug-log-list">
            ${logs.map((log, idx) => `
                <div class="debug-log-item">
                    <div class="debug-log-summary" onclick="toggleDebugLogDetails('${log.id}')">
                        <span class="debug-log-index">#${logs.length - idx}</span>
                        <span class="debug-log-type">${log.operationType || 'Operation'}</span>
                        <span class="debug-log-time">${new Date(log.startTime).toLocaleTimeString()}</span>
                        <span class="debug-log-duration">${log.duration ? log.duration + 'ms' : ''}</span>
                        <span class="debug-log-expand">▼</span>
                    </div>
                    <div class="debug-log-details" id="debug-log-details-${log.id}" style="display:none;">
                        <div><strong>Request:</strong><pre>${JSON.stringify(log.request, null, 2)}</pre></div>
                        <div><strong>Background:</strong><pre>${JSON.stringify(log.background, null, 2)}</pre></div>
                        <div><strong>Response:</strong><pre>${JSON.stringify(log.response, null, 2)}</pre></div>
                        <div><strong>Tokens:</strong> ${log.tokens || '-'} | <strong>Cost:</strong> ${log.cost || '-'}</div>
                        <div><strong>Error:</strong> ${log.error || '-'}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.createSystemDebugTemplate = createSystemDebugTemplate;
