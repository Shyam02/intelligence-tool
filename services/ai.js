// Claude AI service
const axios = require('axios');
const { config } = require('../config/config');
const { intelligence } = require('../prompts');

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

// SIMPLIFIED FUNCTION: Crawl website using basic research approach
async function crawlWebsite(websiteUrl) {
  try {
    console.log('🌐 Starting website crawl for:', websiteUrl);
    
    // Use extracted prompts instead of inline
    const crawlPrompt = intelligence.mainCrawlPrompt(websiteUrl);

    // Try with web search first
    let crawlResult;
    try {
      crawlResult = await callClaudeAPI(crawlPrompt, true);
    } catch (webSearchError) {
      console.log('Web search failed, trying without web search:', webSearchError.message);
      // Fallback: Try without web search (Claude might still have some knowledge)
      const fallbackPrompt = intelligence.fallbackCrawlPrompt(websiteUrl);
      
      crawlResult = await callClaudeAPI(fallbackPrompt, false);
    }
    
    console.log('Raw crawl response length:', crawlResult.length);
    console.log('First 200 chars of response:', crawlResult.substring(0, 200));
    
    // Extract JSON from response
    let extractedData;
    try {
      // Look for JSON object in the response
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
      
      // SMART FALLBACK: Create structured data based on URL analysis
      extractedData = createFallbackData(websiteUrl, crawlResult);
    }
    
    // Ensure we have a company name
    if (!extractedData.company_name || extractedData.company_name === 'Not found' || extractedData.company_name === '') {
      extractedData.company_name = extractCompanyNameFromUrl(websiteUrl);
    }
    
    console.log('✅ Successfully extracted website data for:', extractedData.company_name);
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
    additional_notes: errorMessage ? `Error: ${errorMessage}` : 'Information extracted from URL analysis'
  };
  
  // If we have raw response, try to extract any useful information
  if (rawResponse) {
    fallbackData.raw_response = rawResponse;
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

// Test Claude API connection
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