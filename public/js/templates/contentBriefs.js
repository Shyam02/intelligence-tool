// Content Briefs Template Functions
// File path: /public/js/templates/contentBriefs.js

// Template for strategic content briefs display
function createContentBriefsTemplate(briefsData) {
    let briefsHTML = `
        <div class="strategic-briefs-container">
            <h3>📋 Strategic Content Briefs</h3>
            <div class="briefs-summary">
                <div class="summary-stats">
                    <span><strong>Articles Evaluated:</strong> ${briefsData.evaluated_count}</span>
                    <span><strong>Viable Articles:</strong> ${briefsData.viable_count}</span>
                    <span><strong>Strategic Briefs:</strong> ${briefsData.total_briefs}</span>
                    <span><strong>Generated:</strong> ${new Date().toLocaleString()}</span>
                </div>
            </div>
            
            <div class="content-generation-trigger">
                <button class="generate-content-btn" onclick="generateContentFromBriefs()">
                    🎨 Generate Final Content from Strategic Briefs
                </button>
                <p class="generation-help">Transform your strategic briefs into ready-to-post content</p>
            </div>
            
            <div class="strategic-briefs-list">
    `;
    
    briefsData.results.forEach(result => {
        briefsHTML += `
            <div class="article-brief-section">
                <h4 class="article-brief-title">📄 ${result.article_title}</h4>
        `;
        
        if (result.viable) {
            result.briefs.forEach((brief, index) => {
                briefsHTML += createStrategicBriefCard(brief, index);
            });
        } else {
            briefsHTML += `
                <div class="rejection-notice">
                    <div class="rejection-content">
                        <h5>❌ Not Viable for Content Creation</h5>
                        <p><strong>Reason:</strong> ${result.rejection_reason}</p>
                        <p class="rejection-note">This article lacks the specific information or business relevance needed for authentic content creation.</p>
                    </div>
                </div>
            `;
        }
        
        briefsHTML += `</div>`;
    });
    
    briefsHTML += `
            </div>
        </div>
    `;
    
    return briefsHTML;
}

// Template for individual strategic brief card
function createStrategicBriefCard(brief, index) {
    const channelBadges = brief.target_channels.map(channel => 
        `<span class="channel-badge channel-${channel}">${channel}</span>`
    ).join('');
    
    const contentType = brief.content_type === 'multi_modal' ? 'Text + Visual' : 'Text Only';
    
    return `
        <div class="strategic-brief-card" data-brief-id="${brief.brief_id}">
            <div class="brief-header">
                <div class="brief-title-section">
                    <h5 class="brief-angle">📈 ${brief.content_angle}</h5>
                    <div class="brief-metadata">
                        <span class="content-type-badge">${contentType}</span>
                        <div class="channel-badges">${channelBadges}</div>
                    </div>
                </div>
                <button class="brief-expand-btn" onclick="toggleBriefExpansion('${brief.brief_id}')">
                    <span class="expand-icon">▼</span> View Details
                </button>
            </div>
            
            <div class="brief-summary">
                <div class="brief-value">
                    <p><strong>Strategic Value:</strong> ${brief.strategic_value}</p>
                </div>
                <div class="brief-message">
                    <p><strong>Key Message:</strong> ${brief.key_message}</p>
                </div>
                <div class="business-connection">
                    <p><strong>Business Connection:</strong> ${brief.business_connection}</p>
                </div>
            </div>
            
            <div class="brief-details" id="brief-details-${brief.brief_id}" style="display: none;">
                ${createBriefDetailsSection(brief)}
            </div>
        </div>
    `;
}

// Template for brief details section
function createBriefDetailsSection(brief) {
    let detailsHTML = `
        <div class="brief-details-content">
            <div class="content-components-section">
                <h6>📝 Content Components</h6>
                <div class="primary-component">
                    <p><strong>Primary Component:</strong> ${brief.content_components.primary_component.type}</p>
                    <p><strong>Focus:</strong> ${brief.content_components.primary_component.focus}</p>
                    <p><strong>Voice:</strong> ${brief.content_components.primary_component.founder_voice}</p>
                    <p><strong>Authenticity:</strong> ${brief.content_components.primary_component.authenticity_boundaries}</p>
                </div>
    `;
    
    if (brief.content_components.supporting_visual) {
        detailsHTML += `
                <div class="supporting-visual">
                    <p><strong>Supporting Visual:</strong> ${brief.content_components.supporting_visual.type}</p>
                    <p><strong>Data Required:</strong> ${brief.content_components.supporting_visual.required_data.join(', ')}</p>
                    <p><strong>Brand Requirements:</strong> ${brief.content_components.supporting_visual.brand_consistency}</p>
                </div>
        `;
    }
    
    detailsHTML += `
            </div>
            
            <div class="channel-strategies-section">
                <h6>📱 Channel Strategies</h6>
                <div class="channel-strategies-grid">
    `;
    
    Object.entries(brief.channel_strategies).forEach(([channel, strategy]) => {
        detailsHTML += `
                    <div class="channel-strategy-card">
                        <h7>${channel.toUpperCase()}</h7>
                        <p><strong>Format:</strong> ${strategy.format}</p>
                        <p><strong>Hook Strategy:</strong> ${strategy.hook_strategy}</p>
                        <p><strong>Length:</strong> ${strategy.content_length}</p>
                        <p><strong>Goal:</strong> ${strategy.engagement_goal}</p>
                        ${strategy.hashtag_strategy ? `<p><strong>Hashtags:</strong> ${strategy.hashtag_strategy}</p>` : ''}
                        ${strategy.cta_strategy ? `<p><strong>CTA:</strong> ${strategy.cta_strategy}</p>` : ''}
                    </div>
        `;
    });
    
    detailsHTML += `
                </div>
            </div>
            
            <div class="creation-prompts-section">
                <h6>🤖 Creation Prompts</h6>
                <div class="creation-prompts-list">
    `;
    
    Object.entries(brief.creation_prompts).forEach(([promptType, prompt]) => {
        if (promptType !== 'coordination_notes') {
            detailsHTML += `
                    <div class="creation-prompt-card">
                        <h7>${promptType.replace('_', ' ').toUpperCase()}</h7>
                        <div class="prompt-content">
                            <p>${prompt}</p>
                        </div>
                    </div>
            `;
        }
    });
    
    if (brief.creation_prompts.coordination_notes) {
        detailsHTML += `
                    <div class="coordination-notes">
                        <h7>COORDINATION NOTES</h7>
                        <p>${brief.creation_prompts.coordination_notes}</p>
                    </div>
        `;
    }
    
    detailsHTML += `
                </div>
            </div>
        </div>
    `;
    
    return detailsHTML;
}

// Template for debug display
function createContentBriefsDebugTemplate(debugData) {
    let html = '<div class="debug-detailed-section">';
    html += `<h4>📝 Strategic Content Briefs Debug</h4>`;
    html += `<p><strong>Started:</strong> ${debugData.timestamp}</p>`;
    
    if (debugData.summary) {
        html += `<h5>📊 Summary:</h5>`;
        html += `<div class="debug-summary-detailed">`;
        html += `<p><strong>Viable Count:</strong> ${debugData.summary.viableCount}</p>`;
        html += `<p><strong>Total Strategic Briefs:</strong> ${debugData.summary.totalBriefs}</p>`;
        html += `<p><strong>Evaluated Count:</strong> ${debugData.summary.evaluatedCount}</p>`;
        html += '</div>';
    }
    
    if (debugData.steps && debugData.steps.length > 0) {
        html += '<h5>📝 Processing Steps:</h5>';
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
                html += `<details><summary>View AI Prompt</summary><pre class="debug-prompt">${step.prompt}</pre></details>`;
            }
            if (step.response) {
                html += `<details><summary>View AI Response</summary><pre class="debug-response">${step.response}</pre></details>`;
            }
            if (step.parsedBriefs) {
                html += `<details><summary>View Parsed Strategic Briefs</summary><pre class="debug-data">${JSON.stringify(step.parsedBriefs, null, 2)}</pre></details>`;
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

// Toggle brief expansion
function toggleBriefExpansion(briefId) {
    const detailsSection = document.getElementById(`brief-details-${briefId}`);
    const expandButton = document.querySelector(`[onclick="toggleBriefExpansion('${briefId}')"]`);
    const expandIcon = expandButton.querySelector('.expand-icon');
    
    if (detailsSection.style.display === 'none') {
        detailsSection.style.display = 'block';
        expandIcon.textContent = '▲';
        expandButton.innerHTML = '<span class="expand-icon">▲</span> Hide Details';
    } else {
        detailsSection.style.display = 'none';
        expandIcon.textContent = '▼';
        expandButton.innerHTML = '<span class="expand-icon">▼</span> View Details';
    }
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