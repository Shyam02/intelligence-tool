// Search functionality and article handling

// Generate search queries from intelligence data
async function generateSearchQueries() {
    if (!window.appState.intelligence) {
        alert('No intelligence data available');
        return;
    }
    
    try {
        // Show loading state
        const generateBtn = document.querySelector('.next-btn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '⏳ Generating Queries...';
        generateBtn.disabled = true;
        
        const queries = await generateQueriesFromAPI(window.appState.intelligence);
        
        console.log('Queries structure:', queries);
        console.log('Has competitor_queries?', !!queries?.competitor_queries);
        
        // Display queries
        document.getElementById('competitorQueriesOutput').textContent = JSON.stringify(queries.competitor_queries, null, 2);
        document.getElementById('keywordQueriesOutput').textContent = JSON.stringify(queries.keyword_queries, null, 2);
        document.getElementById('contentQueriesOutput').textContent = JSON.stringify(queries.content_queries, null, 2);
        
        // Show queries container
        const queriesContainer = document.getElementById('queriesContainer');
        queriesContainer.style.display = 'block';
        queriesContainer.scrollIntoView({ behavior: 'smooth' });
        
        // Reset button
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        
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
            window.appState.searchResults = searchData.articles;
            displayArticles(window.appState.searchResults);
        }
        
        // Display API call information for debugging
        displayAPICallInfo(searchData);
        
        // Show search results container
        document.getElementById('searchResults').style.display = 'block';
        
        console.log('✅ Successfully received', searchData.articles?.length || 0, 'articles');
        
    } catch (error) {
        console.error('Search execution error:', error);
        alert(`Search failed: ${error.message}\n\nCheck browser console for details.`);
    } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
    }
}

// Display articles with selection interface
function displayArticles(articles) {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        document.getElementById('searchResultsOutput').innerHTML = '<p>No articles found.</p>';
        return;
    }
    
    let articlesHTML = `
        <div class="articles-container">
            <div class="articles-header">
                <h4>📰 Found ${articles.length} Articles</h4>
                <div class="selection-controls">
                    <button onclick="selectAllArticles()" class="selection-btn">Select All</button>
                    <button onclick="deselectAllArticles()" class="selection-btn">Deselect All</button>
                    <button onclick="copySelectedArticles()" class="copy-selected-btn">📋 Copy Selected</button>
                </div>
            </div>
            <div class="articles-list">
    `;
    
    articles.forEach(article => {
        articlesHTML += `
            <div class="article-card" data-article-id="${article.id}">
                <div class="article-checkbox">
                    <input type="checkbox" id="article-${article.id}" onchange="toggleArticleSelection(${article.id})" ${article.selected ? 'checked' : ''}>
                </div>
                <div class="article-content">
                    <h5 class="article-title">${article.title}</h5>
                    <div class="article-meta">
                        <span class="article-domain">${article.domain}</span>
                        <span class="article-date">${article.published}</span>
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

// Article selection functions
function toggleArticleSelection(articleId) {
    const article = window.appState.searchResults.find(a => a.id === articleId);
    if (article) {
        article.selected = !article.selected;
        console.log(`Article ${articleId} ${article.selected ? 'selected' : 'deselected'}`);
    }
}

function selectAllArticles() {
    window.appState.searchResults.forEach(article => article.selected = true);
    window.appState.searchResults.forEach(article => {
        const checkbox = document.getElementById(`article-${article.id}`);
        if (checkbox) checkbox.checked = true;
    });
    console.log('All articles selected');
}

function deselectAllArticles() {
    window.appState.searchResults.forEach(article => article.selected = false);
    window.appState.searchResults.forEach(article => {
        const checkbox = document.getElementById(`article-${article.id}`);
        if (checkbox) checkbox.checked = false;
    });
    console.log('All articles deselected');
}

function copySelectedArticles() {
    const selectedArticles = window.appState.searchResults.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
        alert('Please select some articles first');
        return;
    }
    
    // Format selected articles for copying
    const copyText = selectedArticles.map(article => 
        `Title: ${article.title}\nURL: ${article.url}\nPreview: ${article.preview}\nDomain: ${article.domain}\nPublished: ${article.published}\n${'='.repeat(50)}`
    ).join('\n\n');
    
    // Try to copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(copyText).then(() => {
            showCopySuccess(document.querySelector('.copy-selected-btn'));
            console.log(`Copied ${selectedArticles.length} selected articles`);
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(copyText, document.querySelector('.copy-selected-btn'));
        });
    } else {
        fallbackCopyToClipboard(copyText, document.querySelector('.copy-selected-btn'));
    }
}