// systemDebug.js - Debug display template
// Follows dataDisplay.js structure

function createSystemDebugTemplate(logs) {
    if (!logs || logs.length === 0) {
        return '<div class="no-data">No debug logs available.</div>';
    }
    // Filter for only the most recent 'Business Profile' log
    const businessProfileLog = [...logs].reverse().find(log => log.operationType === 'Business Profile');
    if (!businessProfileLog) {
        return '<div class="no-data">No Business Profile debug log available.</div>';
    }
    return `
        <div class="debug-log-list">
            <div class="debug-log-item">
                <div class="debug-log-summary" onclick="toggleDebugLogDetails('${businessProfileLog.id}')">
                    <span class="debug-log-index">#1</span>
                    <span class="debug-log-type">Business Profile</span>
                    <span class="debug-log-time">${new Date(businessProfileLog.startTime).toLocaleTimeString()}</span>
                    <span class="debug-log-duration">${businessProfileLog.duration ? businessProfileLog.duration + 'ms' : ''}</span>
                    <span class="debug-log-expand">▼</span>
                </div>
                <div class="debug-log-details" id="debug-log-details-${businessProfileLog.id}" style="display:none;">
                    <div><strong>Request:</strong><pre>${JSON.stringify(businessProfileLog.request, null, 2)}</pre></div>
                    <div><strong>Steps:</strong>${businessProfileLog.background && businessProfileLog.background.length ? `<ul>${businessProfileLog.background.map(step => `<li><pre>${JSON.stringify(step, null, 2)}</pre></li>`).join('')}</ul>` : '-'}</div>
                    <div><strong>Response:</strong><pre>${JSON.stringify(businessProfileLog.response, null, 2)}</pre></div>
                    <div><strong>Tokens:</strong> ${businessProfileLog.tokens || '-'} | <strong>Cost:</strong> ${businessProfileLog.cost || '-'}</div>
                    <div><strong>Error:</strong> ${businessProfileLog.error || '-'}</div>
                </div>
            </div>
        </div>
    `;
}

window.createSystemDebugTemplate = createSystemDebugTemplate;
