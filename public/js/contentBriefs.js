// Content briefs generation and display - cleaned up to redirect content generation properly

// Generate content briefs from selected articles
async function generateContentBriefs() {
    const selectedArticles = window.appState.searchResults.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
        alert('Please select at least one article to generate content briefs');
        return;
    }
    
    const generateBtn = document.querySelector('.content-brief-btn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Generating Content Briefs...';
    generateBtn.disabled = true;
    
    try {
        // Prepare comprehensive business context from clean data sources
        const businessContext = createBusinessContext();
        
        console.log('Generating content briefs for', selectedArticles.length, 'articles');
        console.log('Business context:', businessContext);
        
        const briefs = await generateContentBriefsFromAPI(selectedArticles, businessContext);
        console.log('Content briefs received:', briefs);
        
        // Display the briefs
        displayContentBriefs(briefs);
        
        // UPDATED: Mark content briefs tab as completed and switch to it
        markTabCompleted('contentBriefs');
        switchTab('contentBriefs');
        
        // Update empty states
        updateEmptyStates();
        
        console.log('✅ Content briefs generated and content briefs tab activated');
        
    } catch (error) {
        console.error('Error generating content briefs:', error);
        alert('Error generating content briefs: ' + error.message);
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// Create comprehensive business context from clean data sources
function createBusinessContext() {
    const userInput = window.appState.userInput || {};
    const websiteIntelligence = window.appState.websiteIntelligence || {};
    
    // Combine user input with website intelligence for rich business context
    const businessContext = {
        // User-provided information
        launchDate: userInput.launchDate,
        targetGeography: userInput.targetGeography,
        websiteUrl: userInput.websiteUrl,
        businessSpecifics: userInput.businessSpecifics,
        category: userInput.category,
        
        // Form-specific fields based on category
        businessDescription: userInput.businessDescription,
        targetCustomer: userInput.targetCustomer,
        customerAcquisition: userInput.customerAcquisition,
        additionalInfo: userInput.additionalInfo,
        
        // AI-extracted website intelligence
        companyName: websiteIntelligence.company_name,
        aiBusinessDescription: websiteIntelligence.business_description,
        valueProposition: websiteIntelligence.value_proposition,
        aiTargetCustomer: websiteIntelligence.target_customer,
        mainProductService: websiteIntelligence.main_product_service,
        keyFeatures: websiteIntelligence.key_features,
        industryCategory: websiteIntelligence.industry_category,
        uniqueSellingPoints: websiteIntelligence.unique_selling_points,
        companyMission: websiteIntelligence.company_mission,
        businessStage: websiteIntelligence.business_stage,
        
        // Combined context notes
        dataSource: {
            hasUserInput: !!userInput && Object.keys(userInput).length > 0,
            hasWebsiteIntelligence: !!websiteIntelligence && Object.keys(websiteIntelligence).length > 0,
            extractionMethod: websiteIntelligence.extraction_method || 'none'
        }
    };
    
    // Log context quality for debugging
    console.log('Business context created:', {
        userFields: Object.keys(userInput).length,
        websiteFields: Object.keys(websiteIntelligence).length,
        extractionMethod: businessContext.dataSource.extractionMethod
    });
    
    return businessContext;
}

// FIXED: Display content briefs without content generation integration
function displayContentBriefs(briefsData) {
    // Get the existing briefs container in the content briefs tab
    let briefsContainer = document.getElementById('contentBriefs');
    
    if (!briefsContainer) {
        console.error('Content briefs container not found');
        return;
    }
    
    // Use template function for briefs display
    const briefsHTML = createContentBriefsTemplate(briefsData);
    
    // FIXED: Add simple generation button section
    const contentGenerationSection = `
        <div class="content-generation-trigger">
            <h3>📋 Ready for Content Generation</h3>
            <p>Your content briefs are ready! Generate final Twitter content in the Content Studio.</p>
            <button class="generate-content-btn" onclick="generateContentFromBriefs()">
                🎨 Generate Twitter Content
            </button>
            <p class="generation-help">This will create ready-to-post Twitter content and take you to the Content Studio</p>
        </div>
    `;
    
    briefsContainer.innerHTML = briefsHTML + contentGenerationSection;
    briefsContainer.style.display = 'block';
    
    console.log('✅ Content briefs displayed with generation redirect');
}