// Claude AI service - Enhanced with multi-page website crawling
const axios = require('axios');
const { config } = require('../config/config');
const { intelligence } = require('../prompts');
const { extractCleanText, extractAllLinks, filterRelevantLinks } = require('./htmlParser');

// Helper function to call Claude API
async function callClaudeAPI(prompt, useWebSearch = false) {
  try {
    const tools = useWebSearch ? [
      {
        "name": "web_search",
        "description": "Search the web",
        "input_schema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            }
          },
          "required": ["query"]
        }
      },
      {
        "name": "web_fetch",
        "description": "Fetch the contents of a web page at a given URL",
        "input_schema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "URL to fetch"
            }
          },
          "required": ["url"]
        }
      }
    ] : [];

    let messages = [
      {
        role: "user",
        content: prompt
      }
    ];

    console.log('Making Claude API request:', {
      useWebSearch,
      toolsCount: tools.length,
      promptLength: prompt.length
    });

    // First API call
    let requestBody = {
      model: config.claude.model,
      max_tokens: config.claude.maxTokens,
      messages: messages
    };

    if (useWebSearch) {
      requestBody.tools = tools;
    }

    let response = await axios.post(config.claudeApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': config.claude.anthropicVersion
      }
    });

    console.log('Claude API response:', {
      status: response.status,
      contentLength: response.data.content?.length,
      contentTypes: response.data.content?.map(c => c.type),
      stopReason: response.data.stop_reason
    });

    // Handle tool use if Claude wants to use web search
    if (useWebSearch && response.data.content) {
      let finalResult = '';
      let currentMessages = [...messages];
      
      // Add Claude's response to conversation
      currentMessages.push({
        role: "assistant",
        content: response.data.content
      });

      // Check if Claude used any tools
      for (const content of response.data.content) {
        if (content.type === 'tool_use') {
          console.log('Claude requested tool use:', content.name, content.input);
          
          if (content.name === 'web_search') {
            // Claude wants to search - we need to let it handle this
            // Add tool result message
            currentMessages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: content.id,
                  content: "Search completed. Please provide the results you found."
                }
              ]
            });

            // Make follow-up request
            const followUpResponse = await axios.post(config.claudeApiUrl, {
              model: config.claude.model,
              max_tokens: config.claude.maxTokens,
              messages: currentMessages,
              tools: tools
            }, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.claudeApiKey,
                'anthropic-version': config.claude.anthropicVersion
              }
            });

            console.log('Follow-up response received');
            
            // Extract text from follow-up response
            if (followUpResponse.data.content) {
              for (const followUpContent of followUpResponse.data.content) {
                if (followUpContent.type === 'text') {
                  finalResult += followUpContent.text + '\n';
                }
              }
            }
          }
        } else if (content.type === 'text') {
          finalResult += content.text + '\n';
        }
      }

      if (!finalResult.trim()) {
        console.log('No final result from tool use. Raw response:', JSON.stringify(response.data, null, 2));
        throw new Error('No usable content from Claude after tool use');
      }

      return finalResult.trim();
    }

    // Extract final result for non-tool requests
    let result = '';
    
    if (response.data.content && response.data.content.length > 0) {
      for (const content of response.data.content) {
        if (content.type === 'text') {
          result += content.text + '\n';
        }
      }
    }

    if (!result.trim()) {
      console.log('Empty result! Full response:', JSON.stringify(response.data, null, 2));
      throw new Error('No usable content in Claude response');
    }

    console.log('Final result length:', result.length);
    return result.trim();
    
  } catch (error) {
    console.error('Claude API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Claude API authentication failed. Check your API key.');
    } else if (error.response?.status === 400) {
      throw new Error(`Claude API request error: ${error.response.data?.error?.message || 'Bad request'}`);
    } else if (error.response?.status === 429) {
      throw new Error('Claude API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Claude API Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

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

// NEW: Fetch and analyze multiple pages for comprehensive business intelligence
async function fetchMultiplePages(websiteUrl) {
  try {
    console.log('🔍 Starting multi-page analysis for:', websiteUrl);
    
    // Step 1: Fetch and analyze homepage
    const homepageHtml = await fetchWebsiteHTML(websiteUrl);
    const homepageCleanText = extractCleanText(homepageHtml);
    const allLinks = extractAllLinks(homepageHtml, websiteUrl);
    const relevantLinks = filterRelevantLinks(allLinks);
    
    console.log('📄 Homepage analysis complete:', {
      originalHtmlLength: homepageHtml.length,
      cleanTextLength: homepageCleanText.length,
      totalLinks: allLinks.length,
      relevantLinks: relevantLinks.length
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
    
    // Step 3: Use AI to select the 5 most valuable links
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
      // Fallback: select first 5 relevant links
      selectedLinksData = {
        selected_links: relevantLinks.slice(0, 5).map(link => ({
          url: link.url,
          text: link.text,
          reasoning: 'Fallback selection due to AI error'
        })),
        total_selected: Math.min(5, relevantLinks.length),
        selection_strategy: 'Fallback - first 5 relevant links'
      };
    }
    
    console.log('🎯 AI selected', selectedLinksData.total_selected, 'links:', 
      selectedLinksData.selected_links.map(l => l.text));
    
    // Step 4: Fetch content from selected pages
    const additionalPages = [];
    for (const selectedLink of selectedLinksData.selected_links) {
      try {
        console.log('📄 Fetching page:', selectedLink.text, '→', selectedLink.url);
        
        const pageHtml = await fetchWebsiteHTML(selectedLink.url);
        const pageCleanText = extractCleanText(pageHtml);
        
        additionalPages.push({
          url: selectedLink.url,
          title: selectedLink.text,
          content: pageCleanText,
          reasoning: selectedLink.reasoning,
          contentLength: pageCleanText.length
        });
        
        console.log('✅ Successfully processed page:', selectedLink.text, 
          '(', pageCleanText.length, 'chars)');
        
      } catch (pageError) {
        console.log('⚠️ Failed to fetch page:', selectedLink.url, '→', pageError.message);
        // Continue with other pages
      }
    }
    
    console.log('🎉 Multi-page crawling complete:', {
      homepageLength: homepageCleanText.length,
      additionalPages: additionalPages.length,
      totalContent: homepageCleanText.length + additionalPages.reduce((sum, page) => sum + page.contentLength, 0)
    });
    
    return {
      homepageContent: homepageCleanText,
      additionalPages: additionalPages,
      analysisMethod: 'multi_page_analysis',
      selectionStrategy: selectedLinksData.selection_strategy
    };
    
  } catch (error) {
    console.error('❌ Multi-page crawling failed:', error.message);
    throw error;
  }
}

// ENHANCED: Main website crawling function with multi-page support
async function crawlWebsite(websiteUrl) {
  try {
    console.log('🌐 Starting enhanced website crawl for:', websiteUrl);
    
    let crawlResult;
    let useMultiPage = true;
    let crawlData;
    
    // Step 1: Try multi-page crawling
    try {
      crawlData = await fetchMultiplePages(websiteUrl);
      
      // Create comprehensive prompt with all page content
      let combinedContent = `HOMEPAGE CONTENT:\n${crawlData.homepageContent}\n\n`;
      
      if (crawlData.additionalPages.length > 0) {
        combinedContent += 'ADDITIONAL PAGES:\n';
        crawlData.additionalPages.forEach((page, index) => {
          combinedContent += `\nPage ${index + 1}: ${page.title}\nURL: ${page.url}\nContent: ${page.content}\n`;
        });
      }
      
      // Use enhanced prompt for multi-page analysis
      const enhancedCrawlPrompt = createMultiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData);
      crawlResult = await callClaudeAPI(enhancedCrawlPrompt, false);
      
      console.log('✅ Multi-page analysis completed successfully');
      
    } catch (multiPageError) {
      console.log('⚠️ Multi-page crawling failed, falling back to single page:', multiPageError.message);
      
      // Fallback: Try single page with clean text extraction
      try {
        const singlePageHtml = await fetchWebsiteHTML(websiteUrl);
        const cleanText = extractCleanText(singlePageHtml);
        
        const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl, cleanText);
        crawlResult = await callClaudeAPI(crawlPrompt, false);
        useMultiPage = false;
        
        crawlData = {
          homepageContent: cleanText,
          additionalPages: [],
          analysisMethod: 'single_page_fallback'
        };
        
        console.log('✅ Single-page fallback completed');
        
      } catch (singlePageError) {
        console.log('⚠️ Single-page fallback failed, using URL-only analysis:', singlePageError.message);
        
        // Final fallback: URL-based analysis (existing approach)
        const fallbackPrompt = intelligence.fallbackCrawlPrompt(websiteUrl);
        crawlResult = await callClaudeAPI(fallbackPrompt, false);
        useMultiPage = false;
        
        crawlData = {
          homepageContent: '',
          additionalPages: [],
          analysisMethod: 'url_only_fallback'
        };
      }
    }
    
    console.log('Raw crawl response length:', crawlResult.length);
    
    // Parse JSON response (keeping existing logic)
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
    
    // Ensure we have a company name (keeping existing logic)
    if (!extractedData.company_name || extractedData.company_name === 'Not found' || extractedData.company_name === '') {
      extractedData.company_name = extractCompanyNameFromUrl(websiteUrl);
    }
    
    // Add enhanced metadata
    extractedData.extraction_method = crawlData.analysisMethod;
    extractedData.extraction_timestamp = new Date().toISOString();
    extractedData.pages_analyzed = 1 + crawlData.additionalPages.length;
    extractedData.total_content_length = crawlData.homepageContent.length + 
      crawlData.additionalPages.reduce((sum, page) => sum + page.contentLength, 0);
    
    if (crawlData.selectionStrategy) {
      extractedData.ai_selection_strategy = crawlData.selectionStrategy;
    }
    
    console.log('✅ Enhanced website extraction complete for:', extractedData.company_name);
    console.log('📊 Extraction summary:', {
      method: extractedData.extraction_method,
      pages: extractedData.pages_analyzed,
      contentLength: extractedData.total_content_length
    });
    
    return extractedData;
    
  } catch (error) {
    console.error('Website crawling error:', error);
    
    // Return structured fallback data (keeping existing logic)
    return createFallbackData(websiteUrl, null, error.message);
  }
}

// NEW: Create enhanced prompt for multi-page analysis
function createMultiPageAnalysisPrompt(websiteUrl, combinedContent, crawlData) {
  return `Analyze the following comprehensive website content and extract detailed business information. This analysis includes the homepage plus ${crawlData.additionalPages.length} additional pages selected for maximum business intelligence value.

Website URL: ${websiteUrl}
Analysis Method: ${crawlData.analysisMethod}
Pages Analyzed: ${1 + crawlData.additionalPages.length}

COMPREHENSIVE WEBSITE CONTENT:
${combinedContent}

Extract business information and respond with ONLY a JSON object containing the business details:

{
"company_name": "",
"business_description": "",
"value_proposition": "",
"target_customer": "",
"main_product_service": "",
"key_features": [],
"pricing_info": "",
"business_stage": "",
"industry_category": "",
"competitors_mentioned": [],
"unique_selling_points": [],
"team_size": "",
"recent_updates": "",
"social_media": {
  "twitter": "",
  "linkedin": "",
  "other": []
},
"funding_info": "",
"company_mission": "",
"team_background": "",
"additional_notes": ""
}

EXTRACTION RULES:
- Use ONLY information explicitly found in the website content
- For any information you cannot find, use "Not found" as the value
- For arrays that are empty, use []
- Combine information from all pages to create comprehensive business profile
- Prioritize specific details like founder names, funding amounts, customer types, pricing models
- Look for specific business metrics, customer counts, revenue information
- Extract team/founder background information if available
- Note any competitive advantages or unique positioning mentioned
- Include recent news, updates, or milestones if mentioned

Respond with ONLY the JSON object, no additional text or explanation.`;
}

// HELPER FUNCTION: Create fallback data when parsing fails (keeping existing logic)
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
    total_content_length: 0
  };
  
  // If we have raw response, try to extract any useful information
  if (rawResponse) {
    fallbackData.raw_response = rawResponse.substring(0, 500); // Store first 500 chars for debugging
    fallbackData.additional_notes += '. Raw response available for manual review.';
  }
  
  return fallbackData;
}

// HELPER FUNCTION: Extract company name from URL (keeping existing logic)
function extractCompanyNameFromUrl(url) {
  try {
    const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const domain = cleanUrl.split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return 'Unknown Company';
  }
}

// Test Claude API connection (keeping existing function)
async function testClaudeAPI() {
  try {
    if (!config.claudeApiKey) {
      return { status: 'error', message: 'No Claude API key configured' };
    }
    
    if (!config.claudeApiKey.startsWith('sk-ant-')) {
      return { status: 'error', message: 'Invalid Claude API key format' };
    }
    
    const testPrompt = 'Say "Claude API test successful" and nothing else.';
    const result = await callClaudeAPI(testPrompt, false);
    return { status: 'success', message: 'API key working', response: result };
    
  } catch (error) {
    return { status: 'error', message: 'Claude API test failed: ' + error.message };
  }
}

module.exports = {
  callClaudeAPI,
  crawlWebsite,
  testClaudeAPI
};