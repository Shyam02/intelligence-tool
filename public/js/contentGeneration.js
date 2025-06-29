// Content Generation Frontend - Handle content generation UI and interactions

// Generate content from Twitter briefs
async function generateContentFromBriefs() {
    // Get all briefs from the current Twitter briefs display
    const briefsData = extractBriefsFromCurrentDisplay();
    
    if (!briefsData || briefsData.length === 0) {
        alert('No content briefs found. Please generate Twitter briefs first.');
        return;
    }
    
    const generateBtn = document.querySelector('.generate-content-btn');
    if (!generateBtn) {
        console.error('Generate content button not found');
        return;
    }
    
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Generating Content...';
    generateBtn.disabled = true;
    
    try {
        console.log('🎨 Starting content generation for', briefsData.length, 'briefs');
        
        // Get business context from app state
        const businessContext = createBusinessContextForGeneration();
        
        const generatedContent = await generateTwitterContentAPI(briefsData, businessContext);
        
        // Display the generated content
        displayGeneratedContent(generatedContent);
        
        // Show the content generation section
        const contentGenerationSection = document.getElementById('contentGenerationSection');
        if (contentGenerationSection) {
            contentGenerationSection.style.display = 'block';
        }
        
        // Scroll to generated content
        contentGenerationSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Content generation completed successfully');
        
    } catch (error) {
        console.error('Content generation failed:', error);
        alert('Content generation failed: ' + error.message);
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// Generate content for a specific brief
async function generateContentForBrief(briefIndex) {
    const briefsData = extractBriefsFromCurrentDisplay();
    
    if (!briefsData || !briefsData[briefIndex]) {
        alert('Brief not found');
        return;
    }
    
    const brief = briefsData[briefIndex];
    const generateBtn = document.querySelector(`#generateBrief${briefIndex}`);
    
    if (!generateBtn) return;
    
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Generating...';
    generateBtn.disabled = true;
    
    try {
        const businessContext = createBusinessContextForGeneration();
        const generatedContent = await generateTwitterContentAPI([brief], businessContext);
        
        // Display content for this specific brief
        displayBriefSpecificContent(briefIndex, generatedContent.generated_content[0]);
        
        console.log('✅ Content generated for brief:', brief.angle);
        
    } catch (error) {
        console.error('Brief-specific content generation failed:', error);
        alert('Content generation failed: ' + error.message);
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// Regenerate specific content piece
async function regenerateContent(contentId, variationRequest = null) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) {
        console.error('Content element not found for regeneration');
        return;
    }
    
    // Get the original brief for this content
    const briefData = contentElement.getAttribute('data-brief-data');
    if (!briefData) {
        console.error('Brief data not found for regeneration');
        return;
    }
    
    const regenerateBtn = contentElement.querySelector('.regenerate-btn');
    if (!regenerateBtn) return;
    
    const originalText = regenerateBtn.textContent;
    regenerateBtn.textContent = '⏳ Regenerating...';
    regenerateBtn.disabled = true;
    
    try {
        const brief = JSON.parse(briefData);
        const businessContext = createBusinessContextForGeneration();
        
        const regeneratedContent = await regenerateContentAPI(brief, businessContext, variationRequest);
        
        // Update the content display
        updateContentDisplay(contentId, regeneratedContent.generated_content);
        
        console.log('✅ Content regenerated successfully');
        
    } catch (error) {
        console.error('Content regeneration failed:', error);
        alert('Content regeneration failed: ' + error.message);
    } finally {
        regenerateBtn.textContent = originalText;
        regenerateBtn.disabled = false;
    }
}

// Extract briefs from current Twitter briefs display
function extractBriefsFromCurrentDisplay() {
    try {
        // Look for existing Twitter briefs in the display
        const briefElements = document.querySelectorAll('.twitter-brief-card');
        const briefs = [];
        
        briefElements.forEach((element, index) => {
            const angleElement = element.querySelector('.brief-angle');
            const contentElement = element.querySelector('.tweet-preview p');
            const typeElement = element.querySelector('.brief-type');
            const metadataElement = element.querySelector('.brief-metadata');
            
            if (angleElement && contentElement) {
                const brief = {
                    brief_id: `brief_${index}`,
                    angle: angleElement.textContent.replace('Angle ' + (index + 1) + ': ', ''),
                    content: contentElement.textContent,
                    content_type: typeElement ? typeElement.textContent : 'single_tweet',
                    engagement_strategy: 'engagement',
                    hashtags: []
                };
                
                // Extract hashtags if available
                if (metadataElement) {
                    const hashtagText = metadataElement.textContent;
                    const hashtagMatch = hashtagText.match(/Hashtags: (.+)/);
                    if (hashtagMatch) {
                        brief.hashtags = hashtagMatch[1].split(' ').filter(tag => tag.startsWith('#'));
                    }
                }
                
                briefs.push(brief);
            }
        });
        
        console.log('📊 Extracted', briefs.length, 'briefs from current display');
        return briefs;
        
    } catch (error) {
        console.error('Failed to extract briefs:', error);
        return [];
    }
}

// Create business context for content generation
function createBusinessContextForGeneration() {
    const userInput = window.appState?.userInput || {};
    const websiteIntelligence = window.appState?.websiteIntelligence || {};
    
    return {
        companyName: websiteIntelligence.company_name || userInput.companyName || 'Unknown',
        businessDescription: userInput.businessDescription || websiteIntelligence.business_description || '',
        valueProposition: websiteIntelligence.value_proposition || '',
        targetCustomer: userInput.targetCustomer || websiteIntelligence.target_customer || '',
        industryCategory: websiteIntelligence.industry_category || '',
        businessStage: websiteIntelligence.business_stage || '',
        launchDate: userInput.launchDate || '',
        targetGeography: userInput.targetGeography || '',
        uniqueSellingPoints: websiteIntelligence.unique_selling_points || []
    };
}

// Display generated content using templates
function displayGeneratedContent(generatedContent) {
    const contentContainer = document.getElementById('generatedContentContainer');
    if (!contentContainer) {
        console.error('Generated content container not found');
        return;
    }
    
    // Use template function to create the display
    const contentHTML = createGeneratedContentTemplate(generatedContent);
    contentContainer.innerHTML = contentHTML;
    
    console.log('✅ Generated content displayed');
}

// Display content for specific brief
function displayBriefSpecificContent(briefIndex, generatedContent) {
    const briefCard = document.querySelector(`.twitter-brief-card:nth-child(${briefIndex + 1})`);
    if (!briefCard) return;
    
    // Create content display for this specific brief
    const contentHTML = createBriefContentTemplate(generatedContent, briefIndex);
    
    // Insert after the brief card
    const contentDiv = document.createElement('div');
    contentDiv.className = 'brief-generated-content';
    contentDiv.innerHTML = contentHTML;
    
    briefCard.parentNode.insertBefore(contentDiv, briefCard.nextSibling);
}

// Update content display after regeneration
function updateContentDisplay(contentId, newContent) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) return;
    
    // Update the content using template
    const updatedHTML = createSingleContentTemplate(newContent, contentId);
    contentElement.outerHTML = updatedHTML;
}

// Copy generated content to clipboard
function copyGeneratedContent(contentId) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) return;
    
    const contentText = contentElement.querySelector('.final-content-text');
    if (!contentText) return;
    
    const textToCopy = contentText.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopySuccess(contentElement.querySelector('.copy-content-btn'));
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(textToCopy, contentElement.querySelector('.copy-content-btn'));
        });
    } else {
        fallbackCopyToClipboard(textToCopy, contentElement.querySelector('.copy-content-btn'));
    }
}

// Copy thread content to clipboard
function copyThreadContent(contentId) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) return;
    
    const threadTweets = contentElement.querySelectorAll('.thread-tweet-text');
    const threadText = Array.from(threadTweets).map(tweet => tweet.textContent).join('\n\n');
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(threadText).then(() => {
            showCopySuccess(contentElement.querySelector('.copy-thread-btn'));
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(threadText, contentElement.querySelector('.copy-thread-btn'));
        });
    } else {
        fallbackCopyToClipboard(threadText, contentElement.querySelector('.copy-thread-btn'));
    }
}

// Mark content as approved
function approveContent(contentId) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) return;
    
    contentElement.classList.add('content-approved');
    contentElement.classList.remove('content-pending');
    
    const statusElement = contentElement.querySelector('.content-status');
    if (statusElement) {
        statusElement.textContent = 'Approved';
        statusElement.className = 'content-status status-approved';
    }
    
    console.log('✅ Content approved:', contentId);
}

// Mark content as rejected
function rejectContent(contentId) {
    const contentElement = document.querySelector(`[data-content-id="${contentId}"]`);
    if (!contentElement) return;
    
    contentElement.classList.add('content-rejected');
    contentElement.classList.remove('content-pending');
    
    const statusElement = contentElement.querySelector('.content-status');
    if (statusElement) {
        statusElement.textContent = 'Rejected';
        statusElement.className = 'content-status status-rejected';
    }
    
    console.log('❌ Content rejected:', contentId);
}

// Global function exports for HTML onclick handlers
window.generateContentFromBriefs = generateContentFromBriefs;
window.generateContentForBrief = generateContentForBrief;
window.regenerateContent = regenerateContent;
window.copyGeneratedContent = copyGeneratedContent;
window.copyThreadContent = copyThreadContent;
window.approveContent = approveContent;
window.rejectContent = rejectContent;