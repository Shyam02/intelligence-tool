// Reddit Template Functions
// File path: /public/js/templates/reddit.js

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