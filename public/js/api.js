// API communication functions

// Test API connection
async function testAPI() {
    const btn = document.querySelector('.test-api-btn');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Testing...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        if (response.ok) {
            btn.textContent = '✅ API Working';
            btn.style.background = '#48bb78';
            console.log('API Test successful:', data);
            alert('✅ Claude API connection successful!\n\nResponse: ' + data.response);
        } else {
            throw new Error(data.error || 'API test failed');
        }
    } catch (error) {
        btn.textContent = '❌ API Failed';
        btn.style.background = '#f56565';
        console.error('API Test failed:', error);
        alert('❌ API Test Failed:\n\n' + error.message + '\n\nCheck your .env file and API key.');
    }
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '#4299e1';
        btn.disabled = false;
    }, 3000);
}

// NEW FUNCTION: Crawl website and extract business information
async function crawlWebsiteAPI(websiteUrl) {
    try {
        console.log('🌐 Starting website crawl for:', websiteUrl);
        
        const response = await fetch('/api/crawlWebsite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ websiteUrl })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const crawlResult = await response.json();
        console.log('✅ Website crawl completed:', crawlResult);
        return crawlResult;
        
    } catch (error) {
        console.error('Error crawling website:', error);
        throw new Error('Failed to crawl website: ' + error.message);
    }
}

// Generate foundational intelligence
async function generateIntelligence(onboardingData) {
    try {
        const response = await fetch('/api/generateIntelligence', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(onboardingData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const intelligence = await response.json();
        return intelligence;
        
    } catch (error) {
        console.error('Error generating intelligence:', error);
        throw new Error('Failed to generate intelligence: ' + error.message);
    }
}

// Generate search queries
async function generateQueriesFromAPI(foundationalIntelligence) {
    try {
        const response = await fetch('/api/generateQueries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(foundationalIntelligence)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const queries = await response.json();
        console.log('Queries received from API:', queries);
        return queries;
        
    } catch (error) {
        console.error('Error generating queries:', error);
        throw new Error('Failed to generate queries: ' + error.message);
    }
}

// Execute search query
async function executeSearch(query) {
    try {
        console.log('Sending search request for query:', query);
        
        const response = await fetch('/api/executeSearch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const searchData = await response.json();
        console.log('Search data received:', searchData);
        return searchData;
        
    } catch (error) {
        console.error('Search execution error:', error);
        throw new Error('Search failed: ' + error.message);
    }
}

// Generate content briefs from articles
async function generateContentBriefsFromAPI(selectedArticles, businessContext) {
    console.log('API: generateContentBriefsFromAPI called with', selectedArticles.length, 'articles');
    try {
        const response = await fetch('/api/generateContentBriefs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                articles: selectedArticles,
                businessContext: businessContext
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const briefs = await response.json();
        console.log('Content briefs received from API:', briefs);
        return briefs;
        
    } catch (error) {
        console.error('Error generating content briefs:', error);
        throw new Error('Failed to generate content briefs: ' + error.message);
    }
}

// NEW: Generate Twitter content from briefs
async function generateTwitterContentAPI(briefs, businessContext, regenerateOptions = null) {
    console.log('API: generateTwitterContentAPI called with', briefs.length, 'briefs');
    try {
        const response = await fetch('/api/generateTwitterContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                briefs: briefs,
                businessContext: businessContext,
                regenerateOptions: regenerateOptions
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const generatedContent = await response.json();
        console.log('Generated content received from API:', generatedContent);
        return generatedContent;
        
    } catch (error) {
        console.error('Error generating Twitter content:', error);
        throw new Error('Failed to generate Twitter content: ' + error.message);
    }
}

// NEW: Regenerate specific content piece
async function regenerateContentAPI(brief, businessContext, variationRequest = null) {
    console.log('API: regenerateContentAPI called for brief:', brief.angle || 'Unknown');
    try {
        const response = await fetch('/api/regenerateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                brief: brief,
                businessContext: businessContext,
                variationRequest: variationRequest
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const regeneratedContent = await response.json();
        console.log('Regenerated content received from API:', regeneratedContent);
        return regeneratedContent;
        
    } catch (error) {
        console.error('Error regenerating content:', error);
        throw new Error('Failed to regenerate content: ' + error.message);
    }
}

// NEW: Discover relevant subreddits
async function discoverSubredditsAPI(foundationalIntelligence) {
    try {
        console.log('🔍 Discovering subreddits using business intelligence...');
        
        const response = await fetch('/api/discoverSubreddits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foundationalIntelligence })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('✅ Subreddit discovery completed:', result);
        return result;
        
    } catch (error) {
        console.error('Error discovering subreddits:', error);
        throw new Error('Failed to discover subreddits: ' + error.message);
    }
}

// UPDATED: Generate Reddit search queries using AI backend (replaced frontend-only version)
async function generateRedditQueriesAPI(foundationalIntelligence) {
    try {
        console.log('📝 Generating Reddit search queries using AI backend...');
        
        const response = await fetch('/api/generateRedditSearchQueries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foundationalIntelligence })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('✅ AI-powered Reddit queries generated:', result);
        return result.queries; // Return the simple array for frontend compatibility
        
    } catch (error) {
        console.error('Error generating Reddit queries:', error);
        throw new Error('Failed to generate Reddit queries: ' + error.message);
    }
}

// NEW: Search Reddit discussions
async function searchRedditAPI(searchQueries, discoveredSubreddits = []) {
    try {
        console.log('🔍 Searching Reddit discussions...');
        
        const subredditNames = discoveredSubreddits.map(sub => sub.name).slice(0, 5);
        
        const response = await fetch('/api/searchReddit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                searchQueries: searchQueries,
                subreddits: subredditNames,
                timeFrame: 'month'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const result = await response.json();
        console.log('✅ Reddit search completed:', result);
        return result;
        
    } catch (error) {
        console.error('Error searching Reddit:', error);
        throw new Error('Failed to search Reddit: ' + error.message);
    }
}