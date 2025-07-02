// Form handling and dynamic questions

// Initialize form event listeners
function initializeForms() {
    const form = document.getElementById('onboardingForm');
    const launchDateInput = document.getElementById('launchDate');
    const websiteUrlInput = document.getElementById('websiteUrl');
    
    // Add event listeners
    launchDateInput.addEventListener('change', updateCategoryQuestions);
    websiteUrlInput.addEventListener('input', updateCategoryQuestions);
    
    // UPDATED: Only validate URL, no crawling
    websiteUrlInput.addEventListener('blur', handleWebsiteUrlValidation);
    
    form.addEventListener('submit', handleFormSubmission);
}

// UPDATED: Simple URL validation only, no crawling
function handleWebsiteUrlValidation(event) {
    const websiteUrl = event.target.value.trim();
    
    // Only validate if we have a URL
    if (!websiteUrl) {
        // Clear any previous displays
        hideCrawledDataDisplay();
        return;
    }
    
    if (!isValidUrl(websiteUrl)) {
        // Could show validation error here if needed
        hideCrawledDataDisplay();
        return;
    }
    
    // Just hide any previous displays, no crawling
    hideCrawledDataDisplay();
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

// UPDATED: Only hide display, no other functionality needed
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

// UPDATED: Generate dynamic questions based on business category - NOW USES TEMPLATE
function generateCategoryQuestions(category) {
    const categoryQuestions = document.getElementById('categoryQuestions');
    
    // Use template function instead of inline HTML construction
    const questionsHTML = createCategoryQuestionsTemplate(category);
    
    categoryQuestions.innerHTML = questionsHTML;
}

// UPDATED: Handle form submission with enhanced loading message and tab navigation
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Collect pure user form data
    const formData = new FormData(e.target);
    const userInput = {};
    
    for (let [key, value] of formData.entries()) {
        userInput[key] = value;
    }
    
    // Add calculated category to user input
    const launchDate = userInput.launchDate;
    const websiteUrl = userInput.websiteUrl;
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl && websiteUrl.trim() !== '';
    
    if (isPreLaunch && !hasWebsite) {
        userInput.category = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        userInput.category = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        userInput.category = 'Post-launch + No website';
    } else {
        userInput.category = 'Post-launch + Has website';
    }
    
    // Store pure user input separately
    window.appState.userInput = userInput;
    
    // Prepare combined data for API
    const combinedDataForAPI = { ...userInput };
    
    // Show loading
    document.querySelector('.form-container').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    // UPDATED: Enhanced loading message for competitor research
    const loadingText = document.querySelector('#loading p');
    if (loadingText) {
        if (hasWebsite) {
            loadingText.textContent = 'Analyzing website, researching competitors, and generating intelligence...';
        } else {
            loadingText.textContent = 'Researching competitors and generating foundational intelligence...';
        }
    }
    
    try {
        // UPDATED: Crawl website first if URL provided
        if (hasWebsite) {
            console.log('🌐 Starting website crawling during form submission for:', websiteUrl);
            
            const crawlResult = await crawlWebsiteAPI(websiteUrl);
            window.appState.websiteIntelligence = crawlResult.crawled_data;
            combinedDataForAPI.crawledData = crawlResult.crawled_data;
            
            console.log('✅ Website crawling completed during form submission');
            
            // Update loading message to show progress
            if (loadingText) {
                loadingText.textContent = 'Website analyzed! Now researching competitors and generating intelligence...';
            }
        }
        
        // Generate intelligence using API (with crawled data if available) - now includes competitor research
        const intelligence = await generateIntelligence(combinedDataForAPI);
        window.appState.foundationalIntelligence = intelligence;
        
        // Hide loading and show results with clean organization
        document.getElementById('loading').style.display = 'none';
        displayIntelligenceResults(
            window.appState.userInput, 
            window.appState.websiteIntelligence, 
            window.appState.foundationalIntelligence
        );
        
        // UPDATED: Mark setup tab as completed and enable idea sources tab
        markTabCompleted('setup');
        
        // Generate content strategy after intelligence is complete
        try {
            await generateContentStrategy();
        } catch (strategyError) {
            console.warn('Content strategy generation failed, continuing without it:', strategyError);
        }
        
        // Show the "Generate Search Queries" button by making results container visible
        document.getElementById('resultsContainer').style.display = 'block';
        
        console.log('✅ Setup completed successfully, ready for idea sources');
        
    } catch (error) {
        console.error('Error during form submission:', error);
        document.getElementById('loading').style.display = 'none';
        
        // Show specific error message based on failure point
        let errorMessage = 'Error processing your request: ' + error.message;
        if (error.message.includes('crawl') || error.message.includes('website')) {
            errorMessage = 'Failed to analyze website. Please check the URL and try again, or continue without website analysis.\n\n' + error.message;
        } else if (error.message.includes('competitor')) {
            errorMessage = 'Competitor research failed, but basic analysis completed. You can continue with the available data.\n\n' + error.message;
        }
        
        alert(errorMessage);
        document.querySelector('.form-container').style.display = 'block';
        
        // Reset loading text
        if (loadingText) {
            loadingText.textContent = 'Generating foundational intelligence...';
        }
    }
}

// Generate content strategy after intelligence completion
async function generateContentStrategy() {
    try {
        console.log('📋 Generating content strategy...');
        
        // Collect business context from app state
        const businessContext = {
            business_profile: window.appState.userInput || {},
            competitor_analysis: window.appState.foundationalIntelligence?.competitor_intelligence || {},
            industry_insights: window.appState.searchResults || [],
            website_data: window.appState.websiteIntelligence || {},
            business_goals: window.appState.userInput?.businessGoals || "general growth",
            current_presence: window.appState.userInput?.existingSocialAccounts || {}
        };
        
        // Assess data availability
        const availableData = {
            has_business_profile: !!window.appState.userInput,
            has_competitor_data: !!window.appState.foundationalIntelligence?.competitor_intelligence,
            has_industry_insights: window.appState.searchResults?.length > 0,
            has_website_data: !!window.appState.websiteIntelligence
        };
        
        // Generate strategy using API
        const strategyResponse = await generateContentStrategyAPI(businessContext, availableData);
        
        if (strategyResponse.success) {
            window.appState.contentStrategy = strategyResponse.strategy;
            displayContentStrategy(strategyResponse.strategy);
            markSubTabCompleted('setup', 'contentStrategy');
            console.log('✅ Content strategy generated and displayed');
        } else {
            throw new Error(strategyResponse.error || 'Failed to generate content strategy');
        }
        
    } catch (error) {
        console.error('❌ Content strategy generation failed:', error);
        throw error;
    }
}

// Display content strategy in the UI
function displayContentStrategy(strategy) {
    const container = document.getElementById('contentStrategyContainer');
    if (container) {
        const template = createContentStrategyTemplate(strategy);
        container.innerHTML = template;
        container.style.display = 'block';
        
        // Hide empty state
        const emptyState = document.getElementById('contentStrategyEmptyState');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
}