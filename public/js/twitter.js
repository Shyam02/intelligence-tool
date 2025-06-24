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

// Display Twitter briefs
function displayTwitterBriefs(briefsData) {
    // Check if briefs container exists, if not create it
    let briefsContainer = document.getElementById('twitterBriefs');
    if (!briefsContainer) {
        briefsContainer = document.createElement('div');
        briefsContainer.id = 'twitterBriefs';
        briefsContainer.className = 'twitter-briefs-container';
        briefsContainer.style.display = 'none';
        
        // Insert after search results
        const searchResults = document.getElementById('searchResults');
        searchResults.parentNode.insertBefore(briefsContainer, searchResults.nextSibling);
    }
    
    // Build HTML for briefs
    let briefsHTML = `
        <h3>🐦 Twitter Content Briefs</h3>
        <div class="briefs-summary">
            <p><strong>Articles Evaluated:</strong> ${briefsData.evaluated_count}</p>
            <p><strong>Viable Articles:</strong> ${briefsData.viable_count}</p>
            <p><strong>Total Briefs Generated:</strong> ${briefsData.total_briefs}</p>
        </div>
    `;
    
    briefsData.results.forEach(result => {
        briefsHTML += `
            <div class="article-brief-section">
                <h4 class="article-brief-title">${result.article_title}</h4>
        `;
        
        if (result.viable) {
            result.briefs.forEach((brief, index) => {
                briefsHTML += `
                    <div class="twitter-brief-card">
                        <div class="brief-header">
                            <span class="brief-angle">Angle ${index + 1}: ${brief.angle}</span>
                            <span class="brief-type">${brief.content_type}</span>
                        </div>
                        <div class="brief-content">
                            <p class="brief-hook"><strong>Hook:</strong> ${brief.hook}</p>
                            <div class="tweet-preview">
                                <p>${brief.content}</p>
                                <p class="tweet-length">${brief.content.length}/280 characters</p>
                            </div>
                            <div class="brief-metadata">
                                <p><strong>Strategy:</strong> ${brief.engagement_strategy}</p>
                                <p><strong>Hashtags:</strong> ${brief.hashtags.join(' ')}</p>
                            </div>
                        </div>
                        <button class="copy-tweet-btn" onclick="copyTweet('${brief.content.replace(/'/g, "\\'")}', this)">📋 Copy Tweet</button>
                    </div>
                `;
            });
        } else {
            briefsHTML += `
                <div class="rejection-notice">
                    <p>❌ <strong>Not viable for Twitter:</strong> ${result.rejection_reason}</p>
                </div>
            `;
        }
        
        briefsHTML += `</div>`;
    });
    
    briefsContainer.innerHTML = briefsHTML;
    briefsContainer.style.display = 'block';
    briefsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}