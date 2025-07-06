// Website crawling service - All website crawling functionality
const axios = require('axios');
const { callClaudeAPI } = require('./ai');
const { intelligence } = require('../prompts');
const { extractCleanText, extractAllLinks, filterRelevantLinks } = require('./htmlParser');
const systemLogger = require('./systemLogger');

// ENHANCED: Fetch website HTML content with better error handling
async function fetchWebsiteHTML(websiteUrl) {
  try {
    console.log('🌐 Fetching HTML content from:', websiteUrl);
    
    const response = await axios.get(websiteUrl, {
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('✅ Successfully fetched HTML content:', {
      statusCode: response.status,
      contentLength: response.data.length,
      contentType: response.headers['content-type']
    });
    
    return response.data;
    
  } catch (error) {
    console.log('❌ HTML fetch failed for', websiteUrl, ':', error.message);
    throw new Error(`Could not fetch website content: ${error.message}`);
  }
}

// NEW: Simple homepage-only crawling for competitors
async function crawlHomepageOnly(websiteUrl) {
  try {
    console.log('🏠 Starting simple homepage crawl for competitor:', websiteUrl);
    
    // Step 1: Fetch homepage HTML
    const homepageHtml = await fetchWebsiteHTML(websiteUrl);
    const cleanText = extractCleanText(homepageHtml);
    
    console.log('📄 Homepage content extracted:', {
      originalLength: homepageHtml.length,
      cleanLength: cleanText.length,
      compressionRatio: Math.round((1 - cleanText.length / homepageHtml.length) * 100) + '%'
    });
    
    // Step 2: Simple AI analysis (homepage only)
    const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, cleanText);
    const crawlResult = await callClaudeAPI(crawlPrompt, false, null, 'AI: Competitor Homepage Analysis');
    
    console.log('🤖 AI analysis completed for competitor homepage');
    
    // Step 3: Parse JSON response
    let extractedData;
    try {
      const jsonMatch = crawlResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed competitor data');
      } else {
        throw new Error('No JSON structure found in response');
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error for competitor:', parseError);
      // Use fallback data for competitors
      extractedData = createFallbackData(websiteUrl, crawlResult, parseError.message);
    }
    
    // Step 4: Add metadata
    if (!extractedData.company_name || extractedData.company_name === 'Not found' || extractedData.company_name === '') {
      extractedData.company_name = extractCompanyNameFromUrl(websiteUrl);
    }
    
    extractedData.extraction_method = 'homepage_only_competitor';
    extractedData.extraction_timestamp = new Date().toISOString();
    extractedData.pages_analyzed = 1;
    extractedData.pages_selected = 0;
    extractedData.external_pages_analyzed = 0;
    extractedData.total_content_length = cleanText.length;
    
    // Collect debug data for competitor crawl
    const crawlDebugData = {
      step: 'competitor_homepage_crawl',
      timestamp: new Date().toISOString(),
      websiteUrl: websiteUrl,
      rawData: {
        originalHtmlLength: homepageHtml.length,
        cleanTextLength: cleanText.length,
        compressionRatio: Math.round((1 - cleanText.length / homepageHtml.length) * 100) + '%'
      },
      processedData: {
        cleanText: cleanText,
        extractedData: extractedData
      },
      aiInteraction: {
        prompt: crawlPrompt,
        response: crawlResult,
        parsedData: extractedData,
        promptSource: {
          sourceFile: 'prompts/intelligence/websiteCrawling.js',
          functionName: 'mainCrawlPrompt()',
          description: 'AI prompt for single-page business analysis'
        }
      },
      logic: {
        description: 'Simple homepage-only crawl for competitor analysis',
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'crawlHomepageOnly()',
        steps: [
          'Fetch homepage HTML using enhanced fetchWebsiteHTML function',
          'Extract clean text using extractCleanText (preserves business content)',
          'Send to AI for business intelligence extraction',
          'Parse AI response and extract structured data',
          'Add metadata (extraction method, timestamps, content length)',
          'Return extracted competitor data'
        ],
        crawlingMethod: 'homepage_only',
        contentProcessing: 'Same extractCleanText logic as main crawler'
      }
    };
    
    // Store debug data globally for frontend access
    if (typeof global !== 'undefined') {
      if (!global.competitorDebugData) {
        global.competitorDebugData = {
          timestamp: new Date().toISOString(),
          competitorQueries: [],
          searchResults: [],
          competitorUrls: [],
          crawlResults: [],
          aiInteractions: [],
          finalResult: null
        };
      }
      // Add this crawl result to the global debug data
      global.competitorDebugData.crawlResults.push(crawlDebugData);
    }
    
    console.log('✅ Competitor homepage crawl completed:', extractedData.company_name);
    return extractedData;
    
  } catch (error) {
    console.error('❌ Competitor homepage crawl failed:', error.message);
    
    // Store error in debug data
    if (typeof global !== 'undefined' && global.competitorDebugData) {
      global.competitorDebugData.crawlResults.push({
        step: 'competitor_homepage_crawl_error',
        timestamp: new Date().toISOString(),
        websiteUrl: websiteUrl,
        error: error.message,
        logic: {
          description: 'Error during competitor homepage crawl',
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlHomepageOnly()',
          error: error.message
        }
      });
    }
    
    // Return fallback data for competitors
    return createFallbackData(websiteUrl, null, error.message);
  }
}

// ENHANCED: Fetch and analyze multiple pages with flexible 0-10 page selection
async function fetchMultiplePages(websiteUrl, masterId = null) {
  try {
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Crawling: starting multi-page analysis',
      websiteUrl,
      logic: 'Begin enhanced multi-page analysis for the provided URL.',
      next: 'Fetch homepage and additional pages.'
    });
    console.log('🔍 Starting enhanced multi-page analysis for:', websiteUrl);
    
    // Step 1: Fetch and analyze homepage
    const homepageHtml = await fetchWebsiteHTML(websiteUrl);
    const homepageCleanText = extractCleanText(homepageHtml);
    const allLinks = extractAllLinks(homepageHtml, websiteUrl);
    const relevantLinks = filterRelevantLinks(allLinks);
    
    // Collect debug data for homepage analysis
    const homepageDebugData = {
      step: 'homepage_analysis',
      timestamp: new Date().toISOString(),
      rawData: {
        originalHtmlLength: homepageHtml.length,
        cleanTextLength: homepageCleanText.length,
        allLinksFound: allLinks.length,
        relevantLinksFound: relevantLinks.length,
        externalLinks: relevantLinks.filter(l => l.isExternal).length
      },
      processedData: {
        cleanText: homepageCleanText, // Full content
        allLinks: allLinks.map(l => ({ url: l.url, text: l.text, isExternal: l.isExternal, type: l.type, domain: l.domain })),
        relevantLinks: relevantLinks.map(l => ({ url: l.url, text: l.text, isExternal: l.isExternal, type: l.type, domain: l.domain }))
      },
      // Add the logic details
      logic: {
        textCleaning: {
          description: 'Enhanced clean text extraction that preserves ALL business content',
          sourceFile: 'services/htmlParser.js',
          functionName: 'extractCleanText()',
          steps: [
            'Remove script and style elements (non-business content)',
            'Remove HTML comments',
            'Keep ALL navigation, headers, footers, forms (contain business info)',
            'Remove SVG and canvas elements (keep alt text)',
            'Extract alt text from images',
            'Extract placeholder text from inputs',
            'Remove HTML tags while preserving content structure',
            'Decode HTML entities (&nbsp;, &amp;, &lt;, &gt;, &quot;, &#39;)',
            'Clean up whitespace and trim',
            'Add extracted alt texts and placeholders to final content'
          ],
          originalLength: homepageHtml.length,
          cleanLength: homepageCleanText.length,
          compressionRatio: Math.round((1 - homepageCleanText.length / homepageHtml.length) * 100) + '%'
        },
        linkExtraction: {
          description: 'Extract ALL links with minimal filtering - let AI decide what\'s valuable',
          sourceFile: 'services/htmlParser.js',
          functionName: 'extractAllLinks()',
          steps: [
            'Match all anchor tags with href attributes using regex',
            'Extract link text and clean HTML tags from it',
            'Skip only invalid links: javascript:, #, empty text',
            'Convert relative URLs to absolute URLs',
            'Skip fragment URLs (same page sections)',
            'Include ALL domains - no restrictions',
            'Categorize links for AI information (about, services, products, etc.)',
            'Remove duplicate URLs',
            'Mark internal vs external domains'
          ],
          totalLinksFound: allLinks.length,
          uniqueLinks: allLinks.length,
          externalDomains: allLinks.filter(l => l.isExternal).length,
          internalPages: allLinks.filter(l => !l.isExternal).length
        },
        linkFiltering: {
          description: 'NO HARD-CODED FILTERING - Pass all links to AI for decision making',
          sourceFile: 'services/htmlParser.js',
          functionName: 'filterRelevantLinks()',
          steps: [
            'No filtering applied',
            'All extracted links passed to AI',
            'AI will decide which links are valuable for business intelligence',
            'This ensures no valuable business information is lost'
          ],
          linksPassedToAI: relevantLinks.length,
          filteringLogic: 'NO FILTERING - All links passed'
        }
      }
    };
    
    // Store debug data globally for frontend access
    if (typeof global !== 'undefined') {
      if (!global.crawlDebugData) {
        global.crawlDebugData = {
          timestamp: new Date().toISOString(),
          websiteUrl: websiteUrl,
          steps: [],
          rawData: {},
          processedData: {},
          aiInteractions: [],
          finalResult: null
        };
      }
      global.crawlDebugData.homepageAnalysis = homepageDebugData;
    }
    
    console.log('📄 Homepage analysis complete:', {
      originalHtmlLength: homepageHtml.length,
      cleanTextLength: homepageCleanText.length,
      totalLinks: allLinks.length,
      relevantLinks: relevantLinks.length,
      externalLinks: relevantLinks.filter(l => l.isExternal).length
    });
    
    // Step 2: If we have no relevant links, return homepage analysis only
    if (relevantLinks.length === 0) {
      console.log('⚠️ No relevant links found, proceeding with homepage-only analysis');
      return {
        homepageContent: homepageCleanText,
        additionalPages: [],
        analysisMethod: 'homepage_only'
      };
    }
    
    // Step 3: Use AI to select the 0-10 most valuable links
    console.log('🤖 Asking AI to select most valuable links from', relevantLinks.length, 'options');
    const companyName = extractCompanyNameFromUrl(websiteUrl);
    const linkSelectionPrompt = intelligence.linkSelectionPrompt(relevantLinks, companyName, websiteUrl);
    
    // Add prompt source information
    const promptSourceInfo = {
      sourceFile: 'prompts/intelligence/linkSelection.js',
      functionName: 'linkSelectionPrompt()',
      description: 'AI prompt for intelligent link selection based on business value'
    };
    
    // Collect debug data for AI link selection
    const linkSelectionDebugData = {
      step: 'ai_link_selection',
      timestamp: new Date().toISOString(),
      prompt: linkSelectionPrompt,
      relevantLinksCount: relevantLinks.length,
      companyName: companyName,
      promptSource: promptSourceInfo
    };
    
    let selectedLinksData;
    let selectionResponse = null;
    try {
      selectionResponse = await callClaudeAPI(linkSelectionPrompt, false, masterId, 'AI: Link Selection');
      const jsonMatch = selectionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        selectedLinksData = JSON.parse(jsonMatch[0]);
        linkSelectionDebugData.aiResponse = selectionResponse;
        linkSelectionDebugData.parsedData = selectedLinksData;
        linkSelectionDebugData.success = true;
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (aiError) {
      console.log('⚠️ AI link selection failed, using fallback selection:', aiError.message);
      // Fallback: select up to 5 most promising links
      const fallbackCount = Math.min(5, relevantLinks.length);
      selectedLinksData = {
        selected_links: relevantLinks.slice(0, fallbackCount).map(link => ({
          url: link.url,
          text: link.text,
          reasoning: 'Fallback selection due to AI error'
        })),
        total_selected: fallbackCount,
        selection_strategy: 'Fallback - most relevant links due to AI selection error'
      };
      
      linkSelectionDebugData.error = aiError.message;
      linkSelectionDebugData.fallbackUsed = true;
      linkSelectionDebugData.fallbackData = selectedLinksData;
    }
    
    // Store link selection debug data
    if (typeof global !== 'undefined' && global.crawlDebugData) {
      global.crawlDebugData.linkSelection = linkSelectionDebugData;
      // Always add AI interaction, even if no links were selected
      global.crawlDebugData.aiInteractions.push({
        step: 'link_selection',
        timestamp: new Date().toISOString(),
        prompt: linkSelectionPrompt,
        response: selectionResponse || 'No response (fallback used)',
        parsedData: selectedLinksData,
        promptSource: promptSourceInfo
      });
    }
    
    console.log('🎯 AI selected', selectedLinksData.total_selected, 'links:', 
      selectedLinksData.selected_links.map(l => `${l.text} (${l.url.includes(new URL(websiteUrl).hostname) ? 'internal' : 'external'})`));
    
    // Step 4: Fetch content from selected pages (handle both internal and external)
    const additionalPages = [];
    const pageCrawlDebugData = {
      step: 'page_crawling',
      timestamp: new Date().toISOString(),
      selectedLinks: selectedLinksData.selected_links,
      crawledPages: [],
      logic: {
        description: 'Post-AI crawling of selected pages using same enhanced logic as homepage',
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'fetchMultiplePages() - page crawling loop',
        steps: [
          'For each AI-selected link:',
          '  - Fetch HTML content using same enhanced fetchWebsiteHTML function',
          '  - Apply same extractCleanText logic (preserve ALL business content)',
          '  - Handle both internal and external domains',
          '  - Continue crawling even if one page fails (don\'t fail entire process)',
          '  - Store full content and metadata for each page',
          '  - Track success/failure status for each page'
        ],
        crawlingMethod: 'enhanced_multi_page_crawling',
        errorHandling: 'Continue on individual page failures',
        contentProcessing: 'Same extractCleanText logic as homepage'
      }
    };
    
    for (const selectedLink of selectedLinksData.selected_links) {
      try {
        console.log('📄 Fetching page:', selectedLink.text, '→', selectedLink.url);
        
        // ENHANCEMENT: Handle external domains
        const linkDomain = new URL(selectedLink.url).hostname;
        const baseDomain = new URL(websiteUrl).hostname;
        const isExternal = linkDomain !== baseDomain;
        
        const pageHtml = await fetchWebsiteHTML(selectedLink.url);
        const pageCleanText = extractCleanText(pageHtml);
        
        const pageData = {
          url: selectedLink.url,
          title: selectedLink.text,
          content: pageCleanText,
          reasoning: selectedLink.reasoning,
          contentLength: pageCleanText.length,
          isExternal: isExternal,
          domain: linkDomain
        };
        
        additionalPages.push(pageData);
        
        // Add to debug data
        pageCrawlDebugData.crawledPages.push({
          url: selectedLink.url,
          title: selectedLink.text,
          originalHtmlLength: pageHtml.length,
          cleanTextLength: pageCleanText.length,
          isExternal: isExternal,
          domain: linkDomain,
          success: true,
          content: pageCleanText // Full content
        });
        
        console.log('✅ Successfully processed page:', selectedLink.text, 
          '(', pageCleanText.length, 'chars,', isExternal ? 'external' : 'internal', ')');
        
      } catch (pageError) {
        console.log('⚠️ Failed to fetch page:', selectedLink.url, '→', pageError.message);
        // Continue with other pages - don't fail entire process for one bad link
        const failedPageData = {
          url: selectedLink.url,
          title: selectedLink.text,
          content: `Failed to fetch content: ${pageError.message}`,
          reasoning: selectedLink.reasoning,
          contentLength: 0,
          isExternal: new URL(selectedLink.url).hostname !== new URL(websiteUrl).hostname,
          domain: new URL(selectedLink.url).hostname,
          error: true
        };
        
        additionalPages.push(failedPageData);
        
        // Add to debug data
        pageCrawlDebugData.crawledPages.push({
          url: selectedLink.url,
          title: selectedLink.text,
          error: true,
          errorMessage: pageError.message,
          isExternal: new URL(selectedLink.url).hostname !== new URL(websiteUrl).hostname,
          domain: new URL(selectedLink.url).hostname,
          success: false
        });
      }
    }
    
    // Store page crawling debug data
    if (typeof global !== 'undefined' && global.crawlDebugData) {
      global.crawlDebugData.pageCrawling = pageCrawlDebugData;
    }
    
    console.log('🎉 Enhanced multi-page crawling complete:', {
      homepageLength: homepageCleanText.length,
      additionalPages: additionalPages.length,
      successfulPages: additionalPages.filter(p => !p.error).length,
      externalPages: additionalPages.filter(p => p.isExternal && !p.error).length,
      totalContent: homepageCleanText.length + additionalPages.reduce((sum, page) => sum + (page.error ? 0 : page.contentLength), 0)
    });
    
    return {
      homepageContent: homepageCleanText,
      additionalPages: additionalPages,
      analysisMethod: 'enhanced_multi_page_analysis',
      selectionStrategy: selectedLinksData.selection_strategy,
      pagesSelected: selectedLinksData.total_selected
    };
    
  } catch (error) {
    console.error('❌ Enhanced multi-page crawling failed:', error.message);
    throw error;
  }
}

// ENHANCED: Main website crawling function with flexible page support (FOR MAIN BUSINESS ONLY)
async function crawlWebsite(websiteUrl, masterId = null) {
  // Initialize debug data collection
  const debugData = {
    timestamp: new Date().toISOString(),
    websiteUrl: websiteUrl,
    steps: [],
    rawData: {},
    processedData: {},
    aiInteractions: [],
    finalResult: null
  };
  
  try {
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Crawling: started',
      websiteUrl,
      logic: 'Begin enhanced website crawl for the provided URL.',
      next: 'Try enhanced multi-page crawling.'
    });
    
    debugData.steps.push({
      step: 'crawl_started',
      timestamp: new Date().toISOString(),
      websiteUrl: websiteUrl
    });
    
    let crawlResult;
    let crawlData;
    // Step 1: Try enhanced multi-page crawling (0-10 pages)
    try {
      crawlData = await fetchMultiplePages(websiteUrl, masterId);
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: multi-page analysis complete',
        crawlData,
        logic: 'Fetched homepage and additional pages, applied link selection and AI analysis.',
        next: 'Prepare prompt for AI multi-page analysis.'
      });
      // Create comprehensive prompt with all page content
      let combinedContent = `HOMEPAGE CONTENT:\n${crawlData.homepageContent}\n\n`;
      if (crawlData.additionalPages.length > 0) {
        combinedContent += 'ADDITIONAL PAGES:\n';
        crawlData.additionalPages.forEach((page, index) => {
          if (!page.error) {
            combinedContent += `\nPage ${index + 1}: ${page.title} ${page.isExternal ? '(External Domain: ' + page.domain + ')' : '(Internal Page)'}\nURL: ${page.url}\nContent: ${page.content}\n`;
          } else {
            combinedContent += `\nPage ${index + 1}: ${page.title} (Failed to fetch from ${page.domain})\n`;
          }
        });
      }
      const enhancedCrawlPrompt = intelligence.multiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData);
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: AI multi-page analysis prompt',
        prompt: enhancedCrawlPrompt,
        logic: 'Prompt constructed for AI multi-page analysis.',
        next: 'Send prompt to AI.'
      });
      crawlResult = await callClaudeAPI(enhancedCrawlPrompt, false, masterId, 'AI: Multi-Page Analysis');
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: AI multi-page analysis result',
        aiResponse: crawlResult,
        logic: 'AI response received for multi-page analysis.',
        next: 'Parse AI response.'
      });
    } catch (multiPageError) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: multi-page analysis failed',
        error: multiPageError.message,
        logic: 'Enhanced multi-page crawling failed, falling back to single page.',
        next: 'Try single page fallback.'
      });
      // Fallback: Try single page with clean text extraction
      try {
        const singlePageHtml = await fetchWebsiteHTML(websiteUrl);
        const cleanText = extractCleanText(singlePageHtml);
        const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, cleanText);
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: single page analysis prompt',
          prompt: crawlPrompt,
          logic: 'Prompt constructed for AI single page analysis.',
          next: 'Send prompt to AI.'
        });
        crawlResult = await callClaudeAPI(crawlPrompt, false, masterId, 'AI: Single Page Analysis');
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: AI single page analysis result',
          aiResponse: crawlResult,
          logic: 'AI response received for single page analysis.',
          next: 'Parse AI response.'
        });
        crawlData = {
          homepageContent: cleanText,
          additionalPages: [],
          analysisMethod: 'single_page_fallback',
          pagesSelected: 0
        };
      } catch (singlePageError) {
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: single page analysis failed',
          error: singlePageError.message,
          logic: 'Single-page fallback failed, using URL-only analysis.',
          next: 'Try URL-only fallback.'
        });
        // Final fallback: URL-based analysis
        const fallbackPrompt = intelligence.fallbackCrawlPrompt(websiteUrl);
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: URL-only analysis prompt',
          prompt: fallbackPrompt,
          logic: 'Prompt constructed for AI URL-only analysis.',
          next: 'Send prompt to AI.'
        });
        crawlResult = await callClaudeAPI(fallbackPrompt, false, masterId, 'AI: URL-Only Analysis');
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: AI URL-only analysis result',
          aiResponse: crawlResult,
          logic: 'AI response received for URL-only analysis.',
          next: 'Parse AI response.'
        });
        crawlData = {
          homepageContent: '',
          additionalPages: [],
          analysisMethod: 'url_only_fallback',
          pagesSelected: 0
        };
      }
    }
    // Store AI interaction for final analysis
    let finalAnalysisPrompt;
    let finalAnalysisPromptSource;
    
    if (crawlData.analysisMethod === 'enhanced_multi_page_analysis') {
      // Create comprehensive prompt with all page content
      let combinedContent = `HOMEPAGE CONTENT:\n${crawlData.homepageContent}\n\n`;
      if (crawlData.additionalPages.length > 0) {
        combinedContent += 'ADDITIONAL PAGES:\n';
        crawlData.additionalPages.forEach((page, index) => {
          if (!page.error) {
            combinedContent += `\nPage ${index + 1}: ${page.title} ${page.isExternal ? '(External Domain: ' + page.domain + ')' : '(Internal Page)'}\nURL: ${page.url}\nContent: ${page.content}\n`;
          } else {
            combinedContent += `\nPage ${index + 1}: ${page.title} (Failed to fetch from ${page.domain})\n`;
          }
        });
      }
      finalAnalysisPrompt = intelligence.multiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData);
      finalAnalysisPromptSource = {
        sourceFile: 'prompts/intelligence/websiteCrawling.js',
        functionName: 'multiPageAnalysisPrompt()',
        description: 'AI prompt for comprehensive multi-page business analysis'
      };
    } else if (crawlData.analysisMethod === 'single_page_fallback') {
      finalAnalysisPrompt = intelligence.mainCrawlPrompt(websiteUrl, crawlData.homepageContent);
      finalAnalysisPromptSource = {
        sourceFile: 'prompts/intelligence/websiteCrawling.js',
        functionName: 'mainCrawlPrompt()',
        description: 'AI prompt for single-page business analysis'
      };
    } else {
      finalAnalysisPrompt = intelligence.fallbackCrawlPrompt(websiteUrl);
      finalAnalysisPromptSource = {
        sourceFile: 'prompts/intelligence/websiteCrawling.js',
        functionName: 'fallbackCrawlPrompt()',
        description: 'AI prompt for URL-only business analysis'
      };
    }
    
    // Add final analysis logic details
    const finalAnalysisLogic = {
      description: 'Consolidate all crawled data and extract comprehensive business intelligence',
      sourceFile: 'services/websiteCrawler.js',
      functionName: 'crawlWebsite() - final analysis section',
      steps: [
        'Combine homepage content with all additional page content',
        'Create comprehensive prompt with all available business information',
        'Send consolidated data to AI for business intelligence extraction',
        'Parse AI response to extract structured business data',
        'Add metadata (extraction method, timestamps, page counts)',
        'Store final result for Business Profile sections'
      ],
      dataUsage: {
        businessSetupSection: [
          'Company Name',
          'Business Description', 
          'Value Proposition',
          'Main Product/Service',
          'Pricing Information',
          'Business Stage',
          'Industry Category',
          'Team Size',
          'Funding Information',
          'Company Mission',
          'Team Background'
        ],
        strategicIntelligenceSection: [
          'Target Customer',
          'Key Features',
          'Unique Selling Points',
          'Competitors Mentioned',
          'Recent Updates',
          'Social Media Presence',
          'Additional Notes'
        ]
      }
    };
    
    debugData.aiInteractions.push({
      step: 'final_analysis',
      timestamp: new Date().toISOString(),
      prompt: finalAnalysisPrompt,
      response: crawlResult,
      parsedData: null, // Will be set after parsing
      promptSource: finalAnalysisPromptSource,
      logic: finalAnalysisLogic
    });
    
    // Parse JSON response
    let extractedData;
    try {
      const jsonMatch = crawlResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        // Update the parsed data in the AI interaction
        debugData.aiInteractions[debugData.aiInteractions.length - 1].parsedData = extractedData;
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: parsed AI response',
          extractedData,
          logic: 'Extracted JSON from AI crawl response.',
          next: 'Return extracted data.'
        });
      } else {
        throw new Error('No JSON structure found in response');
      }
    } catch (parseError) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: JSON parse error',
        error: parseError.message,
        logic: 'Failed to extract JSON from AI crawl response.',
        next: 'Return fallback data.'
      });
      extractedData = createFallbackData(websiteUrl, crawlResult, parseError.message);
    }
    // Add enhanced metadata
    extractedData.extraction_method = crawlData.analysisMethod;
    extractedData.extraction_timestamp = new Date().toISOString();
    extractedData.pages_analyzed = 1 + (crawlData.additionalPages ? crawlData.additionalPages.filter(p => !p.error).length : 0);
    extractedData.pages_selected = crawlData.pagesSelected || 0;
    extractedData.external_pages_analyzed = crawlData.additionalPages ? crawlData.additionalPages.filter(p => p.isExternal && !p.error).length : 0;
    extractedData.total_content_length = crawlData.homepageContent.length + 
      (crawlData.additionalPages ? crawlData.additionalPages.reduce((sum, page) => sum + (page.error ? 0 : page.contentLength), 0) : 0);
    if (crawlData.selectionStrategy) {
      extractedData.ai_selection_strategy = crawlData.selectionStrategy;
    }
    
    // Collect final debug data
    debugData.finalResult = extractedData;
    debugData.steps.push({
      step: 'crawl_completed',
      timestamp: new Date().toISOString()
    });
    
    // Store raw and processed data
    debugData.rawData = {
      homepageContent: crawlData.homepageContent,
      additionalPages: crawlData.additionalPages,
      analysisMethod: crawlData.analysisMethod
    };
    
    debugData.processedData = {
      extractedData: extractedData,
      crawlResult: crawlResult
    };
    
    // Store debug data globally for frontend access
    if (typeof global !== 'undefined') {
      // Preserve any existing AI interactions from link selection
      if (global.crawlDebugData && global.crawlDebugData.aiInteractions) {
        debugData.aiInteractions = [...global.crawlDebugData.aiInteractions, ...debugData.aiInteractions];
      }
      // Preserve link selection and page crawling data
      if (global.crawlDebugData) {
        debugData.linkSelection = global.crawlDebugData.linkSelection;
        debugData.pageCrawling = global.crawlDebugData.pageCrawling;
        debugData.homepageAnalysis = global.crawlDebugData.homepageAnalysis;
      }
      global.crawlDebugData = debugData;
    }
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Crawling: complete',
      extractedData,
      logic: 'Final extracted data from crawling.',
      next: 'Return to business profile flow.'
    });
    return extractedData;
  } catch (error) {
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Crawling: error',
      error: error.message,
      logic: 'Unhandled error during crawling.',
      next: 'Return fallback data.'
    });
    return createFallbackData(websiteUrl, null, error.message);
  }
}

// HELPER FUNCTION: Create fallback data when parsing fails
function createFallbackData(websiteUrl, rawResponse = null, errorMessage = null) {
  console.log('🔧 Creating fallback data for:', websiteUrl);
  
  const companyName = extractCompanyNameFromUrl(websiteUrl);
  
  // Try to infer some information from the URL
  const urlLower = websiteUrl.toLowerCase();
  let industryGuess = 'Not found';
  let serviceGuess = 'Not found';
  let features = [];
  
  // Basic URL analysis for common patterns
  if (urlLower.includes('photo') || urlLower.includes('image') || urlLower.includes('pic')) {
    industryGuess = 'Photography/Image';
    serviceGuess = 'Image or photography related service';
    features.push('Image processing');
  }
  
  if (urlLower.includes('ai') || urlLower.includes('artificial')) {
    industryGuess = 'AI/Technology';
    if (serviceGuess === 'Not found') serviceGuess = 'AI-powered service';
    features.push('AI-powered');
  }
  
  if (urlLower.includes('app') || urlLower.includes('software')) {
    if (industryGuess === 'Not found') industryGuess = 'Software';
    if (serviceGuess === 'Not found') serviceGuess = 'Software application';
  }
  
  const fallbackData = {
    company_name: companyName,
    business_description: serviceGuess,
    value_proposition: 'Not found',
    target_customer: 'Not found',
    main_product_service: serviceGuess,
    key_features: features,
    pricing_info: 'Not found',
    business_stage: 'Unknown',
    industry_category: industryGuess,
    competitors_mentioned: [],
    unique_selling_points: [],
    team_size: 'Not found',
    recent_updates: 'Not found',
    social_media: {
      twitter: '',
      linkedin: '',
      other: []
    },
    funding_info: 'Not found',
    company_mission: 'Not found',
    team_background: 'Not found',
    additional_notes: errorMessage ? `Error: ${errorMessage}` : 'Information extracted from URL analysis',
    extraction_method: 'fallback_analysis',
    extraction_timestamp: new Date().toISOString(),
    pages_analyzed: 0,
    pages_selected: 0,
    external_pages_analyzed: 0,
    total_content_length: 0
  };
  
  // If we have raw response, try to extract any useful information
  if (rawResponse) {
    fallbackData.raw_response = rawResponse.substring(0, 500); // Store first 500 chars for debugging
    fallbackData.additional_notes += '. Raw response available for manual review.';
  }
  
  return fallbackData;
}

// HELPER FUNCTION: Extract company name from URL
function extractCompanyNameFromUrl(url) {
  try {
    const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const domain = cleanUrl.split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return 'Unknown Company';
  }
}

module.exports = {
  fetchWebsiteHTML,
  crawlWebsite,
  crawlHomepageOnly,
  fetchMultiplePages,
  createFallbackData,
  extractCompanyNameFromUrl
};