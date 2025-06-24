// Form handling and dynamic questions

// Initialize form event listeners
function initializeForms() {
    const form = document.getElementById('onboardingForm');
    const launchDateInput = document.getElementById('launchDate');
    const websiteUrlInput = document.getElementById('websiteUrl');
    
    // Add event listeners
    launchDateInput.addEventListener('change', updateCategoryQuestions);
    websiteUrlInput.addEventListener('input', updateCategoryQuestions);
    
    // NEW: Add website crawling trigger
    websiteUrlInput.addEventListener('blur', handleWebsiteUrlEntry);
    
    form.addEventListener('submit', handleFormSubmission);
}

// NEW FUNCTION: Handle website URL entry and trigger crawling
async function handleWebsiteUrlEntry(event) {
    const websiteUrl = event.target.value.trim();
    
    // Only crawl if we have a valid URL
    if (!websiteUrl || !isValidUrl(websiteUrl)) {
        // Clear any previous crawled data display
        hideCrawledDataDisplay();
        return;
    }
    
    console.log('🌐 User entered website URL:', websiteUrl);
    
    // Show crawling indicator
    showCrawlingIndicator();
    
    try {
        // Crawl the website
        const crawlResult = await crawlWebsiteAPI(websiteUrl);
        
        // Store crawled data globally
        window.currentCrawledData = crawlResult.crawled_data;
        
        // Display crawled data to user
        displayCrawledData(crawlResult.crawled_data);
        
        // Hide crawling indicator
        hideCrawlingIndicator();
        
        console.log('✅ Website crawling completed and displayed');
        
    } catch (error) {
        console.error('Website crawling failed:', error);
        
        // Show error to user
        displayCrawlingError(error.message);
        
        // Hide crawling indicator
        hideCrawlingIndicator();
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Show crawling indicator
function showCrawlingIndicator() {
    const websiteInput = document.getElementById('websiteUrl');
    
    // Create or show crawling indicator
    let indicator = document.getElementById('crawlingIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'crawlingIndicator';
        indicator.className = 'crawling-indicator';
        indicator.innerHTML = `
            <div class="crawling-spinner"></div>
            <span>🌐 Analyzing website...</span>
        `;
        websiteInput.parentNode.appendChild(indicator);
    }
    
    indicator.style.display = 'flex';
}

// Hide crawling indicator
function hideCrawlingIndicator() {
    const indicator = document.getElementById('crawlingIndicator');
    if (indicator) {
        indicator.style.display = 'none';
    }
}

// Display crawled data to user
function displayCrawledData(crawledData) {
    // Create or update crawled data display
    let display = document.getElementById('crawledDataDisplay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'crawledDataDisplay';
        display.className = 'crawled-data-display';
        
        // Insert after website URL input
        const websiteInput = document.getElementById('websiteUrl');
        websiteInput.parentNode.insertBefore(display, websiteInput.nextSibling);
    }
    
    // Build display content
    let displayHTML = `
        <div class="crawled-data-header">
            <h4>✅ Website Information Extracted</h4>
            <p>We found the following information from your website. This will be used to generate better marketing intelligence.</p>
        </div>
        <div class="crawled-data-content">
    `;
    
    // Show key extracted information
    if (crawledData.company_name && crawledData.company_name !== 'Not found') {
        displayHTML += `<div class="data-item"><strong>Company:</strong> ${crawledData.company_name}</div>`;
    }
    
    if (crawledData.business_description && crawledData.business_description !== 'Not found') {
        displayHTML += `<div class="data-item"><strong>Business:</strong> ${crawledData.business_description}</div>`;
    }
    
    if (crawledData.target_customer && crawledData.target_customer !== 'Not found') {
        displayHTML += `<div class="data-item"><strong>Target Customer:</strong> ${crawledData.target_customer}</div>`;
    }
    
    if (crawledData.industry_category && crawledData.industry_category !== 'Not found') {
        displayHTML += `<div class="data-item"><strong>Industry:</strong> ${crawledData.industry_category}</div>`;
    }
    
    if (crawledData.key_features && crawledData.key_features.length > 0) {
        displayHTML += `<div class="data-item"><strong>Key Features:</strong> ${crawledData.key_features.join(', ')}</div>`;
    }
    
    // Show if there were any errors
    if (crawledData.error) {
        displayHTML += `<div class="data-error">⚠️ ${crawledData.error}</div>`;
    }
    
    displayHTML += `
        </div>
        <div class="crawled-data-footer">
            <p><em>You can still fill out the form below to add or correct any information.</em></p>
        </div>
    `;
    
    display.innerHTML = displayHTML;
    display.style.display = 'block';
}

// Display crawling error
function displayCrawlingError(errorMessage) {
    let display = document.getElementById('crawledDataDisplay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'crawledDataDisplay';
        display.className = 'crawled-data-display';
        
        const websiteInput = document.getElementById('websiteUrl');
        websiteInput.parentNode.insertBefore(display, websiteInput.nextSibling);
    }
    
    display.innerHTML = `
        <div class="crawled-data-error">
            <h4>⚠️ Website Analysis Failed</h4>
            <p>We couldn't extract information from your website: ${errorMessage}</p>
            <p><em>Please fill out the form below manually.</em></p>
        </div>
    `;
    display.style.display = 'block';
}

// Hide crawled data display
function hideCrawledDataDisplay() {
    const display = document.getElementById('crawledDataDisplay');
    if (display) {
        display.style.display = 'none';
    }
}

// Update category-specific questions based on form inputs
function updateCategoryQuestions() {
    const launchDate = document.getElementById('launchDate').value;
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    const categorySpecificSection = document.getElementById('categorySpecificSection');
    
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

// Generate dynamic questions based on business category
function generateCategoryQuestions(category) {
    const categoryQuestions = document.getElementById('categoryQuestions');
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
                    <p class="help-text">Add details that might not be clear from your website</p>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                    <p class="help-text">Be more specific than what's on your website if needed</p>
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

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
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
    
    // Add crawled data if available
    if (window.currentCrawledData) {
        onboardingData.crawledData = window.currentCrawledData;
        console.log('🌐 Including crawled website data in intelligence generation');
    }
    
    // Store data globally
    window.currentOnboardingData = onboardingData;
    
    // Show loading
    document.querySelector('.form-container').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Generate intelligence using API
        const intelligence = await generateIntelligence(onboardingData);
        window.currentIntelligence = intelligence;
        
        // Hide loading and show results
        document.getElementById('loading').style.display = 'none';
        displayIntelligenceResults(onboardingData, intelligence);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Error generating intelligence: ' + error.message);
        document.querySelector('.form-container').style.display = 'block';
    }
}