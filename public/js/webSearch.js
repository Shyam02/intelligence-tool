// ===== public/js/webSearch.js =====
// Web search functionality and article handling

// UPDATED: Generate search queries AND Reddit queries from foundational intelligence data
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
        
        // Generate search queries
        const queries = await generateQueriesFromAPI(window.appState.foundationalIntelligence);
        
        console.log('Queries structure:', queries);
        console.log('Has competitor_queries?', !!queries?.competitor_queries);
        
        // Display search queries
        document.getElementById('competitorQueriesOutput').textContent = JSON.stringify(queries.competitor_queries, null, 2);
        document.getElementById('keywordQueriesOutput').textContent = JSON.stringify(queries.keyword_queries, null, 2);
        document.getElementById('contentQueriesOutput').textContent = JSON.stringify(queries.content_queries, null, 2);
        
        // Show search queries container
        const queriesContainer = document.getElementById('queriesContainer');
        queriesContainer.style.display = 'block';
        
        // UPDATED: Also generate Reddit queries
        try {
            console.log('🔍 Also generating Reddit queries...');
            await generateRedditQueries();
        } catch (redditError) {
            console.error('⚠️ Reddit query generation failed, but continuing with search queries:', redditError.message);
            // Don't fail the entire process if Reddit queries fail
        }
        
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
        
        console.log('✅ Search queries and Reddit queries generated, idea sources tab activated');
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating queries: ' + error.message);
        
        // Reset button
        const generateBtn = document.querySelector('.next-btn');
        generateBtn.textContent = '🔍 Generate Search Queries';
        generateBtn.disabled = false;
    }
}

// Execute test search (NO CHANGES)
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

// UPDATED: Display articles with Reddit support (unified display) - NOW USES TEMPLATE
function displayArticles(articles) {
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        document.getElementById('searchResultsOutput').innerHTML = '<p>No articles found.</p>';
        return;
    }
    
    // Use template function instead of inline HTML construction
    const articlesHTML = createArticlesDisplayTemplate(articles);
    
    document.getElementById('searchResultsOutput').innerHTML = articlesHTML;
    
    // DEBUGGING: Log article selection state
    console.log('📊 Article display state:', {
        totalArticles: articles.length,
        selectedArticles: articles.filter(a => a.selected).length,
        searchArticles: articles.filter(article => article.source_type !== 'reddit').length,
        redditPosts: articles.filter(article => article.source_type === 'reddit').length
    });
}

// UPDATED: Display API call information for debugging - NOW USES TEMPLATE
function displayAPICallInfo(searchData) {
    // Use template function instead of inline HTML construction
    const apiInfoHTML = createAPICallInfoTemplate(searchData);
    
    // Add API info before the articles
    const existingOutput = document.getElementById('searchResultsOutput');
    existingOutput.innerHTML = apiInfoHTML + existingOutput.innerHTML;
}

// FIXED: Article selection functions with proper ID handling (NO CHANGES)
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