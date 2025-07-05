// Utility functions: Copy, reset, helpers

// Copy to clipboard functionality
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

// Copy individual tweet
function copyTweet(tweetText, button) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(tweetText).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(tweetText, button);
        });
    } else {
        fallbackCopyToClipboard(tweetText, button);
    }
}

// UPDATED: Reset form and application state with sidebar navigation support
function resetForm() {
    // Reset all form data
    const form = document.getElementById('onboardingForm');
    form.reset();
    
    // Reset clean global state structure including Reddit data
    window.appState = {
        userInput: null,
        websiteIntelligence: null,
        foundationalIntelligence: null,
        searchResults: [],
        currentTab: 'setup',                // Reset to setup tab
        tabsCompleted: {                    // Reset completion status
            setup: false,
            ideaSources: false,
            ideaBank: false,
            contentBriefs: false,
            settings: true,                 // Settings is always available
            calendar: false,                // Future features
            performance: false,
            config: true
        },
        // Reset Reddit state
        discoveredSubreddits: [],
        redditQueries: []
    };
    
    // Hide all result containers
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('queriesContainer').style.display = 'none';
    document.getElementById('categorySpecificSection').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    
    // UPDATED: Hide Reddit-specific containers
    const redditQueriesContainer = document.getElementById('redditQueriesContainer');
    if (redditQueriesContainer) {
        redditQueriesContainer.style.display = 'none';
    }
    
    const subredditResults = document.getElementById('subredditResults');
    if (subredditResults) {
        subredditResults.style.display = 'none';
    }
    
    const redditSearchResults = document.getElementById('redditSearchResults');
    if (redditSearchResults) {
        redditSearchResults.style.display = 'none';
    }
    
    // Hide website intelligence section if it exists
    const websiteSection = document.getElementById('websiteIntelligenceSection');
    if (websiteSection) {
        websiteSection.style.display = 'none';
    }
    
    // Hide content briefs if they exist
    const contentBriefs = document.getElementById('contentBriefs');
    if (contentBriefs) {
        contentBriefs.style.display = 'none';
        contentBriefs.innerHTML = ''; // Clear content
    }
    
    // Show form container
    document.querySelector('.form-container').style.display = 'block';
    
    // UPDATED: Reset sidebar navigation to setup tab
    switchTab('setup');
    updateTabAvailability();
    updateEmptyStates();
    
    // Reset header content
    updateHeaderContent('setup');
    
    // Scroll to top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    console.log('✅ Application state reset with clean data structure, sidebar navigation, and Reddit support');
}

// Debug Section Functions
function toggleDebugSection(sectionId) {
    const section = document.getElementById(sectionId);
    const header = section.previousElementSibling;
    const toggle = header.querySelector('.debug-toggle');
    
    if (section.style.display === 'none') {
        section.style.display = 'block';
        toggle.textContent = '▼';
        toggle.style.transform = 'rotate(0deg)';
    } else {
        section.style.display = 'none';
        toggle.textContent = '▶';
        toggle.style.transform = 'rotate(-90deg)';
    }
}

function refreshFormDebug() {
    const formData = collectFormDebugData();
    const output = document.getElementById('formDebugOutput');
    output.textContent = JSON.stringify(formData, null, 2);
}

function clearFormDebug() {
    const output = document.getElementById('formDebugOutput');
    output.textContent = 'No form data available';
}

function collectFormDebugData() {
    const form = document.getElementById('onboardingForm');
    if (!form) {
        return { error: 'Form not found' };
    }
    
    // Collect form data
    const formData = new FormData(form);
    const formObject = {};
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }
    
    // Collect app state
    const appState = window.appState || {};
    
    // Calculate category logic
    const launchDate = formObject.launchDate;
    const websiteUrl = formObject.websiteUrl;
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl && websiteUrl.trim() !== '';
    
    let calculatedCategory = '';
    if (isPreLaunch && !hasWebsite) {
        calculatedCategory = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        calculatedCategory = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        calculatedCategory = 'Post-launch + No website';
    } else {
        calculatedCategory = 'Post-launch + Has website';
    }
    
    return {
        timestamp: new Date().toISOString(),
        formData: formObject,
        calculatedCategory: calculatedCategory,
        categoryLogic: {
            launchDate,
            websiteUrl,
            today,
            isPreLaunch,
            hasWebsite
        },
        appState: {
            userInput: appState.userInput,
            currentTab: appState.currentTab,
            tabsCompleted: appState.tabsCompleted
        },
        formValidation: {
            isValid: form.checkValidity(),
            validationMessage: form.validationMessage || 'Form is valid'
        }
    };
}

// Website Crawl Debug Functions
function refreshWebsiteCrawlDebug() {
    const crawlData = collectWebsiteCrawlDebugData();
    const output = document.getElementById('websiteCrawlDebugOutput');
    
    if (crawlData.message) {
        output.textContent = crawlData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Basic info
    html += `<h4>🌐 Website Crawl Debug - Complete Details</h4>`;
    html += `<p><strong>URL:</strong> ${crawlData.websiteUrl}</p>`;
    html += `<p><strong>Crawl Started:</strong> ${crawlData.crawlTimestamp}</p>`;
    html += `<p><strong>Debug Generated:</strong> ${crawlData.timestamp}</p>`;
    
    // Steps
    if (crawlData.steps && crawlData.steps.length > 0) {
        html += '<h5>📋 Crawling Steps:</h5>';
        html += '<div class="debug-steps-detailed">';
        crawlData.steps.forEach((step, index) => {
            html += `<div class="debug-step-detailed">
                <strong>${index + 1}. ${step.step}</strong>
                <span class="timestamp">${step.timestamp}</span>
                ${step.extractedData ? `<pre class="step-data">${JSON.stringify(step.extractedData, null, 2)}</pre>` : ''}
            </div>`;
        });
        html += '</div>';
    }
    
    // Homepage Analysis - Link Extraction and Filtering
    if (crawlData.homepageAnalysis) {
        html += '<h5>🏠 Homepage Analysis & Link Extraction:</h5>';
        html += '<div class="debug-homepage-detailed">';
        html += `<p><strong>Step:</strong> ${crawlData.homepageAnalysis.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.homepageAnalysis.timestamp}</p>`;
        
        // Display the logic details first
        if (crawlData.homepageAnalysis.logic) {
            html += '<h6>🔧 Processing Logic:</h6>';
            
            // Text Cleaning Logic
            if (crawlData.homepageAnalysis.logic.textCleaning) {
                html += '<details><summary>📝 Text Cleaning Logic</summary>';
                html += `<p><strong>Description:</strong> ${crawlData.homepageAnalysis.logic.textCleaning.description}</p>`;
                html += `<p><strong>Source:</strong> <code>${crawlData.homepageAnalysis.logic.textCleaning.sourceFile}</code> - <code>${crawlData.homepageAnalysis.logic.textCleaning.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                crawlData.homepageAnalysis.logic.textCleaning.steps.forEach(step => {
                    html += `<li>${step}</li>`;
                });
                html += '</ul>';
                html += `<p><strong>Results:</strong> Original: ${crawlData.homepageAnalysis.logic.textCleaning.originalLength} chars → Clean: ${crawlData.homepageAnalysis.logic.textCleaning.cleanLength} chars (${crawlData.homepageAnalysis.logic.textCleaning.compressionRatio} compression)</p>`;
                html += '</details>';
            }
            
            // Link Extraction Logic
            if (crawlData.homepageAnalysis.logic.linkExtraction) {
                html += '<details><summary>🔗 Link Extraction Logic</summary>';
                html += `<p><strong>Description:</strong> ${crawlData.homepageAnalysis.logic.linkExtraction.description}</p>`;
                html += `<p><strong>Source:</strong> <code>${crawlData.homepageAnalysis.logic.linkExtraction.sourceFile}</code> - <code>${crawlData.homepageAnalysis.logic.linkExtraction.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                crawlData.homepageAnalysis.logic.linkExtraction.steps.forEach(step => {
                    html += `<li>${step}</li>`;
                });
                html += '</ul>';
                html += `<p><strong>Results:</strong> Total: ${crawlData.homepageAnalysis.logic.linkExtraction.totalLinksFound}, Unique: ${crawlData.homepageAnalysis.logic.linkExtraction.uniqueLinks}, External: ${crawlData.homepageAnalysis.logic.linkExtraction.externalDomains}, Internal: ${crawlData.homepageAnalysis.logic.linkExtraction.internalPages}</p>`;
                html += '</details>';
            }
            
            // Link Filtering Logic
            if (crawlData.homepageAnalysis.logic.linkFiltering) {
                html += '<details><summary>🎯 Link Filtering Logic</summary>';
                html += `<p><strong>Description:</strong> ${crawlData.homepageAnalysis.logic.linkFiltering.description}</p>`;
                html += `<p><strong>Source:</strong> <code>${crawlData.homepageAnalysis.logic.linkFiltering.sourceFile}</code> - <code>${crawlData.homepageAnalysis.logic.linkFiltering.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                crawlData.homepageAnalysis.logic.linkFiltering.steps.forEach(step => {
                    html += `<li>${step}</li>`;
                });
                html += '</ul>';
                html += `<p><strong>Result:</strong> ${crawlData.homepageAnalysis.logic.linkFiltering.linksPassedToAI} links passed to AI (${crawlData.homepageAnalysis.logic.linkFiltering.filteringLogic})</p>`;
                html += '</details>';
            }
        }
        
        if (crawlData.homepageAnalysis.rawData) {
            html += '<h6>Raw Data:</h6>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.homepageAnalysis.rawData, null, 2)}</pre>`;
        }
        
        if (crawlData.homepageAnalysis.processedData) {
            html += '<h6>Link Extraction Results:</h6>';
            html += `<p><strong>All Links Found:</strong> ${crawlData.homepageAnalysis.processedData.allLinks?.length || 0}</p>`;
            html += `<p><strong>Relevant Links (Passed to AI):</strong> ${crawlData.homepageAnalysis.processedData.relevantLinks?.length || 0}</p>`;
            
            if (crawlData.homepageAnalysis.processedData.allLinks && crawlData.homepageAnalysis.processedData.allLinks.length > 0) {
                html += '<details><summary>View All Extracted Links</summary>';
                html += '<div class="debug-links-list">';
                crawlData.homepageAnalysis.processedData.allLinks.forEach((link, index) => {
                    html += `<div class="debug-link-item">
                        <strong>${index + 1}.</strong> "${link.text}" → ${link.url} 
                        <span class="link-type">[${link.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span>
                    </div>`;
                });
                html += '</div></details>';
            }
            
            if (crawlData.homepageAnalysis.processedData.relevantLinks && crawlData.homepageAnalysis.processedData.relevantLinks.length > 0) {
                html += '<details><summary>View Links Passed to AI (Filtering Logic: NO FILTERING - All links passed)</summary>';
                html += '<div class="debug-links-list">';
                crawlData.homepageAnalysis.processedData.relevantLinks.forEach((link, index) => {
                    html += `<div class="debug-link-item">
                        <strong>${index + 1}.</strong> "${link.text}" → ${link.url} 
                        <span class="link-type">[${link.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span>
                    </div>`;
                });
                html += '</div></details>';
            }
        }
        
        if (crawlData.homepageAnalysis.processedData.cleanText) {
            html += '<details><summary>View Full Homepage Content</summary>';
            html += `<pre class="debug-content">${formatContentForDisplay(crawlData.homepageAnalysis.processedData.cleanText)}</pre>`;
            html += '</details>';
        }
        html += '</div>';
    }
    
    // Link Selection - AI Decision Making (Note: Details shown in AI Interactions section below)
    if (crawlData.linkSelection) {
        html += '<h5>🔗 AI Link Selection:</h5>';
        html += '<div class="debug-link-selection-detailed">';
        html += `<p><strong>Step:</strong> ${crawlData.linkSelection.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.linkSelection.timestamp}</p>`;
        html += `<p><strong>Relevant Links Count:</strong> ${crawlData.linkSelection.relevantLinksCount}</p>`;
        html += `<p><strong>Company Name:</strong> ${crawlData.linkSelection.companyName}</p>`;
        html += `<p><em>Note: Full prompt, response, and parsed data are shown in the "AI Interactions" section below</em></p>`;
        html += '</div>';
    }
    
    // Page Crawling
    if (crawlData.pageCrawling) {
        html += '<h5>📄 Page Crawling:</h5>';
        html += '<div class="debug-page-crawling-detailed">';
        html += `<p><strong>Step:</strong> ${crawlData.pageCrawling.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.pageCrawling.timestamp}</p>`;
        
        // Display the crawling logic
        if (crawlData.pageCrawling.logic) {
            html += '<h6>🔧 Post-AI Crawling Logic:</h6>';
            html += '<details><summary>📄 Crawling Process Details</summary>';
            html += `<p><strong>Description:</strong> ${crawlData.pageCrawling.logic.description}</p>`;
            html += `<p><strong>Source:</strong> <code>${crawlData.pageCrawling.logic.sourceFile}</code> - <code>${crawlData.pageCrawling.logic.functionName}</code></p>`;
            html += '<p><strong>Steps:</strong></p><ul>';
            crawlData.pageCrawling.logic.steps.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += `<p><strong>Method:</strong> ${crawlData.pageCrawling.logic.crawlingMethod}</p>`;
            html += `<p><strong>Error Handling:</strong> ${crawlData.pageCrawling.logic.errorHandling}</p>`;
            html += `<p><strong>Content Processing:</strong> ${crawlData.pageCrawling.logic.contentProcessing}</p>`;
            html += '</details>';
        }
        
        if (crawlData.pageCrawling.selectedLinks) {
            html += '<h6>Selected Links to Crawl:</h6>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.pageCrawling.selectedLinks, null, 2)}</pre>`;
        }
        
        if (crawlData.pageCrawling.crawledPages && crawlData.pageCrawling.crawledPages.length > 0) {
            html += '<h6>Crawled Pages:</h6>';
            crawlData.pageCrawling.crawledPages.forEach((page, index) => {
                html += `<div class="debug-page-detailed">
                    <h7>Page ${index + 1}: ${page.title}</h7>
                    <p><strong>URL:</strong> ${page.url}</p>
                    <p><strong>Original HTML Length:</strong> ${page.originalHtmlLength}</p>
                    <p><strong>Clean Text Length:</strong> ${page.cleanTextLength}</p>
                    <p><strong>External:</strong> ${page.isExternal ? 'Yes' : 'No'}</p>
                    <p><strong>Domain:</strong> ${page.domain}</p>
                    <p><strong>Success:</strong> ${page.success ? 'Yes' : 'No'}</p>
                    ${page.error ? `<p><strong>Error:</strong> ${page.errorMessage}</p>` : ''}
                    ${page.content ? `<details><summary>View Content</summary><pre class="debug-content">${formatContentForDisplay(page.content)}</pre></details>` : ''}
                </div>`;
            });
        }
        html += '</div>';
    }
    
    // Raw Data
    if (crawlData.rawData) {
        html += '<h5>📊 Raw Crawling Data:</h5>';
        html += '<div class="debug-raw-data-detailed">';
        
        if (crawlData.rawData.homepageContent) {
            html += '<h6>Homepage Content:</h6>';
            html += `<p><strong>Length:</strong> ${crawlData.rawData.homepageContent.length} characters</p>`;
            html += `<p><em>Note: Full homepage content is already shown in the "Homepage Analysis & Link Extraction" section above</em></p>`;
        }
        
        if (crawlData.rawData.additionalPages && crawlData.rawData.additionalPages.length > 0) {
            html += '<h6>Additional Pages:</h6>';
            html += `<p><em>Note: Full page content is shown in the "Page Crawling" section above. Here we show metadata only.</em></p>`;
            crawlData.rawData.additionalPages.forEach((page, index) => {
                html += `<div class="debug-page-raw-detailed">
                    <h7>Page ${index + 1}: ${page.title}</h7>
                    <p><strong>URL:</strong> ${page.url}</p>
                    <p><strong>Content Length:</strong> ${page.contentLength} characters</p>
                    <p><strong>External:</strong> ${page.isExternal ? 'Yes' : 'No'}</p>
                    <p><strong>Domain:</strong> ${page.domain}</p>
                    ${page.error ? `<p><strong>Error:</strong> ${page.error}</p>` : ''}
                    ${page.reasoning ? `<p><strong>Reasoning:</strong> ${page.reasoning}</p>` : ''}
                </div>`;
            });
        }
        
        html += `<p><strong>Analysis Method:</strong> ${crawlData.rawData.analysisMethod}</p>`;
        html += '</div>';
    }
    
    // AI Interactions - Show all AI calls (link selection + final analysis)
    if (crawlData.aiInteractions && crawlData.aiInteractions.length > 0) {
        html += '<h5>🤖 AI Interactions:</h5>';
        html += '<div class="debug-ai-interactions-detailed">';
        crawlData.aiInteractions.forEach((interaction, index) => {
            html += `<div class="debug-ai-interaction-detailed">
                <h6>${index + 1}. ${interaction.step}</h6>
                <p><strong>Timestamp:</strong> ${interaction.timestamp}</p>`;
            
            // Add prompt source information if available
            if (interaction.promptSource) {
                html += `<p><strong>Prompt Source:</strong> <code>${interaction.promptSource.sourceFile}</code> - <code>${interaction.promptSource.functionName}</code></p>`;
                html += `<p><strong>Description:</strong> ${interaction.promptSource.description}</p>`;
            }
            
            // Add logic information if available (for final analysis)
            if (interaction.logic) {
                html += '<details><summary>🔧 Processing Logic</summary>';
                html += `<p><strong>Description:</strong> ${interaction.logic.description}</p>`;
                html += `<p><strong>Source:</strong> <code>${interaction.logic.sourceFile}</code> - <code>${interaction.logic.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                interaction.logic.steps.forEach(step => {
                    html += `<li>${step}</li>`;
                });
                html += '</ul>';
                
                // Add data usage information for final analysis
                if (interaction.logic.dataUsage) {
                    html += '<h6>📊 Data Usage in Business Profile:</h6>';
                    html += '<div class="data-usage-sections">';
                    
                    if (interaction.logic.dataUsage.businessSetupSection) {
                        html += '<div class="usage-section">';
                        html += '<h7>🏢 Business Setup Section:</h7>';
                        html += '<ul>';
                        interaction.logic.dataUsage.businessSetupSection.forEach(field => {
                            html += `<li>${field}</li>`;
                        });
                        html += '</ul>';
                        html += '</div>';
                    }
                    
                    if (interaction.logic.dataUsage.strategicIntelligenceSection) {
                        html += '<div class="usage-section">';
                        html += '<h7>🎯 Strategic Intelligence Section:</h7>';
                        html += '<ul>';
                        interaction.logic.dataUsage.strategicIntelligenceSection.forEach(field => {
                            html += `<li>${field}</li>`;
                        });
                        html += '</ul>';
                        html += '</div>';
                    }
                    
                    html += '</div>';
                }
                
                html += '</details>';
            }
            
            if (interaction.fullPrompt) {
                html += `<details><summary>View Full Prompt</summary><pre class="debug-prompt">${formatContentForDisplay(interaction.fullPrompt)}</pre></details>`;
            }
            
            if (interaction.fullResponse) {
                html += `<details><summary>View Full Response</summary><pre class="debug-response">${formatContentForDisplay(interaction.fullResponse)}</pre></details>`;
            }
            
            if (interaction.parsedData) {
                html += `<details><summary>View Parsed Data</summary><pre class="debug-data">${JSON.stringify(interaction.parsedData, null, 2)}</pre></details>`;
            }
            
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Final Result
    if (crawlData.finalResult) {
        html += '<h5>🎯 Final Result:</h5>';
        html += '<div class="debug-final-result-detailed">';
        html += `<pre class="debug-final-result">${JSON.stringify(crawlData.finalResult, null, 2)}</pre>`;
        
        // Add clear usage information
        html += '<div class="final-result-usage">';
        html += '<h6>🚀 How This Data is Used:</h6>';
        html += '<div class="usage-highlight">';
        html += '<p><strong>This final result is automatically populated into the Business Profile form in two main sections:</strong></p>';
        
        html += '<div class="usage-sections">';
        html += '<div class="usage-section-primary">';
        html += '<h7>🏢 Business Setup Section (Auto-filled):</h7>';
        html += '<ul>';
        html += '<li><strong>Company Name:</strong> Extracted from website analysis</li>';
        html += '<li><strong>Business Description:</strong> AI-generated comprehensive description</li>';
        html += '<li><strong>Value Proposition:</strong> Key value points identified</li>';
        html += '<li><strong>Main Product/Service:</strong> Primary offerings extracted</li>';
        html += '<li><strong>Pricing Information:</strong> Pricing details found on website</li>';
        html += '<li><strong>Business Stage:</strong> Company maturity level assessed</li>';
        html += '<li><strong>Industry Category:</strong> Business sector classification</li>';
        html += '<li><strong>Team Size:</strong> Company size information</li>';
        html += '<li><strong>Funding Information:</strong> Investment/funding details</li>';
        html += '<li><strong>Company Mission:</strong> Mission statement extracted</li>';
        html += '<li><strong>Team Background:</strong> Team information found</li>';
        html += '</ul>';
        html += '</div>';
        
        html += '<div class="usage-section-primary">';
        html += '<h7>🎯 Strategic Intelligence Section (Auto-filled):</h7>';
        html += '<ul>';
        html += '<li><strong>Target Customer:</strong> Customer segments identified</li>';
        html += '<li><strong>Key Features:</strong> Main product features extracted</li>';
        html += '<li><strong>Unique Selling Points:</strong> Competitive advantages found</li>';
        html += '<li><strong>Competitors Mentioned:</strong> Competitor references</li>';
        html += '<li><strong>Recent Updates:</strong> Latest company news/changes</li>';
        html += '<li><strong>Social Media Presence:</strong> Social media links found</li>';
        html += '<li><strong>Additional Notes:</strong> Other relevant insights</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="usage-note">';
        html += '<p><strong>💡 Note:</strong> All fields are automatically populated when you submit the Business Profile form. You can review and edit any field before final submission.</p>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    
    // Summary
    if (crawlData.summary) {
        html += '<h5>📈 Summary:</h5>';
        html += `<pre class="debug-summary">${JSON.stringify(crawlData.summary, null, 2)}</pre>`;
    }
    
    html += '</div>';
    output.innerHTML = html;
}

// Function to format content with proper line breaks
function formatContentForDisplay(content) {
    if (!content) return '';
    
    // Convert to string if it's not already
    let text = String(content);
    
    // Replace common HTML entities that might be in the content
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    // Handle different types of content
    if (text.includes('JSON') || text.includes('{') || text.includes('[')) {
        // For JSON-like content, try to format it properly
        try {
            const parsed = JSON.parse(text);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            // If it's not valid JSON, continue with normal formatting
        }
    }
    
    // Add line breaks for better readability
    // Split on common sentence endings and add line breaks
    text = text.replace(/([.!?])\s+/g, '$1\n\n');
    
    // Split on common paragraph markers and section headers
    text = text.replace(/(\n\s*\n)/g, '\n\n');
    text = text.replace(/([A-Z][A-Z\s]+:)/g, '\n\n$1');
    
    // Handle lists and bullet points
    text = text.replace(/(\d+\.\s)/g, '\n$1');
    text = text.replace(/([•\-\*]\s)/g, '\n$1');
    
    // Clean up excessive whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();
    
    return text;
}

function clearWebsiteCrawlDebug() {
    const output = document.getElementById('websiteCrawlDebugOutput');
    output.textContent = 'No website crawl data available';
}

function collectWebsiteCrawlDebugData() {
    const appState = window.appState || {};
    const debugData = window.crawlDebugData || null;
    
    if (!debugData) {
        return {
            timestamp: new Date().toISOString(),
            message: 'No website crawl debug data available'
        };
    }
    
    return {
        timestamp: new Date().toISOString(),
        websiteUrl: debugData.websiteUrl,
        crawlTimestamp: debugData.timestamp,
        
        // Complete raw crawling data
        rawData: {
            homepageContent: debugData.rawData?.homepageContent ? {
                length: debugData.rawData.homepageContent.length,
                fullContent: debugData.rawData.homepageContent
            } : null,
            additionalPages: debugData.rawData?.additionalPages?.map(page => ({
                url: page.url,
                title: page.title,
                contentLength: page.contentLength || 0,
                isExternal: page.isExternal,
                domain: page.domain,
                error: page.error,
                fullContent: page.content || null,
                reasoning: page.reasoning
            })) || [],
            analysisMethod: debugData.rawData?.analysisMethod
        },
        
        // Complete crawling steps
        steps: debugData.steps || [],
        
        // Complete AI interactions with full prompts and responses
        aiInteractions: debugData.aiInteractions?.map(interaction => ({
            step: interaction.step,
            timestamp: interaction.timestamp,
            fullPrompt: interaction.prompt || null,
            fullResponse: interaction.response || null,
            parsedData: interaction.parsedData || null,
            promptSource: interaction.promptSource || null,
            logic: interaction.logic || null
        })) || [],
        
        // Homepage analysis details (including logic)
        homepageAnalysis: debugData.homepageAnalysis ? {
            ...debugData.homepageAnalysis,
            logic: debugData.homepageAnalysis.logic || null
        } : null,
        
        // Link selection details
        linkSelection: debugData.linkSelection || null,
        
        // Page crawling details (including logic)
        pageCrawling: debugData.pageCrawling ? {
            ...debugData.pageCrawling,
            logic: debugData.pageCrawling.logic || null
        } : null,
        
        // Final result
        finalResult: debugData.finalResult || null,
        
        // Summary
        summary: {
            totalSteps: debugData.steps?.length || 0,
            homepageContentLength: debugData.rawData?.homepageContent?.length || 0,
            additionalPagesCount: debugData.rawData?.additionalPages?.length || 0,
            successfulPages: debugData.rawData?.additionalPages?.filter(p => !p.error)?.length || 0,
            failedPages: debugData.rawData?.additionalPages?.filter(p => p.error)?.length || 0,
            externalPages: debugData.rawData?.additionalPages?.filter(p => p.isExternal && !p.error)?.length || 0,
            aiInteractionsCount: debugData.aiInteractions?.length || 0,
            analysisMethod: debugData.rawData?.analysisMethod || 'unknown'
        }
    };
}

// Global variable to store crawl debug data
window.crawlDebugData = null;

// Function to update crawl debug data (called from backend)
function updateCrawlDebugData(data) {
    window.crawlDebugData = data;
    // Auto-refresh the debug display if it's open
    const debugSection = document.getElementById('websiteCrawlDebug');
    if (debugSection && debugSection.style.display !== 'none') {
        refreshWebsiteCrawlDebug();
    }
}