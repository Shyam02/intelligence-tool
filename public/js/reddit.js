// Reddit frontend functionality - FIXED: No auto-switching + better results handling

// NEW: Generate Reddit queries (called when "Generate Search Queries" is clicked)
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
        
        // Display the queries
        displayRedditQueries(redditQueries);
        
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

// FIXED: Execute single Reddit search (NO auto-switching, better error handling)
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
        
        // FIXED: Better error handling and results processing
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
        
        // FIXED: Mark tab as completed but DON'T auto-switch
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
        
        // FIXED: Show success message instead of auto-switching
        alert(`✅ Success! Found ${searchResponse.articles.length} Reddit discussions.\n\nThey've been added to your Idea Bank. Switch to the Idea Bank tab to see and select them.`);
        
        console.log('✅ Reddit search completed successfully');
        
    } catch (error) {
        console.error('❌ Reddit search failed:', error);
        
        // FIXED: Better error messages
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

// NEW: Display generated Reddit queries (like search queries are displayed)
function displayRedditQueries(queries) {
    if (!queries || queries.length === 0) {
        document.getElementById('redditQueriesOutput').textContent = 'No Reddit queries generated';
        return;
    }
    
    // Format queries for display
    const formattedQueries = {
        generated_reddit_queries: queries,
        total_queries: queries.length,
        usage_note: "Copy any query above and paste it in the test field below to search Reddit discussions"
    };
    
    document.getElementById('redditQueriesOutput').textContent = JSON.stringify(formattedQueries, null, 2);
    
    console.log('📊 Reddit queries displayed:', queries.length, 'queries');
}

// UPDATED: Display search summary with better messaging
function displayRedditSearchSummary(searchResponse, query) {
    const resultsContainer = document.getElementById('redditSearchResults');
    
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
    
    resultsContainer.innerHTML = summaryHTML;
    resultsContainer.style.display = 'block';
}

// UPDATED: Discover relevant subreddits with better explanations
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
        
        // Display discovered subreddits with better explanation
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

// UPDATED: Display discovered subreddits with better explanation
function displayDiscoveredSubreddits(subreddits, keywordsUsed = []) {
    const resultsContainer = document.getElementById('subredditResults');
    
    if (!subreddits || subreddits.length === 0) {
        resultsContainer.innerHTML = `
            <div class="subreddits-container">
                <h4>📍 Subreddit Discovery</h4>
                <p>No relevant subreddits found. Try adjusting your business description in the Setup tab.</p>
            </div>`;
        resultsContainer.style.display = 'block';
        return;
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
    
    resultsContainer.innerHTML = subredditsHTML;
    resultsContainer.style.display = 'block';
}

// EXISTING: Initialize Reddit monitoring interface (NO CHANGES)
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

// UPDATED: Update Reddit monitor status
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

// DEBUGGING: Test Reddit API connection (NO CHANGES)
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