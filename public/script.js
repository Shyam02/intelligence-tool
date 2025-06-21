let currentOnboardingData = null;
let currentIntelligence = null;

// DOM elements
const form = document.getElementById('onboardingForm');
const loading = document.getElementById('loading');
const resultsContainer = document.getElementById('resultsContainer');
const queriesContainer = document.getElementById('queriesContainer');
const categorySpecificSection = document.getElementById('categorySpecificSection');
const categoryQuestions = document.getElementById('categoryQuestions');

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

// Form change handlers
document.getElementById('launchDate').addEventListener('change', updateCategoryQuestions);
document.getElementById('websiteUrl').addEventListener('input', updateCategoryQuestions);

function updateCategoryQuestions() {
    const launchDate = document.getElementById('launchDate').value;
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    
    if (!launchDate) {
        categorySpecificSection.style.display = 'none';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl !== '';
    
    let category = '';
    if (isPreLaunch && !hasWebsite) {
        category = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        category = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        category = 'Post-launch + No website';
    } else {
        category = 'Post-launch + Has website';
    }
    
    generateCategoryQuestions(category);
    categorySpecificSection.style.display = 'block';
}

function generateCategoryQuestions(category) {
    let questionsHTML = `<p class="category-indicator"><strong>Category: ${category}</strong></p>`;
    
    switch(category) {
        case 'Pre-launch + No website':
            questionsHTML += `
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Pre-launch + Has website':
            questionsHTML += `
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Post-launch + No website':
            questionsHTML += `
                <div class="form-group">
                    <label for="customerAcquisition">How do customers currently find/buy from you?</label>
                    <input type="text" id="customerAcquisition" name="customerAcquisition" placeholder="e.g., App store, marketplace, direct contact" required>
                </div>
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Post-launch + Has website':
            questionsHTML += `
                <div class="form-group">
                    <label for="additionalInfo">Anything specific about your business we should know that might not be on your website?</label>
                    <textarea id="additionalInfo" name="additionalInfo" rows="3"></textarea>
                    <p class="help-text">Help us understand details that might not be public yet, such as: Recent changes in strategy or focus, New features or updates not yet on the website, Behind-the-scenes challenges or wins, Target customer insights you've learned, Competitors you're most concerned about, Revenue milestones or growth metrics, Team updates or hiring plans, Upcoming launches or announcements</p>
                </div>
            `;
            break;
    }
    
    categoryQuestions.innerHTML = questionsHTML;
}

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const onboardingData = {};
    
    for (let [key, value] of formData.entries()) {
        onboardingData[key] = value;
    }
    
    // Add calculated category
    const launchDate = onboardingData.launchDate;
    const websiteUrl = onboardingData.websiteUrl;
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl && websiteUrl.trim() !== '';
    
    if (isPreLaunch && !hasWebsite) {
        onboardingData.category = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        onboardingData.category = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        onboardingData.category = 'Post-launch + No website';
    } else {
        onboardingData.category = 'Post-launch + Has website';
    }
    
    currentOnboardingData = onboardingData;
    
    // Show loading
    document.querySelector('.form-container').style.display = 'none';
    loading.style.display = 'block';
    
    try {
        // Call the API to generate intelligence
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
        currentIntelligence = intelligence;
        
        // Hide loading and show results
        loading.style.display = 'none';
        displayResults(onboardingData, intelligence);
        
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        alert('Error generating intelligence: ' + error.message);
        document.querySelector('.form-container').style.display = 'block';
    }
});

function displayResults(onboardingData, intelligence) {
    // Display onboarding data
    document.getElementById('onboardingDataOutput').textContent = JSON.stringify(onboardingData, null, 2);
    
    // Display intelligence data
    document.getElementById('intelligenceOutput').textContent = JSON.stringify(intelligence, null, 2);
    
    // Show results container
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

async function generateQueries() {
    if (!currentIntelligence) {
        alert('No intelligence data available');
        return;
    }
    
    try {
        // Show loading state
        const generateBtn = document.querySelector('.next-btn');
        const originalText = generateBtn.textContent;
        generateBtn.textContent = '⏳ Generating Queries...';
        generateBtn.disabled = true;
        
        const response = await fetch('/api/generate-queries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentIntelligence)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const queries = await response.json();
        
        // Display queries
        document.getElementById('competitorQueriesOutput').textContent = JSON.stringify(queries.competitor_queries, null, 2);
        document.getElementById('keywordQueriesOutput').textContent = JSON.stringify(queries.keyword_queries, null, 2);
        document.getElementById('contentQueriesOutput').textContent = JSON.stringify(queries.content_queries, null, 2);
        
        // Show queries container
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
        
        // Format the search results nicely
        const formattedResults = {
            original_query: searchData.original_query,
            method_used: searchData.method_used,
            timestamp: searchData.timestamp,
            status: searchData.status,
            search_analysis: searchData.search_analysis
        };
        
        // Display search results
        document.getElementById('searchResultsOutput').textContent = JSON.stringify(formattedResults, null, 2);
        document.getElementById('searchResults').style.display = 'block';
        
        // Show success message based on method used
        if (searchData.method_used === 'web_search_tool') {
            console.log('✅ Successfully used web search tool');
        } else if (searchData.method_used === 'knowledge_based_fallback') {
            console.log('⚠️ Used knowledge-based fallback (web search tool not available)');
        }
        
    } catch (error) {
        console.error('Search execution error:', error);
        alert(`Search failed: ${error.message}\n\nCheck browser console for details.`);
    } finally {
        testBtn.textContent = originalText;
        testBtn.disabled = false;
    }
}

function copyToClipboard(elementId, button) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.log('Clipboard API failed, trying fallback:', err);
            fallbackCopyToClipboard(text, button);
        });
    } else {
        // Fallback for older browsers or non-HTTPS
        fallbackCopyToClipboard(text, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.top = '0';
        textarea.style.left = '0';
        document.body.appendChild(textarea);
        
        // Select and copy the text
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyError(button);
    }
}

function showCopySuccess(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = '✅ Copied!';
    button.style.background = '#48bb78';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground || '#4299e1';
    }, 2000);
}

function showCopyError(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = '❌ Copy Failed';
    button.style.background = '#f56565';
    
    // Also show alert with manual copy instruction
    alert('Copy failed. Please manually select and copy the text from the box above.');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground || '#4299e1';
    }, 3000);
}

function resetForm() {
    // Reset all form data
    form.reset();
    currentOnboardingData = null;
    currentIntelligence = null;
    
    // Hide all result containers
    resultsContainer.style.display = 'none';
    queriesContainer.style.display = 'none';
    categorySpecificSection.style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    
    // Show form container
    document.querySelector('.form-container').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}