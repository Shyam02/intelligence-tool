// Content Generation Template Functions
// File path: /public/js/templates/contentGeneration.js

// Template for displaying all generated content
function createGeneratedContentTemplate(generatedContent) {
    if (!generatedContent || !generatedContent.generated_content) {
        return `
            <div class="no-generated-content">
                <p>No content was generated. Please try again or check your briefs.</p>
            </div>
        `;
    }
    
    let contentHTML = `
        <div class="generated-content-container">
            <h3>🎨 Generated Content</h3>
            <div class="generation-summary">
                <div class="summary-stats">
                    <span><strong>Total Generated:</strong> ${generatedContent.generation_summary?.total_generated || 0}</span>
                    <span><strong>Single Tweets:</strong> ${generatedContent.generation_summary?.single_tweets || 0}</span>
                    <span><strong>Threads:</strong> ${generatedContent.generation_summary?.threads || 0}</span>
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
    const statusClass = content.status === 'generation_failed' ? 'status-failed' : 'status-pending';
    
    let contentHTML = `
        <div class="generated-content-item" data-content-id="${contentId}" data-brief-data='${JSON.stringify(content)}'>
            <div class="content-header">
                <div class="content-info">
                    <h4>${content.brief_angle || 'Content Piece'}</h4>
                    <span class="content-type-badge ${isThread ? 'thread-badge' : 'tweet-badge'}">${isThread ? 'Thread' : 'Single Tweet'}</span>
                    <span class="content-status ${statusClass}">${content.status === 'generation_failed' ? 'Failed' : 'Generated'}</span>
                </div>
                <div class="content-actions">
                    <button class="copy-content-btn" onclick="${isThread ? `copyThreadContent('${contentId}')` : `copyGeneratedContent('${contentId}')`}">📋 Copy</button>
                    <button class="regenerate-btn" onclick="regenerateContent('${contentId}')">🔄 Regenerate</button>
                    <button class="approve-btn" onclick="approveContent('${contentId}')">✅ Approve</button>
                    <button class="reject-btn" onclick="rejectContent('${contentId}')">❌ Reject</button>
                </div>
            </div>
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
            <p>Generate Twitter briefs first, then create final content from those briefs.</p>
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