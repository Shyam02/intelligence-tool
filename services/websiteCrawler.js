// Website crawling service - All website crawling functionality
const axios = require('axios');
const { callClaudeAPI } = require('./ai');
const { intelligence } = require('../prompts');
const { extractCleanText, extractAllLinks, filterRelevantLinks } = require('./htmlParser');

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
    const crawlResult = await callClaudeAPI(crawlPrompt, false);
    
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
    
    console.log('✅ Competitor homepage crawl completed:', extractedData.company_name);
    return extractedData;
    
  } catch (error) {
    console.error('❌ Competitor homepage crawl failed:', error.message);
    // Return fallback data for competitors
    return createFallbackData(websiteUrl, null, error.message);
  }
}

// ENHANCED: Fetch and analyze multiple pages with flexible 0-10 page selection
async function fetchMultiplePages(websiteUrl) {
  try {
    console.log('🔍 Starting enhanced multi-page analysis for:', websiteUrl);
    
    // Step 1: Fetch and analyze homepage
    const homepageHtml = await fetchWebsiteHTML(websiteUrl);
    const homepageCleanText = extractCleanText(homepageHtml);
    const allLinks = extractAllLinks(homepageHtml, websiteUrl);
    const relevantLinks = filterRelevantLinks(allLinks);
    
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
    
    let selectedLinksData;
    try {
      const selectionResponse = await callClaudeAPI(linkSelectionPrompt, false);
      const jsonMatch = selectionResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        selectedLinksData = JSON.parse(jsonMatch[0]);
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
    }
    
    console.log('🎯 AI selected', selectedLinksData.total_selected, 'links:', 
      selectedLinksData.selected_links.map(l => `${l.text} (${l.url.includes(new URL(websiteUrl).hostname) ? 'internal' : 'external'})`));
    
    // Step 4: Fetch content from selected pages (handle both internal and external)
    const additionalPages = [];
    for (const selectedLink of selectedLinksData.selected_links) {
      try {
        console.log('📄 Fetching page:', selectedLink.text, '→', selectedLink.url);
        
        // ENHANCEMENT: Handle external domains
        const linkDomain = new URL(selectedLink.url).hostname;
        const baseDomain = new URL(websiteUrl).hostname;
        const isExternal = linkDomain !== baseDomain;
        
        const pageHtml = await fetchWebsiteHTML(selectedLink.url);
        const pageCleanText = extractCleanText(pageHtml);
        
        additionalPages.push({
          url: selectedLink.url,
          title: selectedLink.text,
          content: pageCleanText,
          reasoning: selectedLink.reasoning,
          contentLength: pageCleanText.length,
          isExternal: isExternal,
          domain: linkDomain
        });
        
        console.log('✅ Successfully processed page:', selectedLink.text, 
          '(', pageCleanText.length, 'chars,', isExternal ? 'external' : 'internal', ')');
        
      } catch (pageError) {
        console.log('⚠️ Failed to fetch page:', selectedLink.url, '→', pageError.message);
        // Continue with other pages - don't fail entire process for one bad link
        additionalPages.push({
          url: selectedLink.url,
          title: selectedLink.text,
          content: `Failed to fetch content: ${pageError.message}`,
          reasoning: selectedLink.reasoning,
          contentLength: 0,
          isExternal: new URL(selectedLink.url).hostname !== new URL(websiteUrl).hostname,
          domain: new URL(selectedLink.url).hostname,
          error: true
        });
      }
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
async function crawlWebsite(websiteUrl) {
  try {
    console.log('🌐 Starting enhanced website crawl for:', websiteUrl);
    
    let crawlResult;
    let crawlData;
    
    // Step 1: Try enhanced multi-page crawling (0-10 pages)
    try {
      crawlData = await fetchMultiplePages(websiteUrl);
      
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
      
      // Use imported prompt for multi-page analysis
      const enhancedCrawlPrompt = intelligence.multiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData);
      crawlResult = await callClaudeAPI(enhancedCrawlPrompt, false);
      
      console.log('✅ Enhanced multi-page analysis completed successfully');
      
    } catch (multiPageError) {
      console.log('⚠️ Enhanced multi-page crawling failed, falling back to single page:', multiPageError.message);
      
      // Fallback: Try single page with clean text extraction
      try {
        const singlePageHtml = await fetchWebsiteHTML(websiteUrl);
        const cleanText = extractCleanText(singlePageHtml);
        
        const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, cleanText);
        crawlResult = await callClaudeAPI(crawlPrompt, false);
        
        crawlData = {
          homepageContent: cleanText,
          additionalPages: [],
          analysisMethod: 'single_page_fallback',
          pagesSelected: 0
        };
        
        console.log('✅ Single-page fallback completed');
        
      } catch (singlePageError) {
        console.log('⚠️ Single-page fallback failed, using URL-only analysis:', singlePageError.message);
        
        // Final fallback: URL-based analysis
        const fallbackPrompt = intelligence.fallbackCrawlPrompt(websiteUrl);
        crawlResult = await callClaudeAPI(fallbackPrompt, false);
        
        crawlData = {
          homepageContent: '',
          additionalPages: [],
          analysisMethod: 'url_only_fallback',
          pagesSelected: 0
        };
      }
    }
    
    console.log('Raw crawl response length:', crawlResult.length);
    
    // Parse JSON response
    let extractedData;
    try {
      const jsonMatch = crawlResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON from crawl response');
      } else {
        throw new Error('No JSON structure found in response');
      }
      
    } catch (parseError) {
      console.error('JSON Parse Error from crawl:', parseError);
      console.log('Full raw crawl response:', crawlResult);
      
      // Use existing fallback logic
      extractedData = createFallbackData(websiteUrl, crawlResult, parseError.message);
    }
    
    // Ensure we have a company name
    if (!extractedData.company_name || extractedData.company_name === 'Not found' || extractedData.company_name === '') {
      extractedData.company_name = extractCompanyNameFromUrl(websiteUrl);
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
    
    console.log('✅ Enhanced website extraction complete for:', extractedData.company_name);
    console.log('📊 Extraction summary:', {
      method: extractedData.extraction_method,
      pages: extractedData.pages_analyzed,
      selected: extractedData.pages_selected,
      external: extractedData.external_pages_analyzed,
      contentLength: extractedData.total_content_length
    });
    
    return extractedData;
    
  } catch (error) {
    console.error('Website crawling error:', error);
    
    // Return structured fallback data
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