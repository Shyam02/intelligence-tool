// Strategic content briefs generation and display - creates strategic planning documents
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
        
        console.log('Generating strategic content briefs for', selectedArticles.length, 'articles');
        console.log('Business context:', businessContext);

        const strategicBriefs = await generateContentBriefsFromAPI(selectedArticles, businessContext);
        console.log('Strategic content briefs received:', strategicBriefs);
        
        // Display the briefs
        displayContentBriefs(strategicBriefs);
        
        // UPDATED: Mark content briefs tab as completed and switch to it
        markTabCompleted('contentBriefs');
        switchTab('contentBriefs');
        
        // Update empty states
        updateEmptyStates();
        
        console.log('✅ Strategic content briefs generated and content briefs tab activated');
        
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

function displayContentBriefs(briefsData) {
    let briefsContainer = document.getElementById('contentBriefs');
    if (!briefsContainer) {
        console.error('Content briefs container not found');
        return;
    }

    // Store strategic briefs in global state for content generation
    window.appState.strategicBriefs = briefsData;

    // Use template function for strategic briefs display
    const briefsHTML = createContentBriefsTemplate(briefsData);

    // Display the strategic briefs
    briefsContainer.innerHTML = briefsHTML;

    // ✅ CRITICAL: Make container visible
    briefsContainer.style.display = 'block';

    // Hide the empty state
    const emptyState = document.getElementById('contentBriefsEmpty');
    if (emptyState) emptyState.style.display = 'none';

    // ✅ ADD THIS LINE: Automatically switch to content briefs tab
    switchTab('contentBriefs');
    
    // ✅ ADD THIS LINE: Mark tab as completed
    markTabCompleted('contentBriefs');

    console.log('✅ Strategic content briefs displayed:', briefsData.total_briefs, 'briefs');
}
    


// Extract strategic briefs for content generation
function extractStrategicBriefsFromCurrentDisplay() {
    if (!window.appState.strategicBriefs) {
        console.error('No strategic briefs available in app state');
        return [];
    }
    
    // Extract all viable briefs from stored strategic briefs
    const allBriefs = [];
    
    window.appState.strategicBriefs.results.forEach(result => {
        if (result.viable && result.briefs) {
            result.briefs.forEach(brief => {
                allBriefs.push({
                    ...brief,
                    source_article_title: result.article_title,
                    source_article_id: result.article_id
                });
            });
        }
    });
    
    console.log('📋 Extracted strategic briefs for generation:', allBriefs.length);
    return allBriefs;
}

// Explicitly make function available globally
if (typeof window !== 'undefined') {
    window.generateContentBriefs = generateContentBriefs;
    console.log('✅ generateContentBriefs function made available globally');
}