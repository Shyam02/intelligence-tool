// public/js/contentBriefs.js - ENHANCED with better loading states for content fetching

// Generate content briefs from selected articles - ENHANCED loading messages
async function generateContentBriefs() {
    const selectedArticles = window.appState.searchResults.filter(article => article.selected);
    
    if (selectedArticles.length === 0) {
        alert('Please select at least one article to generate content briefs');
        return;
    }
    
    const generateBtn = document.querySelector('.content-brief-btn');
    const originalText = generateBtn.textContent;
    
    // ENHANCED: More specific loading messages
    generateBtn.disabled = true;
    
    try {
        // Phase 1: Indicate content fetching
        generateBtn.textContent = `🔍 Fetching full content for ${selectedArticles.length} articles...`;
        console.log('Starting content briefs generation with full content fetching...');
        
        // Prepare comprehensive business context from clean data sources
        const businessContext = createBusinessContext();
        
        console.log('Generating strategic content briefs for', selectedArticles.length, 'articles');
        console.log('Business context:', businessContext);

        // Phase 2: Indicate AI processing (this will include content fetching in backend)
        setTimeout(() => {
            generateBtn.textContent = '🧠 Analyzing full content and generating strategic briefs...';
        }, 2000);

        const strategicBriefs = await generateContentBriefsFromAPI(selectedArticles, businessContext);
        console.log('Strategic content briefs received:', strategicBriefs);
        
        // Display the briefs
        displayContentBriefs(strategicBriefs);
        
        // UPDATED: Mark content briefs tab as completed and switch to it
        markTabCompleted('contentBriefs');
        switchTab('contentBriefs');
        
        // Update empty states
        updateEmptyStates();
        
        console.log('✅ Strategic content briefs generated with full article content');
        
    } catch (error) {
        console.error('Error generating content briefs:', error);
        alert('Error generating content briefs: ' + error.message);
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// Create comprehensive business context from clean data sources (UNCHANGED)
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

// Display content briefs (UNCHANGED)
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
    
    // ENHANCEMENT: Log content fetching success if available
    if (briefsData.content_analysis_summary) {
        console.log('📊 Content Analysis Summary:', {
            articlesWithFullContent: briefsData.content_analysis_summary.articles_with_full_content_used,
            specificInsights: briefsData.content_analysis_summary.specific_insights_identified,
            highQualityOpportunities: briefsData.content_analysis_summary.high_quality_opportunities
        });
    }
}

// Extract strategic briefs for content generation (UNCHANGED)
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
    console.log('✅ generateContentBriefs function made available globally with enhanced content fetching');
}