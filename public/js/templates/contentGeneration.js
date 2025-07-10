// Content Generation Template Functions
// File path: /public/js/templates/contentGeneration.js

// Template for displaying all generated content from strategic briefs
function createGeneratedContentTemplate(generatedContent) {
    if (!generatedContent || !generatedContent.generated_content) {
        return `
            <div class="no-generated-content">
                <p>No content was generated. Please try again or check your strategic briefs.</p>
            </div>
        `;
    }
    
    let contentHTML = `
        <div class="generated-content-container">
            <h3>🎨 Final Generated Content</h3>
            <div class="generation-summary">
                <div class="summary-stats">
                    <span><strong>Total Generated:</strong> ${generatedContent.generation_summary?.total_generated || 0}</span>
                    <span><strong>Twitter Content:</strong> ${generatedContent.generation_summary?.twitter_content || 0}</span>
                    <span><strong>LinkedIn Content:</strong> ${generatedContent.generation_summary?.linkedin_content || 0}</span>
                    <span><strong>Visual Components:</strong> ${generatedContent.generation_summary?.visual_components || 0}</span>
                    <span><strong>Generated:</strong> ${new Date().toLocaleString()}</span>
                </div>
            </div>
            <div class="generated-content-list">
    `;
    
    generatedContent.generated_content.forEach((content, index) => {
        contentHTML += createSingleContentTemplate(content, content.id || `content_${index}`);
    });
    
    contentHTML += `
            </div>
        </div>
    `;
    
    return contentHTML;
}

// Template for single piece of generated content
function createSingleContentTemplate(content, contentId) {
    const isThread = content.content_type === 'thread';
    const isMultiChannel = content.channel && content.channel !== 'twitter';
    const statusClass = content.status === 'generation_failed' ? 'status-failed' : 'status-pending';
    
    // Determine content type display
    let contentTypeDisplay = 'Single Tweet';
    if (isThread) {
        contentTypeDisplay = 'Thread';
    } else if (content.channel === 'linkedin') {
        contentTypeDisplay = 'LinkedIn Post';
    } else if (content.channel === 'instagram') {
        contentTypeDisplay = 'Instagram Post';
    }
    
    let contentHTML = `
        <div class="generated-content-item" data-content-id="${contentId}" data-brief-data='${JSON.stringify(content)}'>
            <div class="content-header">
                <div class="content-info">
                    <h4>${content.brief_angle || 'Content Piece'}</h4>
                    <div class="content-badges">
                        <span class="content-type-badge ${isThread ? 'thread-badge' : 'post-badge'}">${contentTypeDisplay}</span>
                        ${content.channel ? `<span class="channel-badge channel-${content.channel}">${content.channel.toUpperCase()}</span>` : ''}
                        <span class="content-status ${statusClass}">${content.status === 'generation_failed' ? 'Failed' : 'Generated'}</span>
                    </div>
                </div>
                <div class="content-actions">
                    <button class="copy-content-btn" onclick="${isThread ? `copyThreadContent('${contentId}')` : `copyGeneratedContent('${contentId}')`}">📋 Copy</button>
                    <button class="regenerate-btn" onclick="regenerateContent('${contentId}')">🔄 Regenerate</button>
                    <button class="approve-btn" onclick="approveContent('${contentId}')">✅ Approve</button>
                    <button class="reject-btn" onclick="rejectContent('${contentId}')">❌ Reject</button>
                </div>
            </div>
             ${content.visual_component_specs ? createVisualComponentTemplate(content.visual_component_specs) : ''}
    `;
    
    if (content.status === 'generation_failed') {
        contentHTML += `
            <div class="content-error">
                <p><strong>Generation Failed:</strong> ${content.error || 'Unknown error occurred'}</p>
            </div>
        `;
    } else if (isThread) {
        contentHTML += createThreadContentDisplay(content);
    } else {
        contentHTML += createSingleTweetDisplay(content);
    }
    
    contentHTML += `
        </div>
    `;
    
    return contentHTML;
}

// Template for visual component specifications
function createVisualComponentTemplate(visualSpecs) {
    return `
        <div class="visual-component-section">
            <h5>🎨 Visual Component Specifications</h5>
            <div class="visual-specs-card">
                <div class="visual-type">
                    <strong>Type:</strong> ${visualSpecs.type}
                </div>
                <div class="visual-description">
                    <strong>Description:</strong> ${visualSpecs.description}
                </div>
                ${visualSpecs.coordination_notes ? `
                    <div class="visual-coordination">
                        <strong>Coordination Notes:</strong> ${visualSpecs.coordination_notes}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Template for single tweet display
function createSingleTweetDisplay(content) {
    const characterCount = content.character_count || 0;
    const withinLimit = content.within_limit !== false;
    const charCountClass = withinLimit ? 'char-count-good' : 'char-count-over';
    
    return `
        <div class="tweet-content-display">
            <div class="tweet-preview-box">
                <div class="tweet-header">
                    <span class="tweet-author">Your Company</span>
                    <span class="tweet-handle">@yourhandle</span>
                    <span class="tweet-time">now</span>
                </div>
                <div class="final-content-text">${content.final_content || 'No content generated'}</div>
                <div class="tweet-footer">
                    <span class="tweet-stats">💬 Reply</span>
                    <span class="tweet-stats">🔄 Retweet</span>
                    <span class="tweet-stats">❤️ Like</span>
                    <span class="tweet-stats">📤 Share</span>
                </div>
            </div>
            <div class="content-metadata">
                <div class="character-info">
                    <span class="character-count ${charCountClass}">${characterCount}/280 characters</span>
                    ${!withinLimit ? '<span class="over-limit-warning">⚠️ Over limit</span>' : ''}
                </div>
                ${content.hashtags && content.hashtags.length > 0 ? `
                    <div class="hashtags-used">
                        <strong>Hashtags:</strong> ${content.hashtags.join(' ')}
                    </div>
                ` : ''}
                ${content.engagement_hook ? `
                    <div class="content-strategy">
                        <strong>Hook:</strong> ${content.engagement_hook}
                    </div>
                ` : ''}
                ${content.call_to_action ? `
                    <div class="content-strategy">
                        <strong>CTA:</strong> ${content.call_to_action}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Template for thread display
function createThreadContentDisplay(content) {
    if (!content.thread_tweets || !Array.isArray(content.thread_tweets)) {
        return `
            <div class="thread-error">
                <p>Thread content not available</p>
            </div>
        `;
    }
    
    let threadHTML = `
        <div class="thread-content-display">
            <div class="thread-info">
                <span class="thread-length">${content.thread_tweets.length} tweets</span>
                <span class="thread-label">Thread</span>
            </div>
            <div class="thread-tweets">
    `;
    
    content.thread_tweets.forEach((tweet, index) => {
        const tweetNumber = index + 1;
        const isFirstTweet = index === 0;
        
        threadHTML += `
            <div class="thread-tweet ${isFirstTweet ? 'first-tweet' : ''}">
                <div class="tweet-number">${isFirstTweet ? '🧵' : tweetNumber + '/'}</div>
                <div class="thread-tweet-content">
                    <div class="thread-tweet-text">${tweet}</div>
                    <div class="thread-tweet-chars">${tweet.length}/280</div>
                </div>
            </div>
        `;
    });
    
    threadHTML += `
            </div>
            <div class="thread-metadata">
                ${content.hashtags && content.hashtags.length > 0 ? `
                    <div class="hashtags-used">
                        <strong>Hashtags:</strong> ${content.hashtags.join(' ')}
                    </div>
                ` : ''}
                ${content.engagement_hook ? `
                    <div class="content-strategy">
                        <strong>Thread Hook:</strong> ${content.engagement_hook}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return threadHTML;
}

// Template for brief-specific content (when generating for individual briefs)
function createBriefContentTemplate(content, briefIndex) {
    return `
        <div class="brief-specific-content">
            <h5>Generated Content for Brief ${briefIndex + 1}</h5>
            ${createSingleContentTemplate(content, `brief_${briefIndex}_content`)}
        </div>
    `;
}

// Template for content generation button (to add to existing briefs)
function createGenerationButtonTemplate() {
    return `
        <div class="content-generation-trigger">
            <button class="generate-content-btn" onclick="generateContentFromBriefs()">
                🎨 Generate Final Content
            </button>
            <p class="generation-help">Transform your briefs into ready-to-post content</p>
        </div>
    `;
}

// Template for empty content generation state
function createEmptyContentGenerationTemplate() {
    return `
        <div class="empty-content-generation">
            <h3>No Content Generated Yet</h3>
            <p>Generate content briefs first, then create final content from those briefs.</p>
            <div class="arrow">↑</div>
            <p>Use "Generate Final Content" button above</p>
        </div>
    `;
}

// Template for regeneration options modal (future enhancement)
function createRegenerationOptionsTemplate(contentId) {
    return `
        <div class="regeneration-modal" id="regenerateModal_${contentId}">
            <div class="modal-content">
                <h4>Regenerate Content</h4>
                <p>What type of variation would you like?</p>
                <div class="regeneration-options">
                    <button onclick="regenerateContent('${contentId}', 'different_tone')">Different Tone</button>
                    <button onclick="regenerateContent('${contentId}', 'shorter_version')">Shorter Version</button>
                    <button onclick="regenerateContent('${contentId}', 'more_casual')">More Casual</button>
                    <button onclick="regenerateContent('${contentId}', 'more_professional')">More Professional</button>
                    <button onclick="regenerateContent('${contentId}', 'add_data')">Include More Data</button>
                    <button onclick="regenerateContent('${contentId}', null)">Just Different</button>
                </div>
                <button class="modal-close" onclick="closeRegenerationModal('${contentId}')">Cancel</button>
            </div>
        </div>
    `;
}

function createContentGenerationDebugTemplate(debugData) {
    let html = '<div class="debug-detailed-section">';
    html += `<h4>🎨 Content Generation Debug - Complete Details</h4>`;
    html += `<p><strong>Started:</strong> ${debugData.timestamp}</p>`;
    if (debugData.summary) {
        html += `<h5>📊 Summary:</h5>`;
        html += `<div class="debug-summary-detailed">`;
        html += `<p><strong>Total Generated:</strong> ${debugData.summary.totalGenerated}</p>`;
        html += `<p><strong>Single Tweets:</strong> ${debugData.summary.singleTweets}</p>`;
        html += `<p><strong>Threads:</strong> ${debugData.summary.threads}</p>`;
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
            if (step.generationContext) {
                html += `<details><summary>View Generation Context</summary><pre class="debug-data">${JSON.stringify(step.generationContext, null, 2)}</pre></details>`;
            }
            if (step.prompt) {
                html += `<details><summary>View Prompt</summary><pre class="debug-prompt">${step.prompt}</pre></details>`;
            }
            if (step.response) {
                html += `<details><summary>View AI Response</summary><pre class="debug-response">${step.response}</pre></details>`;
            }
            if (step.parsedContent) {
                html += `<details><summary>View Parsed Content</summary><pre class="debug-data">${JSON.stringify(step.parsedContent, null, 2)}</pre></details>`;
            }
            if (step.validatedContent) {
                html += `<details><summary>View Validated Content</summary><pre class="debug-data">${JSON.stringify(step.validatedContent, null, 2)}</pre></details>`;
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