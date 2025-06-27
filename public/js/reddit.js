// Reddit frontend functionality - FIXED

// Discover relevant subreddits based on business intelligence
async function discoverRelevantSubreddits() {
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
        
        // Display discovered subreddits
        displayDiscoveredSubreddits(response.subreddits);
        
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

// Search Reddit discussions using generated queries
async function searchRedditDiscussions() {
    if (!window.appState.foundationalIntelligence) {
        alert('Please complete the Setup tab first to generate business intelligence');
        return;
    }
    
    const searchBtn = document.querySelector('.search-reddit-btn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = '⏳ Searching Reddit...';
    searchBtn.disabled = true;
    
    try {
        console.log('🔍 Starting Reddit discussion search...');
        
        // Generate Reddit search queries first
        const redditQueries = await generateRedditQueriesAPI(window.appState.foundationalIntelligence);
        console.log('📝 Generated Reddit queries:', redditQueries);
        
        // Store queries for reference
        window.appState.redditQueries = redditQueries;
        
        // Execute Reddit search
        const searchResponse = await searchRedditAPI(redditQueries, window.appState.discoveredSubreddits || []);
        
        // Add Reddit results to existing search results
        if (searchResponse.articles && Array.isArray(searchResponse.articles)) {
            // Merge with existing search results
            const existingResults = window.appState.searchResults || [];
            window.appState.searchResults = [...existingResults, ...searchResponse.articles];
            
            // Display updated results in idea bank
            displayArticles(window.appState.searchResults);
            
            // Show search results and update tab
            document.getElementById('searchResults').style.display = 'block';
            markTabCompleted('ideaBank');
            switchTab('ideaBank');
            updateEmptyStates();
        }
        
        // Display Reddit-specific results
        displayRedditSearchResults(searchResponse);
        
        // Update Reddit status
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            const totalDiscussions = searchResponse.articles?.length || 0;
            redditStatus.textContent = `${window.appState.discoveredSubreddits?.length || 0} subreddits, ${totalDiscussions} discussions`;
        }
        
        console.log('✅ Reddit search completed:', searchResponse.articles?.length || 0, 'discussions found');
        
    } catch (error) {
        console.error('❌ Reddit search failed:', error);
        alert('Reddit search failed: ' + error.message);
        
        // Update status to show error
        const redditStatus = document.getElementById('redditStatus');
        if (redditStatus) {
            redditStatus.textContent = 'Search failed - check console for details';
        }
    } finally {
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
    }
}

// Display discovered subreddits
function displayDiscoveredSubreddits(subreddits) {
    const resultsContainer = document.getElementById('subredditResults');
    
    if (!subreddits || subreddits.length === 0) {
        resultsContainer.innerHTML = '<div class="subreddits-container"><p>No relevant subreddits found. Try adjusting your business description.</p></div>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    let subredditsHTML = `
        <div class="subreddits-container">
            <h4>📍 Discovered ${subreddits.length} Relevant Subreddits</h4>
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
        </div>
    `;
    
    resultsContainer.innerHTML = subredditsHTML;
    resultsContainer.style.display = 'block';
}

// Display Reddit search results
function displayRedditSearchResults(searchResponse) {
    const resultsContainer = document.getElementById('redditSearchResults');
    
    let resultsHTML = `
        <div class="reddit-search-container">
            <h4>💬 Reddit Discussion Search Results</h4>
            <div class="search-summary">
                <p><strong>Queries Executed:</strong> ${searchResponse.search_queries?.length || 0}</p>
                <p><strong>Total Discussions Found:</strong> ${searchResponse.total_posts_found || 0}</p>
                <p><strong>Articles Added to Idea Bank:</strong> ${searchResponse.articles?.length || 0}</p>
                <p><strong>Status:</strong> ${searchResponse.success ? 'Success' : 'Partial Success'}</p>
            </div>
        </div>
    `;
    
    // Show query execution details
    if (searchResponse.search_results && searchResponse.search_results.length > 0) {
        resultsHTML += `
            <div class="query-results">
                <h5>📊 Search Execution Details:</h5>
                <ul>
        `;
        
        searchResponse.search_results.forEach(result => {
            const status = result.error ? '❌' : '✅';
            resultsHTML += `
                <li>
                    ${status} <strong>"${result.query}"</strong> - 
                    ${result.total_results} results
                    ${result.error ? ` (Error: ${result.error})` : ''}
                </li>
            `;
        });
        
        resultsHTML += `
                </ul>
            </div>
        `;
    }
    
    // Add tip for better results
    if (searchResponse.articles && searchResponse.articles.length > 0) {
        resultsHTML += `
            <div class="search-tip">
                <p><strong>💡 Tip:</strong> Reddit discussions have been added to your Idea Bank. Switch to the Idea Bank tab to select them for content brief generation.</p>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = resultsHTML;
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
        
        if (discoveredCount === 0 && redditResultsCount === 0) {
            statusElement.textContent = 'Ready to discover communities';
        } else {
            statusElement.textContent = `${discoveredCount} subreddits, ${redditResultsCount} discussions`;
        }
    }
}

// DEBUGGING: Test Reddit API connection
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