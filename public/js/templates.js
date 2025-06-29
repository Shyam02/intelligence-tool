// HTML Template Functions - All inline HTML extracted from JS files
// File path: /public/js/templates.js

// ===== REDDIT TEMPLATES =====

// Template for discovered subreddits display
function createDiscoveredSubredditsTemplate(subreddits, keywordsUsed = []) {
    if (!subreddits || subreddits.length === 0) {
        return `
            <div class="subreddits-container">
                <h4>📍 Subreddit Discovery</h4>
                <p>No relevant subreddits found. Try adjusting your business description in the Setup tab.</p>
            </div>`;
    }
    
    let subredditsHTML = `
        <div class="subreddits-container">
            <h4>📍 Discovered ${subreddits.length} Relevant Subreddits</h4>
            <div class="discovery-explanation">
                <p><strong>💡 What are these for?</strong> These are Reddit communities where your target customers discuss problems, ask questions, and share experiences. When you search Reddit using the queries above, these communities will be included for more targeted results.</p>
                ${keywordsUsed.length > 0 ? `<p><strong>🔍 Found using:</strong> ${keywordsUsed.slice(0, 3).join(', ')}</p>` : ''}
            </div>
            <div class="subreddits-grid">
    `;
    
    subreddits.forEach(subreddit => {
        const subscriberCount = subreddit.subscribers 
            ? (subreddit.subscribers > 1000 
                ? `${Math.round(subreddit.subscribers / 1000)}k` 
                : subreddit.subscribers)
            : '0';
            
        subredditsHTML += `
            <div class="subreddit-card">
                <div class="subreddit-header">
                    <h5><a href="${subreddit.url}" target="_blank">r/${subreddit.name}</a></h5>
                    <span class="subscriber-count">${subscriberCount} members</span>
                </div>
                <div class="subreddit-content">
                    <p class="subreddit-title">${subreddit.title}</p>
                    ${subreddit.description ? `<p class="subreddit-description">${subreddit.description.substring(0, 120)}...</p>` : ''}
                    <p class="keyword-source">Found via: ${subreddit.keyword_source}</p>
                </div>
            </div>
        `;
    });
    
    subredditsHTML += `
            </div>
            <div class="next-steps">
                <p><strong>🚀 Next Steps:</strong> Now generate Reddit queries using the "Generate Search Queries" button at the top, then test individual queries to find relevant discussions!</p>
            </div>
        </div>
    `;
    
    return subredditsHTML;
}

// Template for Reddit search summary
function createRedditSearchSummaryTemplate(searchResponse, query) {
    let summaryHTML = `
        <div class="reddit-search-summary">
            <h4>💬 Last Reddit Search Results</h4>
            <div class="search-summary">
                <p><strong>Query:</strong> "${query}"</p>
                <p><strong>Status:</strong> ${searchResponse.success ? '✅ Success' : '❌ Failed'}</p>
                <p><strong>Discussions Found:</strong> ${searchResponse.total_posts_found || 0}</p>
                <p><strong>Added to Idea Bank:</strong> ${searchResponse.articles?.length || 0}</p>
    `;
    
    if (searchResponse.error) {
        summaryHTML += `<p><strong>Error:</strong> ${searchResponse.error}</p>`;
    }
    
    summaryHTML += `
            </div>
        </div>
    `;
    
    // Add appropriate tip based on results
    if (searchResponse.articles && searchResponse.articles.length > 0) {
        summaryHTML += `
            <div class="search-tip success-tip">
                <p><strong>🎉 Success!</strong> ${searchResponse.articles.length} Reddit discussions have been added to your Idea Bank. Switch to the Idea Bank tab to select them for content brief generation.</p>
            </div>
        `;
    } else if (searchResponse.success) {
        summaryHTML += `
            <div class="search-tip warning-tip">
                <p><strong>💡 No Results:</strong> Try a different search term or check if the discovered subreddits below are relevant to your business.</p>
            </div>
        `;
    } else {
        summaryHTML += `
            <div class="search-tip error-tip">
                <p><strong>⚠️ Search Failed:</strong> There was an issue with the Reddit search. Check the console for technical details.</p>
            </div>
        `;
    }
    
    return summaryHTML;
}

// ===== COMPETITOR INTELLIGENCE TEMPLATES =====

// Template for competitor intelligence display
function createCompetitorIntelligenceTemplate(competitorIntelligence) {
    if (competitorIntelligence && competitorIntelligence.competitors_found > 0) {
        // Display detailed competitor intelligence
        let competitorHTML = `
            <h3>🏢 Competitor Intelligence Analysis</h3>
            <div class="competitor-summary">
                <div class="competitor-stats">
                    <span><strong>Competitors Found:</strong> ${competitorIntelligence.competitors_found}</span>
                    <span><strong>Competitors Analyzed:</strong> ${competitorIntelligence.competitors_selected}</span>
                    <span><strong>Queries Used:</strong> ${competitorIntelligence.discovery_queries_used.length}</span>
                </div>
            </div>
        `;
        
        // Display individual competitors
        if (competitorIntelligence.competitor_analysis && competitorIntelligence.competitor_analysis.length > 0) {
            competitorHTML += '<div class="competitors-grid">';
            
            competitorIntelligence.competitor_analysis.forEach((competitor, index) => {
                competitorHTML += `
                    <div class="competitor-card">
                        <div class="competitor-header">
                            <h4>${competitor.company_name}</h4>
                            <span class="relevance-badge ${competitor.relevance_score}">${competitor.relevance_score} relevance</span>
                        </div>
                        <div class="competitor-details">
                            <p class="competitor-url"><a href="${competitor.website_url}" target="_blank">${competitor.website_url}</a></p>
                            <p class="competitor-description">${competitor.business_description}</p>
                            <div class="competitor-positioning">
                                <strong>Value Proposition:</strong> ${competitor.value_proposition}
                            </div>
                            <div class="competitor-target">
                                <strong>Target Customer:</strong> ${competitor.target_customer}
                            </div>
                            ${competitor.key_features.length > 0 ? `
                                <div class="competitor-features">
                                    <strong>Key Features:</strong> ${competitor.key_features.join(', ')}
                                </div>
                            ` : ''}
                            ${competitor.pricing_approach !== 'Not found' ? `
                                <div class="competitor-pricing">
                                    <strong>Pricing:</strong> ${competitor.pricing_approach}
                                </div>
                            ` : ''}
                            <div class="competitor-stage">
                                <strong>Company Stage:</strong> ${competitor.company_stage}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            competitorHTML += '</div>';
        }
        
        // Display competitive insights
        if (competitorIntelligence.competitive_insights) {
            competitorHTML += `
                <div class="competitive-insights">
                    <h4>📊 Competitive Insights</h4>
                    <div class="insights-grid">
                        ${competitorIntelligence.competitive_insights.market_gaps.length > 0 ? `
                            <div class="insight-card">
                                <strong>Market Gaps:</strong>
                                <ul>${competitorIntelligence.competitive_insights.market_gaps.map(gap => `<li>${gap}</li>`).join('')}</ul>
                            </div>
                        ` : ''}
                        ${competitorIntelligence.competitive_insights.positioning_opportunities.length > 0 ? `
                            <div class="insight-card">
                                <strong>Positioning Opportunities:</strong>
                                <ul>${competitorIntelligence.competitive_insights.positioning_opportunities.map(opp => `<li>${opp}</li>`).join('')}</ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // Display differentiation opportunities
        if (competitorIntelligence.differentiation_opportunities && competitorIntelligence.differentiation_opportunities.length > 0) {
            competitorHTML += `
                <div class="differentiation-opportunities">
                    <h4>🎯 Differentiation Opportunities</h4>
                    <ul class="opportunities-list">
                        ${competitorIntelligence.differentiation_opportunities.map(opp => `<li>${opp}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add copy button for raw data
        competitorHTML += `
            <div class="copy-section">
                <pre id="competitorIntelligenceOutput" style="display: none;">${JSON.stringify(competitorIntelligence, null, 2)}</pre>
                <button class="copy-btn" onclick="copyToClipboard('competitorIntelligenceOutput', this)">📋 Copy Raw Competitor Data</button>
            </div>
        `;
        
        return competitorHTML;
        
    } else {
        // Display message when no competitor intelligence available
        return `
            <h3>🏢 Competitor Intelligence Analysis</h3>
            <div class="no-competitor-data">
                <p>⚠️ No competitor intelligence available</p>
                <p class="explanation">
                    ${competitorIntelligence ? 
                        (competitorIntelligence.analysis_note || 'Competitor research was attempted but no relevant competitors were found.') :
                        'Competitor research was not performed for this analysis.'
                    }
                </p>
            </div>
        `;
    }
}

// ===== TWITTER TEMPLATES =====

// Template for Twitter briefs display
function createTwitterBriefsTemplate(briefsData) {
    let briefsHTML = `
        <h3>🐦 Twitter Content Briefs</h3>
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
                    <div class="twitter-brief-card">
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
                    <p>❌ <strong>Not viable for Twitter:</strong> ${result.rejection_reason}</p>
                </div>
            `;
        }
        
        briefsHTML += `</div>`;
    });
    
    return briefsHTML;
}

// ===== WEB SEARCH TEMPLATES =====

// Template for articles display
function createArticlesDisplayTemplate(articles) {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return '<p>No articles found.</p>';
    }
    
    // Separate by source type for display
    const searchArticles = articles.filter(article => article.source_type !== 'reddit');
    const redditPosts = articles.filter(article => article.source_type === 'reddit');
    
    let articlesHTML = `
        <div class="articles-container">
            <div class="articles-header">
                <h4>📰 Found ${articles.length} Ideas (${searchArticles.length} articles, ${redditPosts.length} Reddit discussions)</h4>
                <div class="selection-controls">
                    <button onclick="selectAllArticles()" class="selection-btn">Select All</button>
                    <button onclick="deselectAllArticles()" class="selection-btn">Deselect All</button>
                    <button onclick="copySelectedArticles()" class="copy-selected-btn">📋 Copy Selected</button>
                </div>
            </div>
            <div class="articles-list">
    `;
    
    articles.forEach(article => {
        const isReddit = article.source_type === 'reddit';
        const sourceIcon = isReddit ? '💬' : '🔍';
        const sourceClass = isReddit ? 'reddit' : 'search';
        
        // FIXED: Ensure article ID is treated as string consistently
        const articleId = String(article.id);
        
        articlesHTML += `
            <div class="article-card" data-article-id="${articleId}" data-source="${sourceClass}">
                <div class="article-checkbox">
                    <input type="checkbox" id="article-${articleId}" onchange="toggleArticleSelection('${articleId}')" ${article.selected ? 'checked' : ''}>
                </div>
                <div class="article-content">
                    <h5 class="article-title">${sourceIcon} ${article.title}</h5>
                    <div class="article-meta">
                        <span class="article-domain">${article.domain}</span>
                        <span class="article-date">${article.published}</span>
                        ${isReddit ? `
                            <div class="reddit-engagement">
                                <span class="reddit-upvotes">${article.upvotes || 0}</span>
                                <span class="reddit-comments">${article.comments || 0}</span>
                            </div>
                        ` : ''}
                    </div>
                    <p class="article-preview">${article.preview}</p>
                    <a href="${article.url}" target="_blank" class="article-url">${article.url}</a>
                </div>
            </div>
        `;
    });
    
    articlesHTML += `
            </div>
            <div class="twitter-generation-section">
                <button onclick="generateTwitterContentBriefs()" class="twitter-brief-btn">🐦 Generate Twitter Content Briefs</button>
            </div>
        </div>
    `;
    
    return articlesHTML;
}

// Template for API call info display
function createAPICallInfoTemplate(searchData) {
    return `
        <div class="api-info-container">
            <h4>🔍 Search Information</h4>
            <div class="api-info">
                <p><strong>Query:</strong> ${searchData.original_query}</p>
                <p><strong>Method:</strong> ${searchData.method_used}</p>
                <p><strong>Status:</strong> ${searchData.status}</p>
                <p><strong>Timestamp:</strong> ${searchData.timestamp}</p>
                <p><strong>Articles Found:</strong> ${searchData.articles?.length || 0}</p>
                ${searchData.api_calls && searchData.api_calls.length > 0 ? `
                    <details>
                        <summary><strong>API Calls (${searchData.api_calls.length})</strong></summary>
                        <pre>${JSON.stringify(searchData.api_calls, null, 2)}</pre>
                    </details>
                ` : ''}
            </div>
        </div>
    `;
}