// Search functionality and article handling

// Generate search queries from foundational intelligence data
async function generateQueries() {
    if (!window.appState.foundationalIntelligence) {
        alert('No foundational intelligence data available');
        return;
    }
    
    try {
        // Show loading state
        const generateBtn = document.querySelector('.next-btn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '⏳ Generating Queries...';
        generateBtn.disabled = true;
        
        const queries = await generateQueriesFromAPI(window.appState.foundationalIntelligence);
        
        console.log('Queries structure:', queries);
        console.log('Has competitor_queries?', !!queries?.competitor_queries);
        
        // FIXED: Display ALL queries like before (not simplified)
        document.getElementById('competitorQueriesOutput').textContent = JSON.stringify(queries.competitor_queries, null, 2);
        document.getElementById('keywordQueriesOutput').textContent = JSON.stringify(queries.keyword_queries, null, 2);
        document.getElementById('contentQueriesOutput').textContent = JSON.stringify(queries.content_queries, null, 2);
        
        // Show queries container
        const queriesContainer = document.getElementById('queriesContainer');
        queriesContainer.style.display = 'block';
        
        // Mark idea sources tab as completed and switch to it
        markTabCompleted('ideaSources');
        switchTab('ideaSources');
        
        // Update empty states
        updateEmptyStates();
        
        // Update search status
        const searchStatus = document.getElementById('searchStatus');
        if (searchStatus) {
            searchStatus.textContent = 'Queries generated - ready to search';
        }
        
        // Reset button
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        
        console.log('✅ Search queries generated and idea sources tab activated');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating queries: ' + error.message);
        
        // Reset button
        const generateBtn = document.querySelector('.next-btn');
        generateBtn.textContent = '🔍 Generate Search Queries';
        generateBtn.disabled = false;
    }
}

// Execute test search
async function executeTestSearch() {
    const query = document.getElementById('testQuery').value.trim();
    
    if (!query) {
        alert('Please enter a search query to test');
        return;
    }
    
    const testBtn = document.querySelector('.test-btn');
    const originalText = testBtn.textContent;
    testBtn.textContent = '⏳ Searching...';
    testBtn.disabled = true;
    
    try {
        const searchData = await executeSearch(query);
        
        // Store articles globally and display them
        if (searchData.articles && Array.isArray(searchData.articles)) {
            // UPDATED: Merge with existing search results instead of replacing
            const existingResults = window.appState.searchResults || [];
            window.appState.searchResults = [...existingResults, ...searchData.articles];
            
            displayArticles(window.appState.searchResults);
        }
        
        // Display API call information for debugging
        displayAPICallInfo(searchData);
        
        // Show search results container
        document.getElementById('searchResults').style.display = 'block';
        
        // Mark idea bank tab as completed and switch to it
        markTabCompleted('ideaBank');
        switchTab('ideaBank');
        
        // Update empty states
        updateEmptyStates();
        
        console.log('✅ Successfully received', searchData.articles?.length || 0, 'articles');
        console.log('✅ Total articles in state:', window.appState.searchResults.length);
        
    } catch (error) {
        console.error('Search execution error:', error);
        alert(`Search failed: ${error.message}\n\nCheck browser console for details.`);
    } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
    }
}

// UPDATED: Display articles with Reddit support (unified display)
function displayArticles(articles) {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        document.getElementById('searchResultsOutput').innerHTML = '<p>No articles found.</p>';
        return;
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
    
    document.getElementById('searchResultsOutput').innerHTML = articlesHTML;
    
    // DEBUGGING: Log article selection state
    console.log('📊 Article display state:', {
        totalArticles: articles.length,
        selectedArticles: articles.filter(a => a.selected).length,
        searchArticles: searchArticles.length,
        redditPosts: redditPosts.length
    });
}

// Display API call information for debugging
function displayAPICallInfo(searchData) {
    const apiInfoHTML = `
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
    
    // Add API info before the articles
    const existingOutput = document.getElementById('searchResultsOutput');
    existingOutput.innerHTML = apiInfoHTML + existingOutput.innerHTML;
}

// FIXED: Article selection functions with proper ID handling
function toggleArticleSelection(articleId) {
    // Ensure articleId is treated as string
    const targetId = String(articleId);
    const article = window.appState.searchResults.find(a => String(a.id) === targetId);
    
    if (article) {
        article.selected = !article.selected;
        console.log(`✅ Article ${targetId} ${article.selected ? 'selected' : 'deselected'} (${article.source_type || 'search'})`);
        
        // Update the checkbox state
        const checkbox = document.getElementById(`article-${targetId}`);
        if (checkbox) {
            checkbox.checked = article.selected;
        }
        
        // Debug: Log current selection state
        const selectedCount = window.appState.searchResults.filter(a => a.selected).length;
        console.log(`📊 Total selected: ${selectedCount}/${window.appState.searchResults.length}`);
    } else {
        console.error(`❌ Article with ID ${targetId} not found in searchResults`);
        console.log('Available IDs:', window.appState.searchResults.map(a => String(a.id)));
    }
}

function selectAllArticles() {
    window.appState.searchResults.forEach(article => article.selected = true);
    window.appState.searchResults.forEach(article => {
        const checkbox = document.getElementById(`article-${String(article.id)}`);
        if (checkbox) checkbox.checked = true;
    });
    console.log('✅ All articles selected (search + Reddit)');
}

function deselectAllArticles() {
    window.appState.searchResults.forEach(article => article.selected = false);
    window.appState.searchResults.forEach(article => {
        const checkbox = document.getElementById(`article-${String(article.id)}`);
        if (checkbox) checkbox.checked = false;
    });
    console.log('✅ All articles deselected');
}

function copySelectedArticles() {
    const selectedArticles = window.appState.searchResults.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
        alert('Please select some articles first');
        return;
    }
    
    // Format selected articles for copying
    const copyText = selectedArticles.map(article => {
        const sourceType = article.source_type === 'reddit' ? 'Reddit' : 'Search';
        let formatText = `Source: ${sourceType}\nTitle: ${article.title}\nURL: ${article.url}\nPreview: ${article.preview}`;
        
        if (article.source_type === 'reddit') {
            formatText += `\nSubreddit: r/${article.subreddit}\nUpvotes: ${article.upvotes}\nComments: ${article.comments}`;
        }
        
        formatText += `\nDomain: ${article.domain}\nPublished: ${article.published}\n${'='.repeat(50)}`;
        return formatText;
    }).join('\n\n');
    
    // Try to copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText).then(() => {
            showCopySuccess(document.querySelector('.copy-selected-btn'));
            console.log(`Copied ${selectedArticles.length} selected items (search + Reddit)`);
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(copyText, document.querySelector('.copy-selected-btn'));
        });
    } else {
        fallbackCopyToClipboard(copyText, document.querySelector('.copy-selected-btn'));
    }
}