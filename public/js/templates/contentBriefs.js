// Content Briefs Template Functions
// File path: /public/js/templates/contentBriefs.js

// Template for content briefs display
function createContentBriefsTemplate(briefsData) {
    let briefsHTML = `
        <h3>📝 Content Briefs</h3>
        <div class="briefs-summary">
            <p><strong>Articles Evaluated:</strong> ${briefsData.evaluated_count}</p>
            <p><strong>Viable Articles:</strong> ${briefsData.viable_count}</p>
            <p><strong>Total Briefs Generated:</strong> ${briefsData.total_briefs}</p>
        </div>
    `;
    
    briefsData.results.forEach(result => {
        briefsHTML += `
            <div class="article-brief-section">
                <h4 class="article-brief-title">${result.article_title}</h4>
        `;
        
        if (result.viable) {
            result.briefs.forEach((brief, index) => {
                briefsHTML += `
                    <div class="content-brief-card">
                        <div class="brief-header">
                            <span class="brief-angle">Angle ${index + 1}: ${brief.angle}</span>
                            <span class="brief-type">${brief.content_type}</span>
                        </div>
                        <div class="brief-content">
                            <p class="brief-hook"><strong>Hook:</strong> ${brief.hook}</p>
                            <div class="tweet-preview">
                                <p>${brief.content}</p>
                                <p class="tweet-length">${brief.content.length}/280 characters</p>
                            </div>
                            <div class="brief-metadata">
                                <p><strong>Strategy:</strong> ${brief.engagement_strategy}</p>
                                <p><strong>Hashtags:</strong> ${brief.hashtags.join(' ')}</p>
                            </div>
                        </div>
                        <button class="copy-tweet-btn" onclick="copyTweet('${brief.content.replace(/'/g, "\\'")}', this)">📋 Copy Tweet</button>
                    </div>
                `;
            });
        } else {
            briefsHTML += `
                <div class="rejection-notice">
                    <p>❌ <strong>Not viable for content creation:</strong> ${result.rejection_reason}</p>
                </div>
            `;
        }
        
        briefsHTML += `</div>`;
    });
    
    return briefsHTML;
}

function createContentBriefsDebugTemplate(debugData) {
    let html = '<div class="debug-detailed-section">';
    html += `<h4>📝 Content Briefs Debug - Complete Details</h4>`;
    html += `<p><strong>Started:</strong> ${debugData.timestamp}</p>`;
    if (debugData.summary) {
        html += `<h5>📊 Summary:</h5>`;
        html += `<div class="debug-summary-detailed">`;
        html += `<p><strong>Viable Count:</strong> ${debugData.summary.viableCount}</p>`;
        html += `<p><strong>Total Briefs:</strong> ${debugData.summary.totalBriefs}</p>`;
        html += `<p><strong>Evaluated Count:</strong> ${debugData.summary.evaluatedCount}</p>`;
        html += '</div>';
    }
    if (debugData.steps && debugData.steps.length > 0) {
        html += '<h5>📝 Steps:</h5>';
        html += '<div class="debug-steps-detailed">';
        debugData.steps.forEach((step, idx) => {
            html += `<div class="debug-step-detailed">`;
            html += `<strong>${idx + 1}. ${step.step}</strong> <span class="timestamp">${step.timestamp}</span>`;
            if (step.logic) {
                html += `<details><summary>View Logic & Source</summary><div class="debug-logic">`;
                html += `<p><strong>Description:</strong> ${step.logic.description}</p>`;
                html += `<p><strong>Source:</strong> <code>${step.logic.sourceFile}</code> - <code>${step.logic.functionName}</code></p>`;
                html += '</div></details>';
            }
            if (step.prompt) {
                html += `<details><summary>View Prompt</summary><pre class="debug-prompt">${step.prompt}</pre></details>`;
            }
            if (step.response) {
                html += `<details><summary>View AI Response</summary><pre class="debug-response">${step.response}</pre></details>`;
            }
            if (step.parsedBriefs) {
                html += `<details><summary>View Parsed Briefs</summary><pre class="debug-data">${JSON.stringify(step.parsedBriefs, null, 2)}</pre></details>`;
            }
            if (step.error) {
                html += `<div class="debug-error"><strong>Error:</strong> ${step.error}</div>`;
            }
            html += '</div>';
        });
        html += '</div>';
    }
    if (debugData.error) {
        html += `<div class="debug-error"><strong>Error:</strong> ${debugData.error}</div>`;
    }
    html += '</div>';
    return html;
}