// Web Search Template Functions
// File path: /public/js/templates/webSearch.js

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
            <div class="content-generation-section">
                <button onclick="generateContentBriefs()" class="content-brief-btn">📝 Generate Content Briefs</button>
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