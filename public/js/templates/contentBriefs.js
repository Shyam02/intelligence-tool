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