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
        
        // Auto-refresh specific debug sections when opened
        if (sectionId === 'competitorIntelligenceDebug') {
            refreshCompetitorIntelligenceDebug();
        } else if (sectionId === 'contentStrategyDebug') {
            refreshContentStrategyDebug();
        }
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

// Website Crawl Debug Functions - DETAILED DEBUGGING VERSION
function refreshWebsiteCrawlDebug() {
    const crawlData = collectWebsiteCrawlDebugData();
    const output = document.getElementById('websiteCrawlDebugOutput');
    
    if (crawlData.message) {
        output.textContent = crawlData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Header with basic info
    html += `<h4>🌐 Website Crawl Debug - Complete Detailed Logs</h4>`;
    html += `<p><strong>URL:</strong> ${crawlData.websiteUrl}</p>`;
    html += `<p><strong>Started:</strong> ${crawlData.crawlTimestamp}</p>`;
    html += `<p><strong>Debug Generated:</strong> ${crawlData.timestamp}</p>`;
    
    // =================================================================
    // PHASE 1: SETUP & INITIALIZATION
    // =================================================================
    html += '<div class="debug-steps-detailed">';
    html += '<h5>🚀 PHASE 1: Setup & Initialization</h5>';
    html += '<div class="debug-step-detailed">';
    html += `<p><strong>Type:</strong> ❌ No AI Interaction</p>`;
    
    const setupStep = crawlData.steps?.find(s => s.step === 'crawl_started');
    if (setupStep) {
        html += `<p><strong>Timestamp:</strong> ${setupStep.timestamp}</p>`;
        html += `<p><strong>Source:</strong> <code>services/websiteCrawler.js</code> → <code>crawlWebsite()</code></p>`;
    }
    
    html += '<div class="debug-logic">';
    html += '<p><strong>Setup Operations:</strong></p>';
    html += '<ul>';
    html += '<li><code>cleanupDesignAssets(companyIdentifier)</code> - Clean old assets</li>';
    html += '<li><code>global.designAssetsCache[urlCacheKey] = null</code> - Reset cache</li>';
    html += '<li><code>debugData = { timestamp, websiteUrl, steps: [], ... }</code> - Initialize debug collection</li>';
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    // =================================================================
    // PHASE 2: HOMEPAGE ANALYSIS & LINK EXTRACTION
    // =================================================================
    if (crawlData.homepageAnalysis) {
        html += '<div class="debug-homepage-detailed">';
        html += '<h5>📄 PHASE 2: Homepage Analysis & Link Extraction</h5>';
        html += '<div class="debug-step-detailed">';
        html += `<p><strong>Type:</strong> ❌ No AI Interaction</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.homepageAnalysis.timestamp}</p>`;
        html += `<p><strong>Source:</strong> <code>services/websiteCrawler.js</code> → <code>fetchMultiplePages()</code></p>`;
        
        // Step 2.1: Fetch Homepage HTML
        html += '<div class="debug-logic">';
        html += '<h6>Step 2.1: Fetch Homepage HTML</h6>';
        html += `<p><strong>Function:</strong> <code>fetchWebsiteHTML(websiteUrl)</code></p>`;
        html += `<p><strong>Input:</strong> ${crawlData.websiteUrl}</p>`;
        html += `<p><strong>Output:</strong> ${crawlData.homepageAnalysis.rawData?.originalHtmlLength || 'N/A'} characters raw HTML</p>`;
        html += '</div>';
        
        // Step 2.2: Extract Clean Text
        if (crawlData.homepageAnalysis.logic?.textCleaning) {
            html += '<div class="debug-logic">';
            html += '<h6>Step 2.2: Extract Clean Text</h6>';
            html += `<p><strong>Function:</strong> <code>${crawlData.homepageAnalysis.logic.textCleaning.sourceFile}</code> → <code>${crawlData.homepageAnalysis.logic.textCleaning.functionName}</code></p>`;
            html += `<p><strong>Input:</strong> Raw HTML (${crawlData.homepageAnalysis.logic.textCleaning.originalLength} chars)</p>`;
            html += `<p><strong>Output:</strong> Clean text (${crawlData.homepageAnalysis.logic.textCleaning.cleanLength} chars)</p>`;
            html += `<p><strong>Compression Ratio:</strong> ${crawlData.homepageAnalysis.logic.textCleaning.compressionRatio}</p>`;
            
            html += '<details><summary>🔧 Text Cleaning Steps</summary>';
            html += '<ul>';
            crawlData.homepageAnalysis.logic.textCleaning.steps?.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += '</details>';
            
            // Show processed clean text
            if (crawlData.homepageAnalysis.processedData?.cleanText) {
                html += '<details><summary>📄 View Cleaned Text Output (' + crawlData.homepageAnalysis.logic.textCleaning.cleanLength + ' chars)</summary>';
                html += `<pre class="debug-content">${formatContentForDisplay(crawlData.homepageAnalysis.processedData.cleanText.substring(0, 5000))}${crawlData.homepageAnalysis.processedData.cleanText.length > 5000 ? '\n\n... (truncated for display, full content available in data)' : ''}</pre>`;
                html += '</details>';
            }
            html += '</div>';
        }
        
        // Step 2.3: Extract All Links
        if (crawlData.homepageAnalysis.logic?.linkExtraction) {
            html += '<div class="debug-logic">';
            html += '<h6>Step 2.3: Extract All Links</h6>';
            html += `<p><strong>Function:</strong> <code>${crawlData.homepageAnalysis.logic.linkExtraction.sourceFile}</code> → <code>${crawlData.homepageAnalysis.logic.linkExtraction.functionName}</code></p>`;
            html += `<p><strong>Input:</strong> Raw HTML</p>`;
            html += `<p><strong>Output:</strong> ${crawlData.homepageAnalysis.logic.linkExtraction.totalLinksFound} total links</p>`;
            html += `<p><strong>Breakdown:</strong> ${crawlData.homepageAnalysis.logic.linkExtraction.externalDomains} external, ${crawlData.homepageAnalysis.logic.linkExtraction.internalPages} internal</p>`;
            
            html += '<details><summary>🔧 Link Extraction Steps</summary>';
            html += '<ul>';
            crawlData.homepageAnalysis.logic.linkExtraction.steps?.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += '</details>';
            
            // Show all extracted links
            if (crawlData.homepageAnalysis.processedData?.allLinks?.length > 0) {
                html += '<details><summary>🔗 View All Extracted Links (' + crawlData.homepageAnalysis.processedData.allLinks.length + ' links)</summary>';
                html += '<div class="debug-links-list">';
                crawlData.homepageAnalysis.processedData.allLinks.forEach((link, index) => {
                    html += `<div class="debug-link-item">
                        <strong>${index + 1}.</strong> "${link.text}" 
                        <br><strong>URL:</strong> ${link.url}
                        <br><strong>Type:</strong> ${link.type} <span class="link-type">[${link.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span>
                        <br><strong>Domain:</strong> ${link.domain}
                    </div>`;
                });
                html += '</div></details>';
            }
            html += '</div>';
        }
        
        // Step 2.4: Filter Relevant Links
        if (crawlData.homepageAnalysis.logic?.linkFiltering) {
            html += '<div class="debug-logic">';
            html += '<h6>Step 2.4: Filter Relevant Links</h6>';
            html += `<p><strong>Function:</strong> <code>${crawlData.homepageAnalysis.logic.linkFiltering.sourceFile}</code> → <code>${crawlData.homepageAnalysis.logic.linkFiltering.functionName}</code></p>`;
            html += `<p><strong>Input:</strong> ${crawlData.homepageAnalysis.logic.linkExtraction?.totalLinksFound} total links</p>`;
            html += `<p><strong>Output:</strong> ${crawlData.homepageAnalysis.logic.linkFiltering.linksPassedToAI} links passed to AI</p>`;
            html += `<p><strong>Filtering Logic:</strong> ${crawlData.homepageAnalysis.logic.linkFiltering.filteringLogic}</p>`;
            
            html += '<details><summary>🔧 Link Filtering Steps</summary>';
            html += '<ul>';
            crawlData.homepageAnalysis.logic.linkFiltering.steps?.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += '</details>';
            
            // Show links passed to AI
            if (crawlData.homepageAnalysis.processedData?.relevantLinks?.length > 0) {
                html += '<details><summary>🎯 View Links Passed to AI (' + crawlData.homepageAnalysis.processedData.relevantLinks.length + ' links)</summary>';
                html += '<div class="debug-links-list">';
                crawlData.homepageAnalysis.processedData.relevantLinks.forEach((link, index) => {
                    html += `<div class="debug-link-item">
                        <strong>${index + 1}.</strong> "${link.text}"
                        <br><strong>URL:</strong> ${link.url}
                        <br><strong>Type:</strong> ${link.type} <span class="link-type">[${link.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span>
                        <br><strong>Domain:</strong> ${link.domain}
                    </div>`;
                });
                html += '</div></details>';
            }
            html += '</div>';
        }
        
        // Show raw data
        if (crawlData.homepageAnalysis.rawData) {
            html += '<details><summary>📊 View Raw Homepage Analysis Data</summary>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.homepageAnalysis.rawData, null, 2)}</pre>`;
            html += '</details>';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // PHASE 3: AI LINK SELECTION (FIRST AI INTERACTION)
    // =================================================================
    const linkSelectionAI = crawlData.aiInteractions?.find(ai => ai.step === 'ai_link_selection');
    if (linkSelectionAI || crawlData.linkSelection) {
        html += '<div class="debug-ai-interactions-detailed">';
        html += '<h5>🤖 PHASE 3: AI Link Selection (FIRST AI INTERACTION)</h5>';
        html += '<div class="debug-ai-interaction-detailed">';
        html += `<p><strong>Type:</strong> ✅ AI Interaction</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.linkSelection?.timestamp || linkSelectionAI?.timestamp}</p>`;
        html += `<p><strong>Source:</strong> <code>services/websiteCrawler.js</code> → <code>fetchMultiplePages()</code></p>`;
        
        // AI Call Details
        html += '<div class="debug-logic">';
        html += '<h6>AI Call Configuration</h6>';
        html += `<p><strong>Prompt File:</strong> <code>prompts/intelligence/linkSelection.js</code> → <code>linkSelectionPrompt()</code></p>`;
        html += `<p><strong>API Function:</strong> <code>services/ai.js</code> → <code>callClaudeAPI(linkSelectionPrompt, false)</code></p>`;
        html += `<p><strong>Model:</strong> Claude (via Anthropic API)</p>`;
        html += '</div>';
        
        // Input Data
        html += '<div class="debug-logic">';
        html += '<h6>Input Data to AI</h6>';
        html += `<p><strong>Total Links Available:</strong> ${crawlData.linkSelection?.inputData?.totalLinksAvailable || 0}</p>`;
        html += `<p><strong>Company Name:</strong> ${crawlData.linkSelection?.companyName || 'Extracted from URL'}</p>`;
        html += `<p><strong>Base URL:</strong> ${crawlData.websiteUrl}</p>`;
        
        if (crawlData.linkSelection?.inputData?.linksToAnalyze) {
            html += '<details><summary>📋 View Complete Input Links Data</summary>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.linkSelection.inputData.linksToAnalyze, null, 2)}</pre>`;
            html += '</details>';
        }
        html += '</div>';
        
        // Full AI Prompt
        if (linkSelectionAI?.fullPrompt) {
            html += '<div class="debug-logic">';
            html += '<h6>Complete AI Prompt Sent</h6>';
            html += `<details><summary>📝 View Full AI Prompt (${linkSelectionAI.fullPrompt.length} characters)</summary>`;
            html += `<pre class="debug-prompt">${formatContentForDisplay(linkSelectionAI.fullPrompt)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        // Full AI Response
        if (linkSelectionAI?.fullResponse) {
            html += '<div class="debug-logic">';
            html += '<h6>Complete AI Response Received</h6>';
            html += `<details><summary>🤖 View Full AI Response (${linkSelectionAI.fullResponse.length} characters)</summary>`;
            html += `<pre class="debug-response">${formatContentForDisplay(linkSelectionAI.fullResponse)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        // Parsed Output
        if (crawlData.linkSelection?.outputData || linkSelectionAI?.parsedData) {
            const outputData = crawlData.linkSelection?.outputData || linkSelectionAI?.parsedData;
            html += '<div class="debug-logic">';
            html += '<h6>Parsed AI Output</h6>';
            html += `<p><strong>Links Selected:</strong> ${outputData.totalSelected || outputData.total_selected || 0}</p>`;
            html += `<p><strong>Selection Strategy:</strong> ${outputData.selectionStrategy || outputData.selection_strategy || 'Not specified'}</p>`;
            
            html += '<details><summary>📊 View Complete Parsed Output</summary>';
            html += `<pre class="debug-data">${JSON.stringify(outputData, null, 2)}</pre>`;
            html += '</details>';
            
            // Show selected links in detail
            const selectedLinks = outputData.selectedLinks || outputData.selected_links || [];
            if (selectedLinks.length > 0) {
                html += '<details><summary>🎯 View Selected Links Details</summary>';
                html += '<div class="debug-links-list">';
                selectedLinks.forEach((link, index) => {
                    html += `<div class="debug-link-item">
                        <strong>${index + 1}.</strong> "${link.text}"
                        <br><strong>URL:</strong> ${link.url}
                        <br><strong>Reasoning:</strong> ${link.reasoning || 'Not provided'}
                    </div>`;
                });
                html += '</div></details>';
            }
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // PHASE 4: MULTI-PAGE CRAWLING
    // =================================================================
    if (crawlData.pageCrawling) {
        html += '<div class="debug-page-crawling-detailed">';
        html += '<h5>📊 PHASE 4: Multi-Page Crawling</h5>';
        html += '<div class="debug-step-detailed">';
        html += `<p><strong>Type:</strong> ❌ No AI Interaction</p>`;
        html += `<p><strong>Timestamp:</strong> ${crawlData.pageCrawling.timestamp}</p>`;
        html += `<p><strong>Source:</strong> <code>${crawlData.pageCrawling.logic?.sourceFile}</code> → <code>${crawlData.pageCrawling.logic?.functionName}</code></p>`;
        
        // Processing Logic
        if (crawlData.pageCrawling.logic) {
            html += '<div class="debug-logic">';
            html += '<h6>Multi-Page Crawling Configuration</h6>';
            html += `<p><strong>Description:</strong> ${crawlData.pageCrawling.logic.description}</p>`;
            html += `<p><strong>Method:</strong> ${crawlData.pageCrawling.logic.crawlingMethod}</p>`;
            html += `<p><strong>Error Handling:</strong> ${crawlData.pageCrawling.logic.errorHandling}</p>`;
            html += `<p><strong>Content Processing:</strong> ${crawlData.pageCrawling.logic.contentProcessing}</p>`;
            
            html += '<details><summary>🔧 Crawling Process Steps</summary>';
            html += '<ul>';
            crawlData.pageCrawling.logic.steps?.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += '</details>';
            html += '</div>';
        }
        
        // Selected Links Input
        if (crawlData.pageCrawling.selectedLinks) {
            html += '<div class="debug-logic">';
            html += '<h6>Input: Selected Links to Crawl</h6>';
            html += `<p><strong>Total Pages to Crawl:</strong> ${crawlData.pageCrawling.selectedLinks.length}</p>`;
            html += '<details><summary>📋 View Complete Selected Links Input</summary>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.pageCrawling.selectedLinks, null, 2)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        // Detailed Page-by-Page Results
        if (crawlData.pageCrawling.crawledPages?.length > 0) {
            html += '<div class="debug-logic">';
            html += '<h6>Page-by-Page Crawling Results</h6>';
            crawlData.pageCrawling.crawledPages.forEach((page, index) => {
                html += `<div class="debug-page-detailed">
                    <h7>Page ${index + 1}: ${page.title}</h7>
                    <p><strong>URL:</strong> ${page.url}</p>
                    <p><strong>Domain:</strong> ${page.domain} <span class="link-type">[${page.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span></p>
                    <p><strong>Success:</strong> ${page.success ? '✅ Success' : '❌ Failed'}</p>`;
                
                if (page.success) {
                    html += `<p><strong>Original HTML Length:</strong> ${page.originalHtmlLength} characters</p>`;
                    html += `<p><strong>Clean Text Length:</strong> ${page.cleanTextLength} characters</p>`;
                    
                    if (page.content) {
                        html += `<details><summary>📄 View Extracted Content (${page.cleanTextLength} chars)</summary>`;
                        html += `<pre class="debug-content">${formatContentForDisplay(page.content.substring(0, 3000))}${page.content.length > 3000 ? '\n\n... (truncated for display)' : ''}</pre>`;
                        html += '</details>';
                    }
                } else {
                    html += `<p><strong>Error:</strong> ${page.errorMessage}</p>`;
                    html += `<p><strong>Functions Used:</strong> <code>fetchWebsiteHTML()</code> → <code>extractCleanText()</code></p>`;
                }
                html += `</div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // PHASE 5: AI BUSINESS ANALYSIS (SECOND AI INTERACTION)
    // =================================================================
    const businessAnalysisAI = crawlData.aiInteractions?.find(ai => ai.step === 'ai_response_received' || ai.step === 'ai_business_analysis');
    if (businessAnalysisAI) {
        html += '<div class="debug-ai-interactions-detailed">';
        html += '<h5>🧠 PHASE 5: AI Business Analysis (SECOND AI INTERACTION)</h5>';
        html += '<div class="debug-ai-interaction-detailed">';
        html += `<p><strong>Type:</strong> ✅ AI Interaction</p>`;
        html += `<p><strong>Timestamp:</strong> ${businessAnalysisAI.timestamp}</p>`;
        html += `<p><strong>Source:</strong> <code>services/websiteCrawler.js</code> → <code>crawlWebsite()</code></p>`;
        
        // AI Call Details
        html += '<div class="debug-logic">';
        html += '<h6>AI Call Configuration</h6>';
        html += `<p><strong>Prompt File:</strong> <code>prompts/intelligence/websiteCrawling.js</code> → <code>multiPageAnalysisPrompt()</code></p>`;
        html += `<p><strong>API Function:</strong> <code>services/ai.js</code> → <code>callClaudeAPI(enhancedCrawlPrompt, false, masterId, 'AI: Multi-Page Analysis')</code></p>`;
        html += `<p><strong>Model:</strong> Claude (via Anthropic API)</p>`;
        html += '</div>';
        
        // Input Data Summary
        html += '<div class="debug-logic">';
        html += '<h6>Input Data Summary</h6>';
        html += `<p><strong>Homepage Content:</strong> ${crawlData.rawData?.homepageContent?.length || 0} characters</p>`;
        html += `<p><strong>Additional Pages:</strong> ${crawlData.rawData?.additionalPages?.length || 0} pages</p>`;
        html += `<p><strong>Total Content Length:</strong> ${(crawlData.rawData?.homepageContent?.length || 0) + (crawlData.rawData?.additionalPages?.reduce((sum, page) => sum + (page.contentLength || 0), 0) || 0)} characters</p>`;
        html += `<p><strong>Analysis Method:</strong> ${crawlData.rawData?.analysisMethod || 'Unknown'}</p>`;
        html += '</div>';
        
        // Combined Content Sent to AI
        if (crawlData.rawData) {
            html += '<div class="debug-logic">';
            html += '<h6>Combined Content Input to AI</h6>';
            html += '<details><summary>📄 View Homepage Content Input</summary>';
            if (crawlData.rawData.homepageContent) {
                html += `<pre class="debug-content">${formatContentForDisplay(crawlData.rawData.homepageContent.fullContent?.substring(0, 4000) || 'Content not available')}${(crawlData.rawData.homepageContent.fullContent?.length || 0) > 4000 ? '\n\n... (truncated for display)' : ''}</pre>`;
            } else {
                html += '<p>Homepage content not available in debug data</p>';
            }
            html += '</details>';
            
            if (crawlData.rawData.additionalPages?.length > 0) {
                html += '<details><summary>📚 View Additional Pages Content Input</summary>';
                crawlData.rawData.additionalPages.forEach((page, index) => {
                    html += `<div class="debug-page-raw-detailed">
                        <h7>Page ${index + 1}: ${page.title}</h7>
                        <p><strong>URL:</strong> ${page.url}</p>
                        <p><strong>Domain:</strong> ${page.domain} <span class="link-type">[${page.isExternal ? 'EXTERNAL' : 'INTERNAL'}]</span></p>
                        <p><strong>Content Length:</strong> ${page.contentLength} characters</p>
                        ${page.error ? `<p><strong>Error:</strong> ${page.error}</p>` : ''}
                        ${page.fullContent ? `<details><summary>View Content</summary><pre class="debug-content">${formatContentForDisplay(page.fullContent.substring(0, 2000))}${page.fullContent.length > 2000 ? '\n\n... (truncated)' : ''}</pre></details>` : '<p>Content not available</p>'}
                    </div>`;
                });
                html += '</details>';
            }
            html += '</div>';
        }
        
        // Full AI Prompt
        if (businessAnalysisAI.fullPrompt) {
            html += '<div class="debug-logic">';
            html += '<h6>Complete AI Prompt Sent</h6>';
            html += `<details><summary>📝 View Full Business Analysis Prompt (${businessAnalysisAI.fullPrompt.length} characters)</summary>`;
            html += `<pre class="debug-prompt">${formatContentForDisplay(businessAnalysisAI.fullPrompt)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        // Full AI Response
        if (businessAnalysisAI.fullResponse) {
            html += '<div class="debug-logic">';
            html += '<h6>Complete AI Response Received</h6>';
            html += `<details><summary>🤖 View Full Business Analysis Response (${businessAnalysisAI.fullResponse.length} characters)</summary>`;
            html += `<pre class="debug-response">${formatContentForDisplay(businessAnalysisAI.fullResponse)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        // Parsed Business Data
        if (businessAnalysisAI.parsedData || crawlData.finalResult) {
            const parsedData = businessAnalysisAI.parsedData || crawlData.finalResult;
            html += '<div class="debug-logic">';
            html += '<h6>Parsed Business Intelligence Output</h6>';
            html += `<p><strong>Company Name:</strong> ${parsedData.company_name || 'Not found'}</p>`;
            html += `<p><strong>Business Stage:</strong> ${parsedData.business_stage || 'Not found'}</p>`;
            html += `<p><strong>Industry Category:</strong> ${parsedData.industry_category || 'Not found'}</p>`;
            html += `<p><strong>Target Customer:</strong> ${parsedData.target_customer || 'Not found'}</p>`;
            
            html += '<details><summary>📊 View Complete Parsed Business Data</summary>';
            html += `<pre class="debug-data">${JSON.stringify(parsedData, null, 2)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // PHASE 6: DESIGN ASSET EXTRACTION
    // =================================================================
    const designStartStep = crawlData.steps?.find(s => s.step === 'design_extraction_started');
    const designCompleteStep = crawlData.steps?.find(s => s.step === 'design_extraction_completed');
    
    if (designStartStep || designCompleteStep || crawlData.finalResult?.design_assets) {
        html += '<div class="debug-steps-detailed">';
        html += '<h5>🎨 PHASE 6: Design Asset Extraction</h5>';
        html += '<div class="debug-step-detailed">';
        html += `<p><strong>Type:</strong> ❌ No AI Interaction</p>`;
        html += `<p><strong>Timestamp:</strong> ${designCompleteStep?.timestamp || designStartStep?.timestamp || 'N/A'}</p>`;
        html += `<p><strong>Source:</strong> <code>services/designExtractor.js</code> → <code>extractDesignAssets()</code></p>`;
        
        // Process Details
        if (designStartStep?.logic) {
            html += '<div class="debug-logic">';
            html += '<h6>Design Extraction Process</h6>';
            html += `<p><strong>Description:</strong> ${designStartStep.logic.description}</p>`;
            html += '<details><summary>🔧 Design Extraction Steps</summary>';
            html += '<ul>';
            designStartStep.logic.steps?.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += '</ul>';
            html += '</details>';
            html += '</div>';
        }
        
        // Results
        if (crawlData.finalResult?.design_assets) {
            html += '<div class="debug-logic">';
            html += '<h6>Design Extraction Results</h6>';
            html += `<p><strong>Colors Extracted:</strong> ${crawlData.finalResult.design_assets.color_palette?.primary_colors?.length || 0}</p>`;
            html += `<p><strong>Fonts Found:</strong> ${crawlData.finalResult.design_assets.typography?.font_families_found?.length || 0}</p>`;
            html += `<p><strong>Logo Status:</strong> ${crawlData.finalResult.design_assets.logo_assets?.main_logo?.status || 'Not found'}</p>`;
            html += `<p><strong>Extraction Method:</strong> ${crawlData.finalResult.design_assets.extraction_metadata?.extraction_method || 'Unknown'}</p>`;
            
            html += '<details><summary>🎨 View Complete Design Assets Data</summary>';
            html += `<pre class="debug-data">${JSON.stringify(crawlData.finalResult.design_assets, null, 2)}</pre>`;
            html += '</details>';
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // PHASE 7: FINAL ASSEMBLY & RESULTS
    // =================================================================
    if (crawlData.finalResult) {
        html += '<div class="debug-final-result-detailed">';
        html += '<h5>📦 PHASE 7: Final Assembly & Results</h5>';
        html += '<div class="debug-step-detailed">';
        html += `<p><strong>Type:</strong> ❌ No AI Interaction</p>`;
        html += `<p><strong>Source:</strong> <code>services/websiteCrawler.js</code> → <code>crawlWebsite()</code></p>`;
        
        // Assembly Process
        html += '<div class="debug-logic">';
        html += '<h6>Final Data Assembly</h6>';
        html += '<p><strong>Assembly Steps:</strong></p>';
        html += '<ul>';
        html += '<li><code>JSON.parse(crawlResult)</code> - Parse AI response to structured data</li>';
        html += '<li><code>extractedData.design_assets = designAssets</code> - Add design assets</li>';
        html += '<li><code>extractedData.pages_analyzed = ...</code> - Add crawling metadata</li>';
        html += '<li><code>extractedData.extraction_metadata = ...</code> - Add processing metadata</li>';
        html += '<li><code>global.crawlDebugData = debugData</code> - Store debug information</li>';
        html += '</ul>';
        html += '</div>';
        
        // Metadata
        html += '<div class="debug-logic">';
        html += '<h6>Final Metadata</h6>';
        html += `<p><strong>Pages Analyzed:</strong> ${crawlData.finalResult.pages_analyzed || 0}</p>`;
        html += `<p><strong>External Pages:</strong> ${crawlData.finalResult.external_pages_analyzed || 0}</p>`;
        html += `<p><strong>Total Content Length:</strong> ${crawlData.finalResult.total_content_length || 0} characters</p>`;
        html += `<p><strong>Analysis Method:</strong> ${crawlData.finalResult.analysis_method || 'Unknown'}</p>`;
        html += `<p><strong>Design Extraction Status:</strong> ${crawlData.finalResult.design_extraction_status || 'Unknown'}</p>`;
        html += '</div>';
        
        // Complete Final Result
        html += '<div class="debug-logic">';
        html += '<h6>Complete Final Result Data</h6>';
        html += '<details><summary>📋 View Complete Final Result JSON</summary>';
        html += `<pre class="debug-final-result">${JSON.stringify(crawlData.finalResult, null, 2)}</pre>`;
        html += '</details>';
        html += '</div>';
        
        // Usage Information
        html += '<div class="final-result-usage">';
        html += '<h6>🚀 How This Data Gets Used</h6>';
        html += '<div class="usage-highlight">';
        html += '<p><strong>This final result populates the Business Profile form automatically:</strong></p>';
        
        html += '<div class="usage-sections">';
        html += '<div class="usage-section-primary">';
        html += '<h7>🏢 Business Setup Section (Auto-filled):</h7>';
        html += '<ul>';
        html += '<li><strong>company_name</strong> → Company Name field</li>';
        html += '<li><strong>business_description</strong> → Business Description field</li>';
        html += '<li><strong>value_proposition</strong> → Value Proposition field</li>';
        html += '<li><strong>main_product_service</strong> → Main Product/Service field</li>';
        html += '<li><strong>pricing_info</strong> → Pricing Information field</li>';
        html += '<li><strong>business_stage</strong> → Business Stage field</li>';
        html += '</ul>';
        html += '</div>';
        
        html += '<div class="usage-section-primary">';
        html += '<h7>🎯 Strategic Intelligence Section (Auto-filled):</h7>';
        html += '<ul>';
        html += '<li><strong>target_customer</strong> → Target Customer field</li>';
        html += '<li><strong>key_features</strong> → Key Features list</li>';
        html += '<li><strong>unique_selling_points</strong> → USP list</li>';
        html += '<li><strong>competitors_mentioned</strong> → Competitors list</li>';
        html += '<li><strong>social_media</strong> → Social Media links</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="usage-note">';
        html += '<p><strong>Data Flow:</strong> <code>crawlWebsite()</code> → <code>window.appState.websiteIntelligence</code> → <code>displayBusinessSetupResults()</code> → Form auto-population</p>';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        html += '</div>';
    }
    
    // =================================================================
    // DEBUG DATA SUMMARY
    // =================================================================
    if (crawlData.summary) {
        html += '<div class="debug-steps-detailed">';
        html += '<h5>📈 DEBUG DATA SUMMARY</h5>';
        html += '<div class="debug-step-detailed">';
        html += '<div class="debug-logic">';
        html += '<h6>Processing Statistics</h6>';
        html += `<div class="debug-link-item"><strong>Total AI Interactions:</strong> ${crawlData.aiInteractions?.length || 0}</div>`;
        html += `<div class="debug-link-item"><strong>Total Processing Steps:</strong> ${crawlData.steps?.length || 0}</div>`;
        html += `<div class="debug-link-item"><strong>Homepage Content:</strong> ${crawlData.summary.homepageContentLength || 0} characters</div>`;
        html += `<div class="debug-link-item"><strong>Additional Pages:</strong> ${crawlData.summary.additionalPagesCount || 0} pages</div>`;
        html += `<div class="debug-link-item"><strong>Successful Pages:</strong> ${crawlData.summary.successfulPages || 0}</div>`;
        html += `<div class="debug-link-item"><strong>Failed Pages:</strong> ${crawlData.summary.failedPages || 0}</div>`;
        html += `<div class="debug-link-item"><strong>External Pages:</strong> ${crawlData.summary.externalPages || 0}</div>`;
        html += `<div class="debug-link-item"><strong>Analysis Method:</strong> ${crawlData.summary.analysisMethod || 'Unknown'}</div>`;
        html += '</div>';
        
        html += '<details><summary>📊 View Complete Debug Summary Data</summary>';
        html += `<pre class="debug-summary">${JSON.stringify(crawlData.summary, null, 2)}</pre>`;
        html += '</details>';
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>';
    output.innerHTML = html;
}

// Content Strategy Debug Functions
async function refreshContentStrategyDebug() {
    console.log('🔄 Refreshing content strategy debug...');
    const contentStrategyData = await collectContentStrategyDebugData();
    console.log('📋 Content strategy data:', contentStrategyData);
    const output = document.getElementById('contentStrategyDebugOutput');
    
    if (contentStrategyData.message) {
        output.innerHTML = contentStrategyData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Basic info
    html += `<h4>📋 Content Strategy Debug - Complete Details</h4>`;
    html += `<p><strong>Timestamp:</strong> ${contentStrategyData.timestamp}</p>`;
    
    // Business Context Preparation
    if (contentStrategyData.businessContextPreparation) {
        html += '<h5>🏢 Business Context Preparation:</h5>';
        html += '<div class="debug-content">';
        html += `<p><strong>Source:</strong> <code>${contentStrategyData.businessContextPreparation.logic.sourceFile}</code> - <code>${contentStrategyData.businessContextPreparation.logic.functionName}</code></p>`;
        html += `<p><strong>Description:</strong> ${contentStrategyData.businessContextPreparation.logic.description}</p>`;
        html += '<details>';
        html += '<summary>View Business Context Preparation Logic</summary>';
        html += '<div class="debug-logic">';
        html += '<ul>';
        contentStrategyData.businessContextPreparation.logic.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        html += '</details>';
        html += '<details>';
        html += '<summary>View Input Business Context</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.businessContextPreparation.inputContext, null, 2))}</pre>`;
        html += '</details>';
        html += '<details>';
        html += '<summary>View Prepared Business Context</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.businessContextPreparation.outputContext, null, 2))}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Business Context (legacy - for backward compatibility)
    if (contentStrategyData.businessContext && !contentStrategyData.businessContextPreparation) {
        html += '<h5>🏢 Business Context:</h5>';
        html += '<div class="debug-content">';
        html += '<p><strong>Source:</strong> <code>controllers/contentStrategy.js</code> - <code>prepareContext()</code></p>';
        html += '<p><strong>Description:</strong> Business context prepared for content strategy generation</p>';
        html += '<details>';
        html += '<summary>View Business Context Data</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.businessContext, null, 2))}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Available Data
    if (contentStrategyData.availableData) {
        html += '<h5>📊 Available Data Assessment:</h5>';
        html += '<div class="debug-content">';
        html += '<p><strong>Source:</strong> <code>controllers/contentStrategy.js</code> - <code>calculateCompleteness()</code></p>';
        html += '<p><strong>Description:</strong> Assessment of data completeness for strategy generation</p>';
        html += '<details>';
        html += '<summary>View Available Data Assessment</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.availableData, null, 2))}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Data Completeness
    if (contentStrategyData.dataCompleteness) {
        html += '<h5>📈 Data Completeness Analysis:</h5>';
        html += '<div class="debug-content">';
        html += '<p><strong>Source:</strong> <code>controllers/contentStrategy.js</code> - <code>calculateCompleteness()</code></p>';
        html += '<p><strong>Description:</strong> Data completeness score and recommendations</p>';
        html += '<details>';
        html += '<summary>View Data Completeness Analysis</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.dataCompleteness, null, 2))}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // AI Prompt
    if (contentStrategyData.aiPrompt) {
        html += '<h5>🤖 AI Prompt Generation:</h5>';
        html += '<div class="debug-content">';
        html += `<p><strong>Source:</strong> <code>${contentStrategyData.aiPrompt.promptSource.sourceFile}</code> - <code>${contentStrategyData.aiPrompt.promptSource.functionName}</code></p>`;
        html += `<p><strong>Description:</strong> ${contentStrategyData.aiPrompt.logic.description}</p>`;
        html += '<details>';
        html += '<summary>View AI Prompt Logic</summary>';
        html += '<div class="debug-logic">';
        html += '<ul>';
        contentStrategyData.aiPrompt.logic.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        html += '</details>';
        html += '<details>';
        html += '<summary>View Full AI Prompt</summary>';
        html += `<pre>${formatContentForDisplay(contentStrategyData.aiPrompt.prompt)}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // AI Response
    if (contentStrategyData.aiResponse) {
        html += '<h5>🤖 AI Response:</h5>';
        html += '<div class="debug-content">';
        html += `<p><strong>Source:</strong> <code>${contentStrategyData.aiResponse.logic.sourceFile}</code> - <code>${contentStrategyData.aiResponse.logic.functionName}</code></p>`;
        html += `<p><strong>Description:</strong> ${contentStrategyData.aiResponse.logic.description}</p>`;
        html += '<details>';
        html += '<summary>View AI Response Logic</summary>';
        html += '<div class="debug-logic">';
        html += '<ul>';
        contentStrategyData.aiResponse.logic.steps.forEach(step => {
            html += `<li>${step}</li>`;
        });
        html += '</ul>';
        html += '</div>';
        html += '</details>';
        html += '<details>';
        html += '<summary>View Full AI Response</summary>';
        html += `<pre>${formatContentForDisplay(contentStrategyData.aiResponse.response)}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Final Strategy
    if (contentStrategyData.finalStrategy) {
        html += '<h5>📋 Final Content Strategy:</h5>';
        html += '<div class="debug-content">';
        html += '<p><strong>Source:</strong> <code>controllers/contentStrategy.js</code> - <code>parseStrategyResponse()</code></p>';
        html += '<p><strong>Description:</strong> Parsed and structured content strategy result</p>';
        html += '<details>';
        html += '<summary>View Final Strategy</summary>';
        html += `<pre>${formatContentForDisplay(JSON.stringify(contentStrategyData.finalStrategy, null, 2))}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Error (if any)
    if (contentStrategyData.error) {
        html += '<h5>❌ Error:</h5>';
        html += '<div class="debug-content">';
        html += `<p><strong>Error:</strong> ${contentStrategyData.error.error}</p>`;
        html += '<details>';
        html += '<summary>View Error Stack</summary>';
        html += `<pre>${formatContentForDisplay(contentStrategyData.error.stack)}</pre>`;
        html += '</details>';
        html += '</div>';
    }
    
    // Summary
    if (contentStrategyData.summary) {
        html += '<h5>📈 Summary:</h5>';
        html += '<div class="debug-summary-detailed">';
        html += `<p><strong>Business Context Fields:</strong> ${contentStrategyData.summary.businessContextFields}</p>`;
        html += `<p><strong>Available Data Fields:</strong> ${contentStrategyData.summary.availableDataFields}</p>`;
        html += `<p><strong>Data Completeness Score:</strong> ${contentStrategyData.summary.dataCompletenessScore}%</p>`;
        html += `<p><strong>Strategy Generated:</strong> ${contentStrategyData.summary.strategyGenerated ? 'Yes' : 'No'}</p>`;
        if (contentStrategyData.summary.strategyChannels > 0) {
            html += `<p><strong>Strategy Channels:</strong> ${contentStrategyData.summary.strategyChannels}</p>`;
        }
        html += `<p><strong>Analysis Method:</strong> ${contentStrategyData.summary.analysisMethod}</p>`;
        html += '</div>';
    }
    
    html += '</div>';
    output.innerHTML = html;
}

function clearContentStrategyDebug() {
    const output = document.getElementById('contentStrategyDebugOutput');
    output.innerHTML = 'No content strategy debug data available';
}

async function collectContentStrategyDebugData() {
    try {
        const response = await fetch('/api/systemDebug/content-strategy-debug');
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            return {
                timestamp: new Date().toISOString(),
                message: result.message || 'No content strategy debug data available'
            };
        }
    } catch (error) {
        console.error('Error collecting content strategy debug data:', error);
        return {
            timestamp: new Date().toISOString(),
            message: 'Error collecting content strategy debug data: ' + error.message
        };
    }
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

// Global variable to store competitor intelligence debug data
window.competitorDebugData = null;

// Function to update competitor intelligence debug data (called from backend)
async function updateCompetitorIntelligenceDebugData(data) {
    window.competitorDebugData = data;
    // Auto-refresh the debug display if it's open
    const debugSection = document.getElementById('competitorIntelligenceDebug');
    if (debugSection && debugSection.style.display !== 'none') {
        await refreshCompetitorIntelligenceDebug();
    }
}

// Global variable to store content strategy debug data
window.contentStrategyDebugData = null;

// Function to update content strategy debug data (called from backend)
async function updateContentStrategyDebugData(data) {
    window.contentStrategyDebugData = data;
    // Auto-refresh the debug display if it's open
    const debugSection = document.getElementById('contentStrategyDebug');
    if (debugSection && debugSection.style.display !== 'none') {
        await refreshContentStrategyDebug();
    }
}

// Competitor Intelligence Debug Functions
async function refreshCompetitorIntelligenceDebug() {
    console.log('🔄 Refreshing competitor intelligence debug...');
    const competitorData = await collectCompetitorIntelligenceDebugData();
    console.log('📋 Competitor data:', competitorData);
    const output = document.getElementById('competitorIntelligenceDebugOutput');
    
    if (competitorData.message) {
        output.innerHTML = competitorData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Basic info
    html += `<h4>🏢 Competitor Intelligence Debug - Complete Details</h4>`;
    html += `<p><strong>Started:</strong> ${competitorData.timestamp}</p>`;
    html += `<p><strong>Debug Generated:</strong> ${new Date().toISOString()}</p>`;
    html += `<p><strong>Competitor Queries:</strong> ${competitorData.competitorQueries?.length || 0}</p>`;

    // Show full prompt and response for search query generation if present
    if (competitorData.aiInteractions && competitorData.aiInteractions.length > 0) {
        competitorData.aiInteractions.forEach((aiGen, aiIndex) => {
            html += `<div class="debug-ai-interaction-detailed">`;
            html += `<h6>${aiIndex + 1}. ${aiGen.step}</h6>`;
            html += `<span class="timestamp">${aiGen.timestamp}</span>`;
            Object.keys(aiGen).forEach(key => {
                if (["step", "timestamp", "promptSource", "logic"].includes(key)) return;
                const value = aiGen[key];
                if (value === undefined || value === null) return;
                if (typeof value === "string" && value.length > 200) {
                    html += `<details><summary>${key}</summary><pre class="step-data">${value}</pre></details>`;
                } else if (typeof value === "object") {
                    html += `<details><summary>${key}</summary><pre class="step-data">${JSON.stringify(value, null, 2)}</pre></details>`;
                } else {
                    html += `<div><strong>${key}:</strong> ${value}</div>`;
                }
            });
            if (aiGen.promptSource) {
                html += '<details><summary>Prompt Source</summary>';
                html += `<div><strong>Source:</strong> <code>${aiGen.promptSource.sourceFile || ''}</code></div>`;
                html += `<div><strong>Function:</strong> <code>${aiGen.promptSource.functionName || ''}</code></div>`;
                html += `<div><strong>Description:</strong> ${aiGen.promptSource.description || ''}</div>`;
                html += '</details>';
            }
            if (aiGen.logic) {
                html += '<details><summary>Logic</summary>';
                if (typeof aiGen.logic === 'object') {
                    if (aiGen.logic.description) html += `<div><strong>Description:</strong> ${aiGen.logic.description}</div>`;
                    if (aiGen.logic.sourceFile) html += `<div><strong>Source:</strong> <code>${aiGen.logic.sourceFile}</code></div>`;
                    if (aiGen.logic.functionName) html += `<div><strong>Function:</strong> <code>${aiGen.logic.functionName}</code></div>`;
                    if (aiGen.logic.steps && Array.isArray(aiGen.logic.steps)) {
                        html += '<div><strong>Steps:</strong><ul>';
                        aiGen.logic.steps.forEach(lstep => html += `<li>${lstep}</li>`);
                        html += '</ul></div>';
                    }
                } else {
                    html += `<pre>${JSON.stringify(aiGen.logic, null, 2)}</pre>`;
                }
                html += '</details>';
            }
            html += `</div>`;
        });
    }
    // Competitor Queries
    if (competitorData.competitorQueries && competitorData.competitorQueries.length > 0) {
        html += '<h5>🔍 Competitor Discovery Queries:</h5>';
        html += '<div class="debug-queries-detailed">';
        competitorData.competitorQueries.forEach((query, index) => {
            html += `<div class="debug-query-item"><strong>${index + 1}.</strong> ${formatContentForDisplay(query)}</div>`;
        });
        html += '</div>';
    }
    // Web Searches
    if (competitorData.searchResults && competitorData.searchResults.length > 0) {
        html += '<h5>🌐 Web Searches:</h5>';
        html += '<div class="debug-searches-detailed">';
        competitorData.searchResults.forEach((search, index) => {
            html += `<div class="debug-search-detailed"><h6>Search ${index + 1}: ${search.query}</h6><span class="timestamp">${search.timestamp}</span>`;
            Object.keys(search).forEach(key => {
                if (["step", "timestamp", "logic", "query"].includes(key)) return;
                const value = search[key];
                if (value === undefined || value === null) return;
                if (typeof value === "string" && value.length > 200) {
                    html += `<details><summary>${key}</summary><pre class="step-data">${value}</pre></details>`;
                } else if (typeof value === "object") {
                    html += `<details><summary>${key}</summary><pre class="step-data">${JSON.stringify(value, null, 2)}</pre></details>`;
                } else {
                    html += `<div><strong>${key}:</strong> ${value}</div>`;
                }
            });
            if (search.logic) {
                html += '<details><summary>Logic</summary>';
                if (typeof search.logic === 'object') {
                    if (search.logic.description) html += `<div><strong>Description:</strong> ${search.logic.description}</div>`;
                    if (search.logic.sourceFile) html += `<div><strong>Source:</strong> <code>${search.logic.sourceFile}</code></div>`;
                    if (search.logic.functionName) html += `<div><strong>Function:</strong> <code>${search.logic.functionName}</code></div>`;
                    if (search.logic.steps && Array.isArray(search.logic.steps)) {
                        html += '<div><strong>Steps:</strong><ul>';
                        search.logic.steps.forEach(lstep => html += `<li>${lstep}</li>`);
                        html += '</ul></div>';
                    }
                } else {
                    html += `<pre>${JSON.stringify(search.logic, null, 2)}</pre>`;
                }
                html += '</details>';
            }
            html += '</div>';
        });
        html += '</div>';
    }
    // URL Extraction
    if (competitorData.urlExtraction) {
        html += '<h5>🔗 URL Extraction:</h5>';
        html += '<div class="debug-url-extraction-detailed">';
        Object.keys(competitorData.urlExtraction).forEach(key => {
            if (["step", "timestamp", "logic"].includes(key)) return;
            const value = competitorData.urlExtraction[key];
            if (value === undefined || value === null) return;
            if (typeof value === "string" && value.length > 200) {
                html += `<details><summary>${key}</summary><pre class="step-data">${value}</pre></details>`;
            } else if (typeof value === "object") {
                html += `<details><summary>${key}</summary><pre class="step-data">${JSON.stringify(value, null, 2)}</pre></details>`;
            } else {
                html += `<div><strong>${key}:</strong> ${value}</div>`;
            }
        });
        if (competitorData.urlExtraction.logic) {
            html += '<details><summary>Logic</summary>';
            if (typeof competitorData.urlExtraction.logic === 'object') {
                if (competitorData.urlExtraction.logic.description) html += `<div><strong>Description:</strong> ${competitorData.urlExtraction.logic.description}</div>`;
                if (competitorData.urlExtraction.logic.sourceFile) html += `<div><strong>Source:</strong> <code>${competitorData.urlExtraction.logic.sourceFile}</code></div>`;
                if (competitorData.urlExtraction.logic.functionName) html += `<div><strong>Function:</strong> <code>${competitorData.urlExtraction.logic.functionName}</code></div>`;
                if (competitorData.urlExtraction.logic.steps && Array.isArray(competitorData.urlExtraction.logic.steps)) {
                    html += '<div><strong>Steps:</strong><ul>';
                    competitorData.urlExtraction.logic.steps.forEach(lstep => html += `<li>${lstep}</li>`);
                    html += '</ul></div>';
                }
            } else {
                html += `<pre>${JSON.stringify(competitorData.urlExtraction.logic, null, 2)}</pre>`;
            }
            html += '</details>';
        }
        html += '</div>';
    }
    // Competitor URLs
    if (competitorData.competitorUrls && competitorData.competitorUrls.length > 0) {
        html += '<h5>🔗 Extracted Competitor URLs:</h5>';
        html += '<div class="debug-urls-list">';
        competitorData.competitorUrls.forEach((url, index) => {
            html += `<div class="debug-url-item"><strong>${index + 1}.</strong> ${formatContentForDisplay(url.title)}<br><em>${url.url}</em><br><span class="url-meta">Source: ${url.query_source}, Rank: ${url.rank}</span></div>`;
        });
        html += '</div>';
    }
    // Competitor Crawling
    if (competitorData.crawlResults && competitorData.crawlResults.length > 0) {
        html += '<h5>🏠 Competitor Homepage Crawling:</h5>';
        html += '<div class="debug-crawls-detailed">';
        competitorData.crawlResults.forEach((crawl, index) => {
            html += `<div class="debug-crawl-detailed"><h6>Competitor ${index + 1}: ${crawl.websiteUrl}</h6><span class="timestamp">${crawl.timestamp}</span>`;
            Object.keys(crawl).forEach(key => {
                if (["step", "timestamp", "websiteUrl", "logic"].includes(key)) return;
                const value = crawl[key];
                if (value === undefined || value === null) return;
                if (typeof value === "string" && value.length > 200) {
                    html += `<details><summary>${key}</summary><pre class="step-data">${value}</pre></details>`;
                } else if (typeof value === "object") {
                    html += `<details><summary>${key}</summary><pre class="step-data">${JSON.stringify(value, null, 2)}</pre></details>`;
                } else {
                    html += `<div><strong>${key}:</strong> ${value}</div>`;
                }
            });
            if (crawl.logic) {
                html += '<details><summary>Logic</summary>';
                if (typeof crawl.logic === 'object') {
                    if (crawl.logic.description) html += `<div><strong>Description:</strong> ${crawl.logic.description}</div>`;
                    if (crawl.logic.sourceFile) html += `<div><strong>Source:</strong> <code>${crawl.logic.sourceFile}</code></div>`;
                    if (crawl.logic.functionName) html += `<div><strong>Function:</strong> <code>${crawl.logic.functionName}</code></div>`;
                    if (crawl.logic.steps && Array.isArray(crawl.logic.steps)) {
                        html += '<div><strong>Steps:</strong><ul>';
                        crawl.logic.steps.forEach(lstep => html += `<li>${lstep}</li>`);
                        html += '</ul></div>';
                    }
                } else {
                    html += `<pre>${JSON.stringify(crawl.logic, null, 2)}</pre>`;
                }
                html += '</details>';
            }
            html += '</div>';
        });
        html += '</div>';
    }
    // Final Result
    if (competitorData.finalResult) {
        html += '<h5>🎯 Final Result:</h5>';
        html += '<div class="debug-final-result-detailed">';
        html += `<pre class="debug-final-result">${JSON.stringify(competitorData.finalResult, null, 2)}</pre>`;
        html += '</div>';
    }
    // Summary
    if (competitorData.summary) {
        html += '<h5>📈 Summary:</h5>';
        html += '<div class="debug-summary-detailed">';
        Object.keys(competitorData.summary).forEach(key => {
            html += `<div><strong>${key}:</strong> ${competitorData.summary[key]}</div>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    output.innerHTML = html;
}

function clearCompetitorIntelligenceDebug() {
    const output = document.getElementById('competitorIntelligenceDebugOutput');
    output.innerHTML = 'No competitor intelligence data available';
}

async function collectCompetitorIntelligenceDebugData() {
    try {
        console.log('🔍 Fetching competitor debug data from API...');
        // Try to fetch from API endpoint first
        const response = await fetch('/api/systemDebug/competitor-debug');
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.success && result.data) {
            const debugData = result.data;
            return {
                timestamp: debugData.timestamp,
                competitorQueries: debugData.competitorQueries || [],
                businessContext: debugData.businessContext || {},
                
                // Web search results
                searchResults: debugData.searchResults?.map(search => ({
                    step: search.step,
                    timestamp: search.timestamp,
                    query: search.query,
                    queryIndex: search.queryIndex,
                    result: search.result,
                    logic: search.logic || null
                })) || [],
                
                // URL extraction
                urlExtraction: debugData.urlExtraction || null,
                competitorUrls: debugData.competitorUrls || [],
                
                // Crawl results
                crawlResults: debugData.crawlResults?.map(crawl => ({
                    step: crawl.step,
                    timestamp: crawl.timestamp,
                    websiteUrl: crawl.websiteUrl,
                    error: crawl.error,
                    rawData: crawl.rawData || null,
                    processedData: crawl.processedData || null,
                    aiInteraction: crawl.aiInteraction || null,
                    logic: crawl.logic || null
                })) || [],
                
                // AI interactions
                aiInteractions: debugData.aiInteractions?.map(interaction => ({
                    step: interaction.step,
                    timestamp: interaction.timestamp,
                    prompt: interaction.prompt || null,
                    response: interaction.response || null,
                    parsedData: interaction.parsedData || null,
                    promptSource: interaction.promptSource || null,
                    logic: interaction.logic || null
                })) || [],
                
                // Final result
                finalResult: debugData.finalResult || null,
                
                // Summary
                summary: debugData.summary || null
            };
        } else {
            // Fallback to window data if API fails
            const appState = window.appState || {};
            const debugData = window.competitorDebugData || null;
            
            if (!debugData) {
                return {
                    timestamp: new Date().toISOString(),
                    message: 'No competitor intelligence debug data available'
                };
            }
            
            return {
                timestamp: debugData.timestamp,
                competitorQueries: debugData.competitorQueries || [],
                businessContext: debugData.businessContext || {},
                
                // Web search results
                searchResults: debugData.searchResults?.map(search => ({
                    step: search.step,
                    timestamp: search.timestamp,
                    query: search.query,
                    queryIndex: search.queryIndex,
                    result: search.result,
                    logic: search.logic || null
                })) || [],
                
                // URL extraction
                urlExtraction: debugData.urlExtraction || null,
                competitorUrls: debugData.competitorUrls || [],
                
                // Crawl results
                crawlResults: debugData.crawlResults?.map(crawl => ({
                    step: crawl.step,
                    timestamp: crawl.timestamp,
                    websiteUrl: crawl.websiteUrl,
                    error: crawl.error,
                    rawData: crawl.rawData || null,
                    processedData: crawl.processedData || null,
                    aiInteraction: crawl.aiInteraction || null,
                    logic: crawl.logic || null
                })) || [],
                
                // AI interactions
                aiInteractions: debugData.aiInteractions?.map(interaction => ({
                    step: interaction.step,
                    timestamp: interaction.timestamp,
                    prompt: interaction.prompt || null,
                    response: interaction.response || null,
                    parsedData: interaction.parsedData || null,
                    promptSource: interaction.promptSource || null,
                    logic: interaction.logic || null
                })) || [],
                
                // Final result
                finalResult: debugData.finalResult || null,
                
                // Summary
                summary: debugData.summary || null
            };
        }
    } catch (error) {
        console.error('Error fetching competitor debug data:', error);
        return {
            timestamp: new Date().toISOString(),
            message: 'Error fetching competitor intelligence debug data: ' + error.message
        };
    }
}

// Web Search Debug Functions
async function refreshWebSearchDebug() {
    console.log('🔄 Refreshing web search debug...');
    const webSearchData = await collectWebSearchDebugData();
    console.log('📋 Web search data:', webSearchData);
    const output = document.getElementById('webSearchDebugOutput');
    
    if (webSearchData.message) {
        output.innerHTML = webSearchData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Basic info
    html += `<h4>🔍 Web Search Debug - Complete Details</h4>`;
    html += `<p><strong>Started:</strong> ${webSearchData.timestamp}</p>`;
    html += `<p><strong>Debug Generated:</strong> ${new Date().toISOString()}</p>`;

    // Query Generation
    if (webSearchData.queryGeneration) {
        html += '<h5>📝 Search Query Generation:</h5>';
        html += '<div class="debug-query-generation-detailed">';
        html += `<p><strong>Step:</strong> ${webSearchData.queryGeneration.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${webSearchData.queryGeneration.timestamp}</p>`;
        html += `<p><strong>Competitor Names Found:</strong> ${webSearchData.queryGeneration.competitorNamesFound || 0}</p>`;
        html += `<p><strong>Total Queries Generated:</strong> ${webSearchData.queryGeneration.totalQueriesGenerated || 0}</p>`;
        
        // Add logic information
        if (webSearchData.queryGeneration.logic) {
            html += '<details><summary>🔧 Generation Logic</summary>';
            html += `<p><strong>Description:</strong> ${formatContentForDisplay(webSearchData.queryGeneration.logic.description)}</p>`;
            html += `<p><strong>Source:</strong> <code>${webSearchData.queryGeneration.logic.sourceFile}</code> - <code>${webSearchData.queryGeneration.logic.functionName}</code></p>`;
            html += '<p><strong>Steps:</strong></p><ul>';
            webSearchData.queryGeneration.logic.steps.forEach(step => {
                html += `<li>${formatContentForDisplay(step)}</li>`;
            });
            html += '</ul>';
            html += '</details>';
        }
        
        if (webSearchData.queryGeneration.inputData) {
            html += '<details><summary>View Input Data</summary>';
            html += `<pre class="debug-data">${JSON.stringify(webSearchData.queryGeneration.inputData, null, 2)}</pre>`;
            html += '</details>';
        }
        
        if (webSearchData.queryGeneration.outputData) {
            html += '<details><summary>View Generated Queries</summary>';
            html += `<pre class="debug-data">${JSON.stringify(webSearchData.queryGeneration.outputData, null, 2)}</pre>`;
            html += '</details>';
        }
        
        html += '</div>';
    }

    // Search Executions
    if (webSearchData.searchExecutions && webSearchData.searchExecutions.length > 0) {
        html += '<h5>🔍 Search Executions:</h5>';
        html += '<div class="debug-search-executions-detailed">';
        webSearchData.searchExecutions.forEach((execution, index) => {
            html += `<div class="debug-search-execution-detailed">
                <h6>Search ${index + 1}: ${execution.query}</h6>
                <p><strong>Step:</strong> ${execution.step}</p>
                <p><strong>Timestamp:</strong> ${execution.timestamp}</p>`;
            
            // Add logic information
            if (execution.logic) {
                html += '<details><summary>🔧 Search Logic</summary>';
                html += `<p><strong>Description:</strong> ${formatContentForDisplay(execution.logic.description)}</p>`;
                html += `<p><strong>Source:</strong> <code>${execution.logic.sourceFile}</code> - <code>${execution.logic.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                execution.logic.steps.forEach(step => {
                    html += `<li>${formatContentForDisplay(step)}</li>`;
                });
                html += '</ul>';
                html += '</details>';
            }
            
            if (execution.apiCalls && execution.apiCalls.length > 0) {
                html += '<details><summary>View API Calls</summary>';
                html += '<div class="debug-api-calls">';
                execution.apiCalls.forEach((apiCall, callIndex) => {
                    html += `<div class="debug-api-call">
                        <strong>Call ${callIndex + 1}:</strong> ${apiCall.type}
                        <br><strong>Query:</strong> ${apiCall.query}
                        <br><strong>Results:</strong> ${apiCall.results_count}
                        <br><strong>Timestamp:</strong> ${apiCall.timestamp}`;
                    
                    if (apiCall.logic) {
                        html += '<details><summary>API Logic</summary>';
                        html += `<p><strong>Description:</strong> ${formatContentForDisplay(apiCall.logic.description)}</p>`;
                        html += `<p><strong>Source:</strong> <code>${apiCall.logic.sourceFile}</code> - <code>${apiCall.logic.functionName}</code></p>`;
                        html += '<p><strong>Steps:</strong></p><ul>';
                        apiCall.logic.steps.forEach(step => {
                            html += `<li>${formatContentForDisplay(step)}</li>`;
                        });
                        html += '</ul>';
                        html += '</details>';
                    }
                    
                    html += '</div>';
                });
                html += '</div></details>';
            }
            
            if (execution.results) {
                html += '<details><summary>View Search Results</summary>';
                html += `<p><strong>Articles Found:</strong> ${execution.results.articles_count}</p>`;
                html += `<p><strong>Method Used:</strong> ${execution.results.method_used}</p>`;
                html += `<p><strong>Status:</strong> ${execution.results.status}</p>`;
                if (execution.results.articles && execution.results.articles.length > 0) {
                    html += '<details><summary>View Articles</summary>';
                    html += '<div class="debug-articles-list">';
                    execution.results.articles.forEach((article, articleIndex) => {
                        html += `<div class="debug-article-item">
                            <strong>${articleIndex + 1}.</strong> ${formatContentForDisplay(article.title)}
                            <br><em>${article.url}</em>
                            <br>${formatContentForDisplay(article.preview)}
                        </div>`;
                    });
                    html += '</div></details>';
                }
                html += '</details>';
            }
            
            if (execution.error) {
                html += `<p><strong>Error:</strong> ${execution.error}</p>`;
            }
            
            html += '</div>';
        });
        html += '</div>';
    }

    html += '</div>';
    
    output.innerHTML = html;
    console.log('✅ Web search debug data displayed');
}

function clearWebSearchDebug() {
    const output = document.getElementById('webSearchDebugOutput');
    output.innerHTML = 'No web search data available';
}

async function collectWebSearchDebugData() {
    try {
        console.log('🔍 Fetching web search debug data from API...');
        const response = await fetch('/api/systemDebug/web-search-debug');
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.success && result.data) {
            return result.data;
        } else {
            return {
                timestamp: new Date().toISOString(),
                message: 'No web search debug data available'
            };
        }
    } catch (error) {
        console.error('Error fetching web search debug data:', error);
        return {
            timestamp: new Date().toISOString(),
            message: 'Error fetching web search debug data: ' + error.message
        };
    }
}

// Reddit Debug Functions
async function refreshRedditDebug() {
    console.log('🔄 Refreshing reddit debug...');
    const redditData = await collectRedditDebugData();
    console.log('📋 Reddit data:', redditData);
    const output = document.getElementById('redditDebugOutput');
    
    if (redditData.message) {
        output.innerHTML = redditData.message;
        return;
    }
    
    let html = '<div class="debug-detailed-section">';
    
    // Basic info
    html += `<h4>🤖 Reddit Debug - Complete Details</h4>`;
    html += `<p><strong>Started:</strong> ${redditData.timestamp}</p>`;
    html += `<p><strong>Debug Generated:</strong> ${new Date().toISOString()}</p>`;

    // Query Generation
    if (redditData.queryGeneration) {
        html += '<h5>📝 Reddit Query Generation:</h5>';
        html += '<div class="debug-reddit-query-generation-detailed">';
        html += `<p><strong>Step:</strong> ${redditData.queryGeneration.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${redditData.queryGeneration.timestamp}</p>`;
        
        // Add logic information
        if (redditData.queryGeneration.logic) {
            html += '<details><summary>🔧 Generation Logic</summary>';
            html += `<p><strong>Description:</strong> ${formatContentForDisplay(redditData.queryGeneration.logic.description)}</p>`;
            html += `<p><strong>Source:</strong> <code>${redditData.queryGeneration.logic.sourceFile}</code> - <code>${redditData.queryGeneration.logic.functionName}</code></p>`;
            html += '<p><strong>Steps:</strong></p><ul>';
            redditData.queryGeneration.logic.steps.forEach(step => {
                html += `<li>${formatContentForDisplay(step)}</li>`;
            });
            html += '</ul>';
            html += '</details>';
        }
        
        if (redditData.queryGeneration.aiInteraction) {
            html += '<details><summary>View AI Interaction</summary>';
            if (redditData.queryGeneration.aiInteraction.promptSource) {
                html += `<p><strong>Prompt Source:</strong> <code>${redditData.queryGeneration.aiInteraction.promptSource.sourceFile}</code> - <code>${redditData.queryGeneration.aiInteraction.promptSource.functionName}</code></p>`;
                html += `<p><strong>Description:</strong> ${formatContentForDisplay(redditData.queryGeneration.aiInteraction.promptSource.description)}</p>`;
            }
            if (redditData.queryGeneration.aiInteraction.prompt) {
                html += `<details><summary>View Prompt</summary><pre class="debug-prompt">${formatContentForDisplay(redditData.queryGeneration.aiInteraction.prompt)}</pre></details>`;
            }
            if (redditData.queryGeneration.aiInteraction.response) {
                html += `<details><summary>View Response</summary><pre class="debug-response">${formatContentForDisplay(redditData.queryGeneration.aiInteraction.response)}</pre></details>`;
            }
            html += '</details>';
        }
        
        if (redditData.queryGeneration.outputData) {
            html += '<details><summary>View Generated Queries</summary>';
            html += `<pre class="debug-data">${JSON.stringify(redditData.queryGeneration.outputData, null, 2)}</pre>`;
            html += '</details>';
        }
        
        html += '</div>';
    }

    // Subreddit Discovery
    if (redditData.subredditDiscovery) {
        html += '<h5>🔍 Subreddit Discovery:</h5>';
        html += '<div class="debug-subreddit-discovery-detailed">';
        html += `<p><strong>Step:</strong> ${redditData.subredditDiscovery.step}</p>`;
        html += `<p><strong>Timestamp:</strong> ${redditData.subredditDiscovery.timestamp}</p>`;
        html += `<p><strong>Total Subreddits Found:</strong> ${redditData.subredditDiscovery.totalSubredditsFound || 0}</p>`;
        
        // Add logic information
        if (redditData.subredditDiscovery.logic) {
            html += '<details><summary>🔧 Discovery Logic</summary>';
            html += `<p><strong>Description:</strong> ${formatContentForDisplay(redditData.subredditDiscovery.logic.description)}</p>`;
            html += `<p><strong>Source:</strong> <code>${redditData.subredditDiscovery.logic.sourceFile}</code> - <code>${redditData.subredditDiscovery.logic.functionName}</code></p>`;
            html += '<p><strong>Steps:</strong></p><ul>';
            redditData.subredditDiscovery.logic.steps.forEach(step => {
                html += `<li>${formatContentForDisplay(step)}</li>`;
            });
            html += '</ul>';
            html += '</details>';
        }
        
        if (redditData.subredditDiscovery.keywords && redditData.subredditDiscovery.keywords.length > 0) {
            html += '<details><summary>View Keywords Used</summary>';
            html += '<div class="debug-keywords-list">';
            redditData.subredditDiscovery.keywords.forEach((keyword, index) => {
                html += `<div class="debug-keyword-item">
                    <strong>${index + 1}.</strong> ${formatContentForDisplay(keyword)}
                </div>`;
            });
            html += '</div></details>';
        }
        
        if (redditData.subredditDiscovery.discoveredSubreddits && redditData.subredditDiscovery.discoveredSubreddits.length > 0) {
            html += '<details><summary>View Discovered Subreddits</summary>';
            html += '<div class="debug-subreddits-list">';
            redditData.subredditDiscovery.discoveredSubreddits.forEach((subreddit, index) => {
                html += `<div class="debug-subreddit-item">
                    <strong>${index + 1}.</strong> r/${formatContentForDisplay(subreddit.name)}
                    <br><em>${formatContentForDisplay(subreddit.title)}</em>
                    <br><span class="subreddit-meta">Subscribers: ${subreddit.subscribers || 'N/A'}</span>
                </div>`;
            });
            html += '</div></details>';
        }
        
        html += '</div>';
    }

    // Search Executions
    if (redditData.searchExecutions && redditData.searchExecutions.length > 0) {
        html += '<h5>🔍 Reddit Search Executions:</h5>';
        html += '<div class="debug-reddit-search-executions-detailed">';
        redditData.searchExecutions.forEach((execution, index) => {
            html += `<div class="debug-reddit-search-execution-detailed">
                <h6>Search ${index + 1}</h6>
                <p><strong>Step:</strong> ${execution.step}</p>
                <p><strong>Timestamp:</strong> ${execution.timestamp}</p>
                <p><strong>Queries:</strong> ${execution.searchQueries?.length || 0}</p>
                <p><strong>Subreddits:</strong> ${execution.subreddits?.length || 0}</p>
                <p><strong>Time Frame:</strong> ${execution.timeFrame}</p>`;
            
            // Add logic information
            if (execution.logic) {
                html += '<details><summary>🔧 Search Logic</summary>';
                html += `<p><strong>Description:</strong> ${formatContentForDisplay(execution.logic.description)}</p>`;
                html += `<p><strong>Source:</strong> <code>${execution.logic.sourceFile}</code> - <code>${execution.logic.functionName}</code></p>`;
                html += '<p><strong>Steps:</strong></p><ul>';
                execution.logic.steps.forEach(step => {
                    html += `<li>${formatContentForDisplay(step)}</li>`;
                });
                html += '</ul>';
                html += '</details>';
            }
            
            if (execution.searchResults && execution.searchResults.length > 0) {
                html += '<details><summary>View Search Results</summary>';
                html += '<div class="debug-reddit-search-results">';
                execution.searchResults.forEach((result, resultIndex) => {
                    html += `<div class="debug-reddit-search-result">
                        <strong>Query ${resultIndex + 1}:</strong> ${formatContentForDisplay(result.query)}
                        <br><strong>Sitewide Results:</strong> ${result.sitewide_results}
                        <br><strong>Subreddit Results:</strong> ${result.subreddit_results}
                        <br><strong>Total Results:</strong> ${result.total_results}`;
                    
                    if (result.logic) {
                        html += '<details><summary>Query Logic</summary>';
                        html += `<p><strong>Description:</strong> ${formatContentForDisplay(result.logic.description)}</p>`;
                        html += `<p><strong>Source:</strong> <code>${result.logic.sourceFile}</code> - <code>${result.logic.functionName}</code></p>`;
                        html += '<p><strong>Steps:</strong></p><ul>';
                        result.logic.steps.forEach(step => {
                            html += `<li>${formatContentForDisplay(step)}</li>`;
                        });
                        html += '</ul>';
                        html += '</details>';
                    }
                    
                    html += '</div>';
                });
                html += '</div></details>';
            }
            
            if (execution.finalResults) {
                html += '<details><summary>View Final Results</summary>';
                html += `<p><strong>Total Posts Found:</strong> ${execution.finalResults.total_posts_found}</p>`;
                html += `<p><strong>Articles Count:</strong> ${execution.finalResults.articles_count}</p>`;
                html += `<p><strong>Query Type:</strong> ${execution.finalResults.query_type}</p>`;
                if (execution.finalResults.articles && execution.finalResults.articles.length > 0) {
                    html += '<details><summary>View Articles</summary>';
                    html += '<div class="debug-reddit-articles-list">';
                    execution.finalResults.articles.forEach((article, articleIndex) => {
                        html += `<div class="debug-reddit-article-item">
                            <strong>${articleIndex + 1}.</strong> ${formatContentForDisplay(article.title)}
                            <br><em>${article.url}</em>
                            <br>${formatContentForDisplay(article.preview)}
                        </div>`;
                    });
                    html += '</div></details>';
                }
                html += '</details>';
            }
            
            if (execution.error) {
                html += `<p><strong>Error:</strong> ${execution.error}</p>`;
            }
            
            html += '</div>';
        });
        html += '</div>';
    }

    html += '</div>';
    
    output.innerHTML = html;
    console.log('✅ Reddit debug data displayed');
}

function clearRedditDebug() {
    const output = document.getElementById('redditDebugOutput');
    output.innerHTML = 'No reddit data available';
}

async function collectRedditDebugData() {
    try {
        console.log('🔍 Fetching reddit debug data from API...');
        const response = await fetch('/api/systemDebug/reddit-debug');
        const result = await response.json();
        console.log('📊 API response:', result);
        
        if (result.success && result.data) {
            return result.data;
        } else {
            return {
                timestamp: new Date().toISOString(),
                message: 'No reddit debug data available'
            };
        }
    } catch (error) {
        console.error('Error fetching reddit debug data:', error);
        return {
            timestamp: new Date().toISOString(),
            message: 'Error fetching reddit debug data: ' + error.message
        };
    }
}

async function refreshContentBriefsDebug() {
    const output = document.getElementById('contentBriefsDebugOutput');
    output.innerHTML = 'Loading...';
    try {
        const response = await fetch('/api/systemDebug/content-briefs-debug');
        const result = await response.json();
        if (result.success && result.data) {
            output.innerHTML = createContentBriefsDebugTemplate(result.data);
        } else {
            output.innerHTML = result.message || 'No content briefs debug data available';
        }
    } catch (error) {
        output.innerHTML = 'Error loading content briefs debug data: ' + error.message;
    }
}

function clearContentBriefsDebug() {
    const output = document.getElementById('contentBriefsDebugOutput');
    output.innerHTML = 'No content briefs debug data available';
}

async function refreshContentGenerationDebug() {
    const output = document.getElementById('contentGenerationDebugOutput');
    output.innerHTML = 'Loading...';
    try {
        const response = await fetch('/api/systemDebug/content-generation-debug');
        const result = await response.json();
        if (result.success && result.data) {
            output.innerHTML = createContentGenerationDebugTemplate(result.data);
        } else {
            output.innerHTML = result.message || 'No content generation debug data available';
        }
    } catch (error) {
        output.innerHTML = 'Error loading content generation debug data: ' + error.message;
    }
}

function clearContentGenerationDebug() {
    const output = document.getElementById('contentGenerationDebugOutput');
    output.innerHTML = 'No content generation debug data available';
}