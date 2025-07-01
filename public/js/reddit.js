// Reddit frontend functionality with formatted displays

// Generate Reddit queries with formatted display
async function generateRedditQueries() {
    if (!window.appState.foundationalIntelligence) {
        console.log('⚠️ No foundational intelligence available for Reddit query generation');
        return [];
    }
    
    try {
        console.log('📝 Generating Reddit queries from business intelligence...');
        
        const redditQueries = await generateRedditQueriesAPI(window.appState.foundationalIntelligence);
        
        // Store in app state
        window.appState.redditQueries = redditQueries;
        
        // Display the formatted queries
        displayFormattedRedditQueries(redditQueries);
        
        // Show the Reddit queries container
        const redditQueriesContainer = document.getElementById('redditQueriesContainer');
        if (redditQueriesContainer) {
            redditQueriesContainer.style.display = 'block';
        }
        
        // Update Reddit status
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = `${redditQueries.length} queries generated`;
        }
        
        console.log('✅ Reddit queries generated and displayed:', redditQueries.length);
        return redditQueries;
        
    } catch (error) {
        console.error('❌ Reddit query generation failed:', error);
        
        // Update status to show error
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = 'Query generation failed';
        }
        return [];
    }
}

// NEW: Display formatted Reddit queries using template
function displayFormattedRedditQueries(queries) {
    const redditDisplay = document.getElementById('redditQueriesDisplay');
    if (redditDisplay) {
        redditDisplay.innerHTML = createRedditQueriesTemplate(queries);
    }
    
    // Keep raw data for copy functionality (hidden)
    const formattedQueries = {
        generated_reddit_queries: queries,
        total_queries: queries.length,
        usage_note: "Copy any query above and paste it in the test field below to search Reddit discussions"
    };
    
    document.getElementById('redditQueriesOutput').textContent = JSON.stringify(formattedQueries, null, 2);
    
    console.log('📊 Formatted Reddit queries displayed:', queries.length, 'queries');
}

// Execute single Reddit search with better error handling
async function executeTestRedditSearch() {
    const query = document.getElementById('testRedditQuery').value.trim();
    
    if (!query) {
        alert('Please enter a Reddit query to test');
        return;
    }
    
    const testBtn = document.querySelector('#redditQueriesContainer .test-btn');
    const originalText = testBtn.textContent;
    testBtn.textContent = '⏳ Searching Reddit...';
    testBtn.disabled = true;
    
    try {
        console.log('🔍 Executing single Reddit search for:', query);
        
        // Use single query in array format (existing API expects array)
        const searchResponse = await searchRedditAPI([query], window.appState.discoveredSubreddits || []);
        
        console.log('📊 Reddit API response:', searchResponse);
        
        // Better error handling and results processing
        if (!searchResponse || !searchResponse.success) {
            throw new Error('Reddit search API returned unsuccessful response');
        }
        
        if (!searchResponse.articles || !Array.isArray(searchResponse.articles)) {
            console.log('⚠️ No articles in Reddit response');
            alert('No Reddit discussions found for this query. Try a different search term.');
            displayRedditSearchSummary({ 
                success: true, 
                total_posts_found: 0, 
                articles: [] 
            }, query);
            return;
        }
        
        console.log('✅ Reddit search returned', searchResponse.articles.length, 'articles');
        
        // Add Reddit results to existing search results (like regular search does)
        const existingResults = window.appState.searchResults || [];
        const newTotalResults = [...existingResults, ...searchResponse.articles];
        window.appState.searchResults = newTotalResults;
        
        // Display updated results in idea bank
        displayArticles(window.appState.searchResults);
        
        // Show search results container
        document.getElementById('searchResults').style.display = 'block';
        
        // Mark tab as completed but don't auto-switch
        markTabCompleted('ideaBank');
        updateEmptyStates();
        
        // Display summary in Reddit section (not full results)
        displayRedditSearchSummary(searchResponse, query);
        
        // Update Reddit status
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            const totalDiscussions = searchResponse.articles?.length || 0;
            const totalIdeas = newTotalResults.length;
            redditStatus.textContent = `${totalDiscussions} new discussions found (${totalIdeas} total ideas in bank)`;
        }
        
        // Show success message instead of auto-switching
        alert(`✅ Success! Found ${searchResponse.articles.length} Reddit discussions.\n\nThey've been added to your Idea Bank. Switch to the Idea Bank tab to see and select them.`);
        
        console.log('✅ Reddit search completed successfully');
        
    } catch (error) {
        console.error('❌ Reddit search failed:', error);
        
        // Better error messages
        let errorMessage = 'Reddit search failed: ';
        if (error.message.includes('API')) {
            errorMessage += 'API connection issue. Check your internet connection.';
        } else if (error.message.includes('rate limit')) {
            errorMessage += 'Too many requests. Please wait a moment and try again.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        
        // Update status to show error
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = 'Search failed - check console for details';
        }
        
        // Show error summary
        displayRedditSearchSummary({ 
            success: false, 
            error: error.message, 
            total_posts_found: 0, 
            articles: [] 
        }, query);
    } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
    }
}

// Display search summary using existing template
function displayRedditSearchSummary(searchResponse, query) {
    const resultsContainer = document.getElementById('redditSearchResults');
    
    // Use existing template function
    const summaryHTML = createRedditSearchSummaryTemplate(searchResponse, query);
    
    resultsContainer.innerHTML = summaryHTML;
    resultsContainer.style.display = 'block';
}

// Discover relevant subreddits using existing template
async function discoverSubreddits() {
    if (!window.appState.foundationalIntelligence) {
        alert('Please complete the Setup tab first to generate business intelligence');
        return;
    }
    
    const discoverBtn = document.querySelector('.discover-subreddits-btn');
    const originalText = discoverBtn.textContent;
    discoverBtn.textContent = '⏳ Discovering...';
    discoverBtn.disabled = true;
    
    try {
        console.log('🔍 Starting subreddit discovery...');
        
        const response = await discoverSubredditsAPI(window.appState.foundationalIntelligence);
        
        // Display discovered subreddits using existing template
        displayDiscoveredSubreddits(response.subreddits, response.keywords_used);
        
        // Store subreddits in app state
        window.appState.discoveredSubreddits = response.subreddits;
        
        // Update Reddit status
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = `${response.subreddits.length} subreddits discovered`;
        }
        
        console.log('✅ Discovered', response.subreddits.length, 'relevant subreddits');
        
    } catch (error) {
        console.error('❌ Subreddit discovery failed:', error);
        alert('Subreddit discovery failed: ' + error.message);
        
        // Update status to show error
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = 'Discovery failed - check console for details';
        }
    } finally {
        discoverBtn.textContent = originalText;
        discoverBtn.disabled = false;
    }
}

// Display discovered subreddits using existing template
function displayDiscoveredSubreddits(subreddits, keywordsUsed = []) {
    const resultsContainer = document.getElementById('subredditResults');
    
    // Use existing template function
    const subredditsHTML = createDiscoveredSubredditsTemplate(subreddits, keywordsUsed);
    
    resultsContainer.innerHTML = subredditsHTML;
    resultsContainer.style.display = 'block';
}

// Initialize Reddit monitoring interface
function initializeRedditMonitor() {
    // Show/hide Reddit monitor based on setup completion
    const redditSection = document.querySelector('.reddit-section');
    if (redditSection) {
        if (window.appState.tabsCompleted.setup) {
            redditSection.classList.remove('disabled');
        } else {
            redditSection.classList.add('disabled');
        }
    }
    
    console.log('Reddit monitor initialized');
}

// Update Reddit monitor status
function updateRedditMonitorStatus() {
    const statusElement = document.getElementById('redditStatus');
    if (statusElement) {
        const discoveredCount = window.appState.discoveredSubreddits?.length || 0;
        const redditResultsCount = window.appState.searchResults?.filter(result => result.source_type === 'reddit').length || 0;
        const queriesGenerated = window.appState.redditQueries?.length || 0;
        
        if (discoveredCount === 0 && redditResultsCount === 0 && queriesGenerated === 0) {
            statusElement.textContent = 'Ready to discover communities';
        } else if (queriesGenerated > 0) {
            statusElement.textContent = `${queriesGenerated} queries, ${discoveredCount} subreddits, ${redditResultsCount} discussions`;
        } else {
            statusElement.textContent = `${discoveredCount} subreddits, ${redditResultsCount} discussions`;
        }
    }
}

// Test Reddit API connection
async function testRedditConnection() {
    try {
        console.log('🧪 Testing Reddit API connection...');
        
        const response = await fetch('/api/test');
        const data = await response.json();
        
        console.log('Reddit API test result:', data);
        
        if (data.tests && data.tests.reddit) {
            console.log('Reddit test status:', data.tests.reddit.status);
            console.log('Reddit test message:', data.tests.reddit.message);
        }
        
    } catch (error) {
        console.error('❌ Reddit connection test failed:', error);
    }
}