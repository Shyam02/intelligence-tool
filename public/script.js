let currentOnboardingData = null;
let currentIntelligence = null;
let foundArticles = []; // Store articles globally for selection

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

// UPDATED SEARCH FUNCTIONALITY - NOW HANDLES ARTICLES
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
        
        // Store articles globally and display them
        if (searchData.articles && Array.isArray(searchData.articles)) {
            foundArticles = searchData.articles;
            displayArticles(foundArticles);
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

// NEW FUNCTION: Display articles with selection interface
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
        </div>
    `;
    
    document.getElementById('searchResultsOutput').innerHTML = articlesHTML;
}

// NEW FUNCTION: Display API call information for debugging
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

// NEW FUNCTION: Toggle article selection
function toggleArticleSelection(articleId) {
    const article = foundArticles.find(a => a.id === articleId);
    if (article) {
        article.selected = !article.selected;
        console.log(`Article ${articleId} ${article.selected ? 'selected' : 'deselected'}`);
    }
}

// NEW FUNCTION: Select all articles
function selectAllArticles() {
    foundArticles.forEach(article => article.selected = true);
    foundArticles.forEach(article => {
        const checkbox = document.getElementById(`article-${article.id}`);
        if (checkbox) checkbox.checked = true;
    });
    console.log('All articles selected');
}

// NEW FUNCTION: Deselect all articles
function deselectAllArticles() {
    foundArticles.forEach(article => article.selected = false);
    foundArticles.forEach(article => {
        const checkbox = document.getElementById(`article-${article.id}`);
        if (checkbox) checkbox.checked = false;
    });
    console.log('All articles deselected');
}

// NEW FUNCTION: Copy selected articles
function copySelectedArticles() {
    const selectedArticles = foundArticles.filter(article => article.selected);
    
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
    foundArticles = []; // Reset articles too
    
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