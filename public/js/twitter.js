// Twitter content briefs generation and display

// Generate Twitter briefs from selected articles
async function generateTwitterContentBriefs() {
    const selectedArticles = window.appState.searchResults.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
        alert('Please select at least one article to generate Twitter briefs');
        return;
    }
    
    const generateBtn = document.querySelector('.twitter-brief-btn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Generating Twitter Briefs...';
    generateBtn.disabled = true;
    
    try {
        // Prepare comprehensive business context from clean data sources
        const businessContext = createBusinessContext();
        
        console.log('Generating Twitter briefs for', selectedArticles.length, 'articles');
        console.log('Business context:', businessContext);
        
        const briefs = await generateTwitterBriefsFromAPI(selectedArticles, businessContext);
        console.log('Twitter briefs received:', briefs);
        
        // Display the briefs
        displayTwitterBriefs(briefs);
        
        // UPDATED: Mark content briefs tab as completed and switch to it
        markTabCompleted('contentBriefs');
        switchTab('contentBriefs');
        
        // Update empty states
        updateEmptyStates();
        
        console.log('✅ Twitter briefs generated and content briefs tab activated');
        
    } catch (error) {
        console.error('Error generating Twitter briefs:', error);
        alert('Error generating Twitter briefs: ' + error.message);
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

// UPDATED: Display Twitter briefs with content generation integration
function displayTwitterBriefs(briefsData) {
    // Get the existing briefs container in the content briefs tab
    let briefsContainer = document.getElementById('twitterBriefs');
    
    if (!briefsContainer) {
        console.error('Twitter briefs container not found');
        return;
    }
    
    // Use template function for briefs display
    const briefsHTML = createTwitterBriefsTemplate(briefsData);
    
    // UPDATED: Add content generation section after briefs
    const contentGenerationSection = `
        <div class="content-generation-section" id="contentGenerationSection" style="display: none;">
            ${createGenerationButtonTemplate()}
            <div id="generatedContentContainer">
                ${createEmptyContentGenerationTemplate()}
            </div>
        </div>
    `;
    
    briefsContainer.innerHTML = briefsHTML + contentGenerationSection;
    briefsContainer.style.display = 'block';
    
    // Show the generation button section
    setTimeout(() => {
        const generationSection = document.getElementById('contentGenerationSection');
        if (generationSection) {
            generationSection.style.display = 'block';
        }
    }, 500);
    
    console.log('✅ Twitter briefs displayed with content generation integration');
}