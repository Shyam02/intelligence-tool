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

// Generate foundational intelligence
async function generateIntelligence(onboardingData) {
    try {
        const response = await fetch('/api/generate-intelligence', {
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
        const response = await fetch('/api/generate-queries', {
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
        
        const response = await fetch('/api/execute-search', {
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

// Generate Twitter briefs from articles
async function generateTwitterBriefsFromAPI(selectedArticles, businessContext) {
    console.log('API: generateTwitterBriefsFromAPI called with', selectedArticles.length, 'articles');
    try {
        const response = await fetch('/api/generate-twitter-briefs', {
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
        console.log('Twitter briefs received from API:', briefs);
        return briefs;
        
    } catch (error) {
        console.error('Error generating Twitter briefs:', error);
        throw new Error('Failed to generate Twitter briefs: ' + error.message);
    }
}