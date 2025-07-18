// Website crawling service - All website crawling functionality
const axios = require('axios');
const { callClaudeAPI } = require('./ai');
const { intelligence } = require('../prompts');
const { extractCleanText, extractAllLinks, filterRelevantLinks } = require('./htmlParser');
const { extractDesignAssets } = require('./designExtractor'); // NEW IMPORT
const systemLogger = require('./systemLogger');
const { cleanupDesignAssets, getCompanyIdentifier } = require('./designExtractor');

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

// // UPDATED: Enhanced homepage crawling for competitors (EXACT SAME STEPS as self website)
async function crawlHomepageOnly(websiteUrl) {
  try {
    console.log('🏠 Starting enhanced homepage crawl for competitor:', websiteUrl);
    
    // ========== EXACT SAME HOMEPAGE DATA STRUCTURING STEPS ==========
    
    // Step 1: Fetch homepage HTML
    const homepageHtml = await fetchWebsiteHTML(websiteUrl);
    
    // Step 2: Extract clean text from homepage
    let homepageCleanText = extractCleanText(homepageHtml);
    
    // Step 3: Extract ALL links from homepage
    const allLinks = extractAllLinks(homepageHtml, websiteUrl);
    
    // Step 4: Filter relevant links (actually no filtering - passes all)
    const relevantLinks = filterRelevantLinks(allLinks);
    
    // Step 5: Format links into structured text data
    const homepageStructuredLinks = formatStructuredLinks(relevantLinks, websiteUrl);
    
    // Step 6: Append structured links to homepage content
    homepageCleanText += homepageStructuredLinks;
    
    // ========== END OF EXACT SAME STEPS ==========
    
    console.log('📄 Enhanced homepage content extracted:', {
      originalLength: homepageHtml.length,
      cleanLength: homepageCleanText.length,
      linksFound: allLinks.length,
      relevantLinks: relevantLinks.length,
      externalLinks: relevantLinks.filter(l => l.isExternal).length,
      compressionRatio: Math.round((1 - homepageCleanText.length / homepageHtml.length) * 100) + '%'
    });
    
    // Step 7: AI analysis with enhanced structured content (homepage + links)
    const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, homepageCleanText);
    const crawlResult = await callClaudeAPI(crawlPrompt, false);

    // Step 8: Parse result (same as before)
    let extractedData;
    try {
      extractedData = JSON.parse(crawlResult);
    } catch (parseError) {
      console.log('❌ JSON parsing failed for competitor crawl, creating fallback data');
      extractedData = createFallbackData(websiteUrl, crawlResult, 'JSON parsing failed');
    }

    // Step 9: Add AI interaction details for debug (same as before)
    extractedData.aiInteraction = {
      prompt: crawlPrompt,
      response: crawlResult,
      promptSource: {
        sourceFile: 'prompts/intelligence/websiteCrawling.js',
        functionName: 'mainCrawlPrompt()',
        description: 'AI prompt for enhanced single-page business analysis with structured links'
      },
      logic: {
        description: 'Enhanced single-page AI analysis of competitor homepage with structured links',
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'crawlHomepageOnly()',
        steps: [
          'Fetch homepage HTML',
          'Extract and clean text',
          'Extract ALL links from homepage',
          'Filter relevant links (passes all)',
          'Format links into structured text data',
          'Append structured links to content',
          'Build prompt for AI business analysis',
          'Send enhanced structured content to Claude API',
          'Parse AI response for business data'
        ]
      }
    };

    // Step 10: Store additional metadata for competitor analysis (enhanced)
    extractedData.crawlDebugData = {
      websiteUrl: websiteUrl,
      analysisMethod: 'competitor_homepage_enhanced_with_structured_links',
      timestamp: new Date().toISOString(),
      originalHtmlLength: homepageHtml.length,
      cleanTextLength: homepageCleanText.length,
      linksExtracted: allLinks.length,
      relevantLinksFound: relevantLinks.length,
      externalLinksFound: relevantLinks.filter(l => l.isExternal).length,
      internalLinksFound: relevantLinks.filter(l => !l.isExternal).length,
      compressionRatio: Math.round((1 - homepageCleanText.length / homepageHtml.length) * 100) + '%',
      contentStructure: {
        hasCleanText: true,
        hasStructuredLinks: relevantLinks.length > 0,
        linkCategories: {
          internal: relevantLinks.filter(l => !l.isExternal).length,
          external: relevantLinks.filter(l => l.isExternal).length
        }
      }
    };

    console.log('✅ Enhanced competitor homepage crawl completed:', extractedData.company_name || 'Unknown company');
    
    return extractedData;
    
  } catch (error) {
    console.error('❌ Enhanced competitor homepage crawl failed:', error.message);
    throw error;
  }
}

// ENHANCED: Filter duplicate footer/navigation content
function filterDuplicateFooterContent(pageContent, homepageLines) {
  try {
    const pageLines = pageContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const filtered = [];
    
    for (const line of pageLines) {
      let isDuplicate = false;
      
      // Skip very short lines (likely not meaningful content)
      if (line.length < 10) {
        filtered.push(line);
        continue;
      }
      
      // Check for similarity with homepage lines
      for (const homepageLine of homepageLines) {
        if (homepageLine.length < 10) continue;
        
        const lineNormalized = line.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const homepageLineNormalized = homepageLine.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        if (lineNormalized === homepageLineNormalized) {
          isDuplicate = true;
          break;
        }
        
        // Check for substantial overlap
        if (lineNormalized.length > 20 && homepageLineNormalized.length > 20) {
          const shorter = lineNormalized.length <= homepageLineNormalized.length ? lineNormalized : homepageLineNormalized;
          const longer = lineNormalized.length >= homepageLineNormalized.length ? lineNormalized : homepageLineNormalized;
          
          if (longer.includes(shorter)) {
            const overlapRatio = shorter.length / longer.length;
            if (overlapRatio > 0.8) {
              isDuplicate = true;
              break;
            }
          }
        }
      }
      
      if (!isDuplicate) {
        filtered.push(line);
      }
    }
    
    const removedLines = pageLines.length - filtered.length;
    if (removedLines > 0) {
      console.log(`🧹 Footer filtering: removed ${removedLines} duplicate lines`);
    }
    
    return filtered.join('\n');
    
  } catch (error) {
    console.error('Error in filterDuplicateFooterContent:', error.message);
    return pageLines.join('\n'); // Return original if filtering fails
  }
}

// NEW: Format links as structured data
function formatStructuredLinks(links, pageUrl) {
  try {
    if (!links || links.length === 0) {
      return '';
    }
    
    const internalLinks = links.filter(link => !link.isExternal);
    const externalLinks = links.filter(link => link.isExternal);
    
    let structured = '\n\n--- PAGE LINKS ---\n';
    
    if (internalLinks.length > 0) {
      structured += '\nInternal Links:\n';
      internalLinks.forEach((link, index) => {
        structured += `${index + 1}. "${link.text}" → ${link.url}\n`;
      });
    }
    
    if (externalLinks.length > 0) {
      structured += '\nExternal Links:\n';
      externalLinks.forEach((link, index) => {
        structured += `${index + 1}. "${link.text}" → ${link.url} (${link.domain})\n`;
      });
    }
    
    structured += '\n--- END PAGE LINKS ---\n';
    
    return structured;
    
  } catch (error) {
    console.error('Error in formatStructuredLinks:', error.message);
    return '';
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
    let homepageCleanText = extractCleanText(homepageHtml);
    
    // ENHANCEMENT: Extract and add structured links for homepage  
    const allLinks = extractAllLinks(homepageHtml, websiteUrl);
    const relevantLinks = filterRelevantLinks(allLinks);
    const homepageStructuredLinks = formatStructuredLinks(relevantLinks, websiteUrl);
    homepageCleanText += homepageStructuredLinks;
    
    // Track all links seen so far for cross-page deduplication
    const allSeenLinks = new Set(relevantLinks.map(link => link.url));
    
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
    
    // If no relevant links found, return homepage-only analysis
    if (relevantLinks.length === 0) {
      console.log('⚠️ No relevant links found, proceeding with homepage-only analysis');
      return {
        homepageContent: homepageCleanText,
        additionalPages: [],
        analysisMethod: 'homepage_only_no_relevant_links',
        selectionStrategy: 'no_links_available',
        pagesSelected: 0
      };
    }
    
    // Step 2: Log AI interaction for debug
    const linkSelectionDebugData = {
      step: 'ai_link_selection',
      timestamp: new Date().toISOString(),
      inputData: {
        totalLinksAvailable: relevantLinks.length,
        linksToAnalyze: relevantLinks.map(l => ({ url: l.url, text: l.text, type: l.type, isExternal: l.isExternal }))
      },
      logic: {
        description: 'AI-powered intelligent link selection for business intelligence gathering',
        sourceFile: 'prompts/intelligence/linkSelection.js',
        functionName: 'linkSelectionPrompt()',
        steps: [
          'Present all extracted links to Claude AI',
          'AI evaluates each link for business intelligence value',
          'AI considers: About pages, pricing, products, team info, case studies',
          'AI selects 0-10 most valuable links based on business context',
          'AI provides reasoning for each selected link',
          'AI avoids selecting low-value pages (generic contact forms, privacy policies)'
        ],
        selectionCriteria: 'Business intelligence value, content uniqueness, strategic importance'
      }
    };
    
    // Store AI interaction debug data
    if (typeof global !== 'undefined' && global.crawlDebugData) {
      global.crawlDebugData.linkSelection = linkSelectionDebugData;
    }
    
    // Step 3: Ask AI to select most valuable links (0-10 links)
    console.log('🤖 Asking AI to select most valuable links from', relevantLinks.length, 'options');
    console.log('🔗 Links being sent to AI:');
    relevantLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. "${link.text}" → ${link.url} [${link.isExternal ? 'EXTERNAL' : 'INTERNAL'}]`);
    });
    const companyName = extractCompanyNameFromUrl(websiteUrl);
    const linkSelectionPrompt = intelligence.linkSelectionPrompt(relevantLinks, companyName, websiteUrl);
    const linkSelectionResult = await callClaudeAPI(linkSelectionPrompt, false);
    console.log('🤖 AI raw response:', linkSelectionResult);
    
    let selectedLinksData;
    try {
      selectedLinksData = JSON.parse(linkSelectionResult);
    } catch (parseError) {
      console.log('❌ Link selection parsing failed, proceeding with homepage only');
      return {
        homepageContent: homepageCleanText,
        additionalPages: [],
        analysisMethod: 'homepage_only_ai_selection_failed',
        selectionStrategy: 'ai_parsing_failed',
        pagesSelected: 0
      };
    }
    
    // Update debug data with AI response
    linkSelectionDebugData.outputData = {
      aiResponse: linkSelectionResult,
      selectedLinks: selectedLinksData.selected_links || [],
      totalSelected: selectedLinksData.total_selected || 0,
      selectionStrategy: selectedLinksData.selection_strategy || 'unknown'
    };
    
    if (!selectedLinksData.selected_links || selectedLinksData.selected_links.length === 0) {
      console.log('ℹ️ AI selected 0 additional links, proceeding with homepage-only analysis');
      return {
        homepageContent: homepageCleanText,
        additionalPages: [],
        analysisMethod: 'homepage_only_ai_selected_none',
        selectionStrategy: selectedLinksData.selection_strategy || 'ai_selected_none',
        pagesSelected: 0
      };
    }
    
    console.log('🎯 AI selected', selectedLinksData.selected_links.length, 'links:', 
      selectedLinksData.selected_links.map(l => `${l.text} (${l.isExternal ? 'external' : 'internal'})`));
    
    // ENHANCEMENT: Prevent re-crawling already processed URLs
    const alreadyCrawledUrls = new Set([new URL(websiteUrl).href]); // Homepage already crawled
    console.log('🔍 Validating selected links against already crawled URLs...');
    
    const originalCount = selectedLinksData.selected_links.length;
    selectedLinksData.selected_links = selectedLinksData.selected_links.filter(link => {
      try {
        const linkUrl = new URL(link.url).href;
        if (alreadyCrawledUrls.has(linkUrl)) {
          console.log(`🚫 Skipping already crawled URL: "${link.text}" → ${link.url}`);
          return false;
        }
        return true;
      } catch (urlError) {
        console.log(`🚫 Skipping invalid URL: "${link.text}" → ${link.url}`);
        return false;
      }
    });
    
    const filteredCount = selectedLinksData.selected_links.length;
    if (originalCount > filteredCount) {
      console.log(`🔄 URL deduplication: ${originalCount} → ${filteredCount} links after removing duplicates`);
    }

    if (selectedLinksData.selected_links.length === 0) {
      console.log('ℹ️ No valid additional links after URL deduplication, proceeding with homepage-only analysis');
      return {
        homepageContent: homepageCleanText,
        additionalPages: [],
        analysisMethod: 'homepage_only_after_url_deduplication',
        selectionStrategy: selectedLinksData.selection_strategy || 'no_unique_urls_selected',
        pagesSelected: 0
      };
    }
    
    console.log('✅ Final validated links:', selectedLinksData.selected_links.map(l => `${l.text} → ${l.url}`));
    
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
          '  - Filter duplicate footer/navigation content (not present on homepage)',
          '  - Extract and format structured links from each page',
          '  - Handle both internal and external domains',
          '  - Continue crawling even if one page fails (don\'t fail entire process)',
          '  - Store full content and metadata for each page',
          '  - Track success/failure status for each page'
        ],
        crawlingMethod: 'enhanced_multi_page_crawling_with_footer_filtering',
        errorHandling: 'Continue on individual page failures',
        contentProcessing: 'Same extractCleanText logic as homepage + footer filtering + structured links'
      }
    };
    
    // Prepare homepage lines for footer filtering comparison
    const homepageLines = homepageCleanText.split('\n');
    
    for (const selectedLink of selectedLinksData.selected_links) {
      try {
        console.log('📄 Fetching page:', selectedLink.text, '→', selectedLink.url);
        
        // Add to crawled URLs set to prevent future duplicates
        alreadyCrawledUrls.add(new URL(selectedLink.url).href);
        
        // ENHANCEMENT: Handle external domains
        const linkDomain = new URL(selectedLink.url).hostname;
        const baseDomain = new URL(websiteUrl).hostname;
        const isExternal = linkDomain !== baseDomain;
        
        const pageHtml = await fetchWebsiteHTML(selectedLink.url);
        let pageCleanText = extractCleanText(pageHtml, { skipFooterNav: !isExternal });
        
        // ENHANCEMENT: Filter duplicate footer/navigation content (not for external domains)
        if (!isExternal) {
          const originalLength = pageCleanText.length;
          pageCleanText = filterDuplicateFooterContent(pageCleanText, homepageLines);
          console.log(`🧹 Filtered duplicate content: ${originalLength} → ${pageCleanText.length} chars`);
        }
        
        // ENHANCEMENT: Extract and add page-specific structured links
        const pageLinks = extractAllLinks(pageHtml, selectedLink.url);
        const pageRelevantLinks = filterRelevantLinks(pageLinks);
        
        // ENHANCEMENT: Avoid duplicate links we've already seen
        const newLinks = pageRelevantLinks.filter(link => !allSeenLinks.has(link.url));
        newLinks.forEach(link => allSeenLinks.add(link.url));
        
        if (newLinks.length > 0) {
          const pageStructuredLinks = formatStructuredLinks(newLinks, selectedLink.url);
          pageCleanText += pageStructuredLinks;
          console.log(`🔗 Added ${newLinks.length} new links from page: ${selectedLink.text}`);
        }
        
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
          contentLength: pageCleanText.length,
          isExternal: isExternal,
          domain: linkDomain,
          reasoning: selectedLink.reasoning,
          newLinksFound: newLinks.length,
          success: true
        });
        
        console.log(`✅ Successfully crawled: "${selectedLink.text}" (${pageCleanText.length} chars, ${isExternal ? 'external' : 'internal'})`);
        
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
  // Initialize URL-specific design assets cache
if (!global.designAssetsCache) {
  global.designAssetsCache = {};
}
const urlCacheKey = getCompanyIdentifier(websiteUrl);
// Clear cache for this specific URL for fresh extraction
global.designAssetsCache[urlCacheKey] = null;
  
  // Clean up old assets for this company before starting new extraction
  
  const companyIdentifier = getCompanyIdentifier(websiteUrl);
  await cleanupDesignAssets(companyIdentifier);
  console.log(`🧹 Cleaned up old assets for: ${companyIdentifier}`);
  
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
      // --- HOMEPAGE ANALYSIS & LINK EXTRACTION ---
      crawlData = await fetchMultiplePages(websiteUrl, masterId);
      // Push homepage analysis step
      if (typeof global !== 'undefined' && global.crawlDebugData && global.crawlDebugData.homepageAnalysis) {
        debugData.steps.push({
          step: 'homepage_analysis',
          timestamp: global.crawlDebugData.homepageAnalysis.timestamp,
          rawData: global.crawlDebugData.homepageAnalysis.rawData,
          processedData: global.crawlDebugData.homepageAnalysis.processedData,
          logic: global.crawlDebugData.homepageAnalysis.logic,
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'fetchMultiplePages()'
        });
      }
      // Push AI link selection step
      if (typeof global !== 'undefined' && global.crawlDebugData && global.crawlDebugData.linkSelection) {
        debugData.steps.push({
          step: 'ai_link_selection',
          timestamp: global.crawlDebugData.linkSelection.timestamp,
          inputData: global.crawlDebugData.linkSelection.inputData,
          logic: global.crawlDebugData.linkSelection.logic,
          outputData: global.crawlDebugData.linkSelection.outputData,
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'fetchMultiplePages()'
        });
      }
      // Push page crawling step
      if (typeof global !== 'undefined' && global.crawlDebugData && global.crawlDebugData.pageCrawling) {
        debugData.steps.push({
          step: 'page_crawling',
          timestamp: global.crawlDebugData.pageCrawling.timestamp,
          selectedLinks: global.crawlDebugData.pageCrawling.selectedLinks,
          crawledPages: global.crawlDebugData.pageCrawling.crawledPages,
          logic: global.crawlDebugData.pageCrawling.logic,
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'fetchMultiplePages()'
        });
      }

      // NEW: Extract design assets after content crawling but before AI analysis
      debugData.steps.push({
        step: 'design_extraction_started',
        timestamp: new Date().toISOString(),
        logic: {
          description: 'Extract design assets (colors, fonts, logos) from homepage HTML',
          sourceFile: 'services/designExtractor.js',
          functionName: 'extractDesignAssets()',
          steps: [
            'Parse CSS files and inline styles for color palette',
            'Extract typography information and Google Fonts',
            'Identify and download logo assets',
            'Analyze visual design elements and patterns',
            'Store extracted assets in public directory'
          ]
        },
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'crawlWebsite()'
      });

      // Extract design assets from homepage HTML (ONLY ONCE)
      let designAssets;
      if (!global.designAssetsCache[urlCacheKey]) {
        const homepageHtml = await fetchWebsiteHTML(websiteUrl);
        designAssets = await extractDesignAssets(websiteUrl, homepageHtml);
        global.designAssetsCache[urlCacheKey] = designAssets; // Cache to prevent duplicate extraction
        
        debugData.steps.push({
          step: 'design_extraction_completed',
          timestamp: new Date().toISOString(),
          designAssets: designAssets,
          logic: {
            description: 'Design asset extraction completed',
            extractedElements: {
              colors: designAssets.color_palette?.all_extracted_colors?.length || 0,
              fonts: designAssets.typography?.font_families_found?.length || 0,
              logos: designAssets.logo_assets?.main_logo ? 1 : 0,
              visual_elements: Object.keys(designAssets.visual_elements || {}).length
            }
          },
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlWebsite()'
        });
      } else {
        designAssets = global.designAssetsCache[urlCacheKey];
        console.log('🎨 Using cached design assets (avoiding duplicate extraction)');
      }

      // --- FINAL PROMPT ---
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
      const enhancedCrawlPrompt = intelligence.multiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData, designAssets);
      debugData.steps.push({
        step: 'final_prompt_prepared',
        timestamp: new Date().toISOString(),
        prompt: enhancedCrawlPrompt,
        logic: {
          description: 'Prompt constructed for AI multi-page analysis with design assets.',
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlWebsite()',
          steps: [
            'Combine homepage and additional page content',
            'Include design asset information in prompt context',
            'Format prompt for AI business analysis with design awareness'
          ]
        },
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'crawlWebsite()'
      });
      // --- AI RESPONSE ---
      crawlResult = await callClaudeAPI(enhancedCrawlPrompt, false, masterId, 'AI: Multi-Page Analysis');
      debugData.steps.push({
        step: 'ai_response_received',
        timestamp: new Date().toISOString(),
        aiResponse: crawlResult,
        logic: {
          description: 'AI response received for multi-page analysis.',
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlWebsite()',
          steps: [
            'Send prompt to Claude API',
            'Receive AI response with business analysis'
          ]
        },
        sourceFile: 'services/websiteCrawler.js',
        functionName: 'crawlWebsite()'
      });
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
        
        // NEW: Extract design assets even in fallback mode (only if not already extracted)
        let designAssets;
        if (!global.designAssetsCache[urlCacheKey]) {
          debugData.steps.push({
            step: 'fallback_design_extraction_started',
            timestamp: new Date().toISOString(),
            logic: {
              description: 'Extract design assets in fallback mode',
              sourceFile: 'services/designExtractor.js',
              functionName: 'extractDesignAssets()'
            }
          });
          
          designAssets = await extractDesignAssets(websiteUrl, singlePageHtml);
          global.designAssetsCache[urlCacheKey] = designAssets;
          
          debugData.steps.push({
            step: 'fallback_design_extraction_completed',
            timestamp: new Date().toISOString(),
            designAssets: designAssets
          });
        } else {
          designAssets = global.designAssetsCache[urlCacheKey];
          console.log('🎨 Using cached design assets in fallback mode');
        }
        
        const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, cleanText);
        debugData.steps.push({
          step: 'single_page_prompt_prepared',
          timestamp: new Date().toISOString(),
          prompt: crawlPrompt,
          logic: {
            description: 'Prompt constructed for AI single page analysis.',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlWebsite()',
            steps: [
              'Extract clean text from homepage',
              'Format prompt for AI single page analysis'
            ]
          },
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlWebsite()'
        });
        crawlResult = await callClaudeAPI(crawlPrompt, false, masterId, 'AI: Single Page Analysis');
        debugData.steps.push({
          step: 'single_page_ai_response_received',
          timestamp: new Date().toISOString(),
          aiResponse: crawlResult,
          logic: {
            description: 'AI response received for single page analysis.',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlWebsite()',
            steps: [
              'Send prompt to Claude API',
              'Receive AI response with business analysis'
            ]
          },
          sourceFile: 'services/websiteCrawler.js',
          functionName: 'crawlWebsite()'
        });
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: single page analysis result',
          aiResponse: crawlResult,
          logic: 'AI response received for single page analysis.',
          next: 'Parse AI response.'
        });
        crawlData = {
          homepageContent: cleanText,
          additionalPages: [],
          analysisMethod: 'single_page_fallback',
          selectionStrategy: 'fallback_no_selection',
          pagesSelected: 0
        };
      } catch (singlePageError) {
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Crawling: single page fallback failed',
          error: singlePageError.message,
          logic: 'Both multi-page and single-page crawling failed.',
          next: 'Return fallback data.'
        });
        throw singlePageError;
      }
    }
    
    // Step 2: Parse the AI response
    let extractedData;
    try {
      extractedData = JSON.parse(crawlResult);
      debugData.steps.push({
        step: 'ai_response_parsed',
        timestamp: new Date().toISOString(),
        extractedFields: Object.keys(extractedData).length
      });
    } catch (parseError) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Crawling: JSON parsing failed',
        error: parseError.message,
        rawResponse: crawlResult.substring(0, 500),
        logic: 'AI response could not be parsed as JSON.',
        next: 'Create fallback data.'
      });
      console.log('❌ Failed to parse crawling result as JSON:', parseError.message);
      extractedData = createFallbackData(websiteUrl, crawlResult, `JSON parsing failed: ${parseError.message}`);
      
      debugData.steps.push({
        step: 'fallback_data_created',
        timestamp: new Date().toISOString(),
        reason: 'JSON parsing failed'
      });
    }
    
    // NEW: Add design assets to the extracted data
    if (typeof designAssets !== 'undefined') {
      extractedData.design_assets = designAssets;
    } else {
      // Try to extract design assets if not already done
      try {
        const homepageHtml = await fetchWebsiteHTML(websiteUrl);
        const fallbackDesignAssets = await extractDesignAssets(websiteUrl, homepageHtml);
        extractedData.design_assets = fallbackDesignAssets;
      } catch (designError) {
        extractedData.design_assets = {
          extraction_metadata: {
            extraction_method: 'failed',
            error: designError.message
          }
        };
      }
    }
    
    // Step 3: Add crawling metadata
    extractedData.pages_analyzed = crawlData.additionalPages ? 
      crawlData.additionalPages.filter(p => !p.error).length : 0;
    extractedData.pages_selected = crawlData.pagesSelected || 0;
    extractedData.external_pages_analyzed = crawlData.additionalPages ? crawlData.additionalPages.filter(p => p.isExternal && !p.error).length : 0;
    extractedData.total_content_length = crawlData.homepageContent.length + 
      (crawlData.additionalPages ? crawlData.additionalPages.reduce((sum, page) => sum + (page.error ? 0 : page.contentLength), 0) : 0);
    if (crawlData.selectionStrategy) {
      extractedData.ai_selection_strategy = crawlData.selectionStrategy;
    }
    
    // NEW: Add design extraction metadata
    extractedData.extraction_metadata = {
      timestamp: new Date().toISOString(),
      pages_analyzed: 1 + (crawlData.additionalPages?.length || 0),
      pages_selected: crawlData.pagesSelected || 0,
      external_pages_analyzed: crawlData.additionalPages ? crawlData.additionalPages.filter(p => p.isExternal && !p.error).length : 0,
      total_content_length: crawlData.homepageContent.length + (crawlData.additionalPages ? crawlData.additionalPages.reduce((sum, page) => sum + (page.error ? 0 : page.contentLength), 0) : 0),
      analysis_method: crawlData.analysisMethod,
      design_extraction_status: extractedData.design_assets?.extraction_metadata?.extraction_method || 'unknown'
    };
    
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
    console.error('❌ Website crawling failed:', error.message);
    
    // Store error debug data
    debugData.steps.push({
      step: 'crawl_failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
    
    if (typeof global !== 'undefined') {
      global.crawlDebugData = debugData;
    }
    
    // NEW: Try to extract design assets even if crawling failed (only if not already extracted)
    const fallbackData = createFallbackData(websiteUrl, null, error.message);
    if (!global.designAssetsCache[urlCacheKey]) {
      try {
        const homepageHtml = await fetchWebsiteHTML(websiteUrl);
        const designAssets = await extractDesignAssets(websiteUrl, homepageHtml);
        fallbackData.design_assets = designAssets;
        global.designAssetsCache[urlCacheKey] = designAssets;
      } catch (designError) {
        fallbackData.design_assets = {
          extraction_metadata: {
            extraction_method: 'failed',
            error: designError.message
          }
        };
      }
    } else {
      fallbackData.design_assets = global.designAssetsCache[urlCacheKey];
      console.log('🎨 Using cached design assets in error fallback');
    }
    
    return fallbackData;
  }
}

// HELPER FUNCTION: Create fallback data when crawling fails
function createFallbackData(websiteUrl, rawResponse = null, errorMessage = '') {
  const fallbackData = {
    company_name: extractCompanyNameFromUrl(websiteUrl),
    business_description: 'Unable to extract business description',
    value_proposition: 'Unable to extract value proposition',
    target_customer: 'Unable to extract target customer information',
    key_features: [],
    pricing_info: 'Unable to extract pricing information',
    business_stage: 'Unable to determine business stage',
    industry_category: 'Unable to determine industry category',
    competitors_mentioned: [],
    social_media: {},
    contact_info: { website: websiteUrl },
    team_info: 'Unable to extract team information',
    funding_info: 'Unable to extract funding information',
    recent_updates: 'Unable to extract recent updates',
    mission_vision: 'Unable to extract mission and vision',
    additional_notes: errorMessage ? 
      `Error: ${errorMessage}` : 'Information extracted from URL analysis',
    extraction_method: 'fallback_analysis',
    extraction_timestamp: new Date().toISOString(),
    pages_analyzed: 0,
    pages_selected: 0,
    external_pages_analyzed: 0,
    total_content_length: 0,
    design_assets: {
      extraction_metadata: {
        extraction_method: 'not_attempted',
        error: errorMessage
      }
    }
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