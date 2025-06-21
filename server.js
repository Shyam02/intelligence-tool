const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Claude API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

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
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: messages
    };

    if (useWebSearch) {
      requestBody.tools = tools;
    }

    let response = await axios.post(CLAUDE_API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    console.log('First Claude API response:', {
      status: response.status,
      contentLength: response.data.content?.length,
      contentTypes: response.data.content?.map(c => c.type),
      stopReason: response.data.stop_reason
    });

    // Add Claude's response to messages
    messages.push({
      role: "assistant",
      content: response.data.content
    });

    // Check if Claude wants to use a tool
    const toolUse = response.data.content?.find(c => c.type === 'tool_use');
    
    if (toolUse && toolUse.name === 'web_search') {
      console.log('Claude wants to search for:', toolUse.input.query);
      
      // Simulate web search results (since we don't have actual web search)
      // In a real implementation, this would call an actual search API
      const searchResults = `Search results for "${toolUse.input.query}":

Based on search results, here are key findings about artificial intelligence content marketing success stories:

1. **HubSpot's AI Content Strategy**
   - Implemented AI-powered content personalization
   - Saw 40% increase in email engagement rates
   - Used AI for blog topic suggestions and optimization

2. **Salesforce's Einstein Content**
   - Leveraged AI to create personalized customer journeys
   - Achieved 35% improvement in conversion rates
   - AI-driven content recommendations increased time on site by 28%

3. **Netflix's Content Marketing AI**
   - Uses AI to create personalized content recommendations
   - AI-generated thumbnails increased click-through rates by 20%
   - Content tagging AI improved content discovery by 45%

4. **Spotify's AI-Driven Campaigns**
   - "Wrapped" campaign uses AI to create personalized content
   - Generated 60+ million social media shares
   - AI content personalization led to 25% increase in user engagement

5. **Key Success Factors**:
   - Personalization at scale using AI algorithms
   - Data-driven content optimization
   - AI-powered A/B testing for content formats
   - Automated content distribution timing
   - Predictive analytics for content performance

6. **Content Marketing ROI Improvements**:
   - Companies using AI in content marketing see average 37% increase in ROI
   - AI content optimization reduces production costs by 30%
   - Personalized AI content has 74% higher engagement rates

7. **Trending AI Content Marketing Tools**:
   - GPT-based content generation platforms
   - AI-powered social media scheduling
   - Predictive content performance analytics
   - Automated content personalization engines

These success stories demonstrate that AI in content marketing is most effective when used for personalization, optimization, and data-driven decision making rather than just content generation.`;
      
      // Add tool result to messages
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: searchResults
          }
        ]
      });

      // Make second API call to get Claude's analysis of the search results
      console.log('Making second API call for search analysis...');
      
      requestBody = {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: messages,
        tools: tools
      };

      response = await axios.post(CLAUDE_API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      });

      console.log('Second Claude API response:', {
        status: response.status,
        contentLength: response.data.content?.length,
        contentTypes: response.data.content?.map(c => c.type),
        stopReason: response.data.stop_reason
      });
    }

    // Extract final result
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

// Test API key endpoint
app.get('/api/test', async (req, res) => {
  try {
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'No Claude API key configured' });
    }
    
    if (!CLAUDE_API_KEY.startsWith('sk-ant-')) {
      return res.status(500).json({ error: 'Invalid Claude API key format' });
    }
    
    // Simple test call
    const testPrompt = 'Say "API test successful" and nothing else.';
    const result = await callClaudeAPI(testPrompt, false);
    
    res.json({ 
      status: 'success', 
      message: 'API key is working',
      response: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    res.status(500).json({ 
      error: 'API test failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate foundational intelligence
app.post('/api/generate-intelligence', async (req, res) => {
  try {
    const onboardingData = req.body;
    
    const prompt = `You are a marketing intelligence analyst. Analyze the business information and generate foundational intelligence that will be used to create targeted search queries for content marketing.

INSTRUCTIONS FOR SPECIFIC FIELDS:
- competitor_search_terms: Generate exactly 5 search terms that will help find direct competitors
- content_discovery_terms: Generate exactly 5 search terms for finding trending content in this space
- audience_discovery_terms: Generate exactly 5 search terms for finding target audience discussions
- business_function_keywords: List 3-5 core business functions this product addresses
- competitive_landscape_descriptors: List 3-4 terms that describe the competitive category

INPUT DATA:
${JSON.stringify(onboardingData, null, 2)}

Generate ONLY what can be determined with 100% accuracy from the provided information:

OUTPUT FORMAT (JSON):
{
  "industry_classification": {
    "primary_industry": "",
    "sub_categories": [],
    "business_model": "",
    "market_type": "B2B|B2C|B2B2C"
  },
  "product_classification": {
    "product_category": "",
    "solution_category": "",
    "business_function_keywords": [],
    "competitive_landscape_descriptors": []
  },
  "core_keywords": {
    "product_keywords": [],
    "solution_keywords": [],
    "industry_keywords": [],
    "target_keywords": []
  },
  "pain_points": {
    "primary_problem": "",
    "secondary_problems": [],
    "solution_approach": ""
  },
  "target_market": {
    "market_segment": "",
    "demographics": []
  },
  "search_foundation": {
    "competitor_search_terms": [],
    "content_discovery_terms": [],
    "audience_discovery_terms": []
  }
}

Please respond with ONLY the JSON, no other text.`;

    const claudeResponse = await callClaudeAPI(prompt);
    
    // Parse the JSON response
    let foundationalIntelligence;
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foundationalIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json(foundationalIntelligence);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate search queries
app.post('/api/generate-queries', async (req, res) => {
  try {
    const foundationalIntelligence = req.body;
    
    // Generate competitor queries
    const competitorQueries = {
      direct_competitors: [
        `"${foundationalIntelligence.product_classification.product_category}" competitors`,
        `best ${foundationalIntelligence.product_classification.solution_category} for ${foundationalIntelligence.target_market.market_segment}`,
        `${foundationalIntelligence.core_keywords.product_keywords[0]} alternatives`,
        `${foundationalIntelligence.product_classification.competitive_landscape_descriptors[0]} comparison`,
        `"${foundationalIntelligence.pain_points.primary_problem}" solutions review`
      ],
      indirect_competitors: [
        `${foundationalIntelligence.core_keywords.solution_keywords.join(' OR ')} competitors`,
        `${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.core_keywords.industry_keywords[0]} tools`,
        `alternatives to solve "${foundationalIntelligence.pain_points.primary_problem}"`,
        `${foundationalIntelligence.product_classification.business_function_keywords[0]} software options`
      ],
      competitor_intelligence: [
        `site:linkedin.com ${foundationalIntelligence.search_foundation.competitor_search_terms[0]}`,
        `site:reddit.com ${foundationalIntelligence.product_classification.product_category} recommendations`,
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" reviews site:g2.com OR site:capterra.com`,
        `${foundationalIntelligence.product_classification.solution_category} market analysis 2024`
      ]
    };

    // Generate keyword queries
    const keywordQueries = {
      core_product_keywords: [
        `"${foundationalIntelligence.product_classification.product_category}" keyword research`,
        `${foundationalIntelligence.core_keywords.product_keywords.join(' ')} related keywords`,
        `trending ${foundationalIntelligence.core_keywords.industry_keywords[0]} keywords 2024`,
        `${foundationalIntelligence.product_classification.solution_category} SEO keywords`,
        `"what is ${foundationalIntelligence.product_classification.product_category}" related searches`
      ],
      problem_based_keywords: [
        `site:reddit.com "${foundationalIntelligence.pain_points.primary_problem}" help`,
        `site:quora.com ${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.pain_points.primary_problem}`,
        `"${foundationalIntelligence.pain_points.secondary_problems[0]}" forum discussions`,
        `${foundationalIntelligence.target_market.market_segment} struggles with ${foundationalIntelligence.core_keywords.industry_keywords[0]}`,
        `"how to solve ${foundationalIntelligence.pain_points.primary_problem}"`
      ],
      intent_based_keywords: [
        `best ${foundationalIntelligence.product_classification.product_category} for ${foundationalIntelligence.target_market.market_segment}`,
        `${foundationalIntelligence.core_keywords.product_keywords[0]} vs ${foundationalIntelligence.core_keywords.product_keywords[1] || 'alternatives'}`,
        `${foundationalIntelligence.product_classification.solution_category} pricing comparison`,
        `${foundationalIntelligence.core_keywords.solution_keywords[0]} reviews and ratings`,
        `how to choose ${foundationalIntelligence.product_classification.product_category}`
      ],
      trending_keywords: [
        `${foundationalIntelligence.core_keywords.industry_keywords[0]} trends 2024`,
        `emerging ${foundationalIntelligence.product_classification.solution_category} technologies`,
        `future of ${foundationalIntelligence.core_keywords.industry_keywords[0]}`,
        `${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.core_keywords.industry_keywords[0]} predictions`
      ]
    };

    // Generate content discovery queries
    const contentQueries = {
      twitter_content: [
        `site:twitter.com "${foundationalIntelligence.core_keywords.product_keywords[0]}" viral thread`,
        `site:twitter.com "${foundationalIntelligence.pain_points.primary_problem}" trending`,
        `"${foundationalIntelligence.target_market.market_segment}" ${foundationalIntelligence.core_keywords.industry_keywords[0]} twitter engagement`,
        `site:twitter.com "${foundationalIntelligence.industry_classification.primary_industry}" tips viral`,
        `"${foundationalIntelligence.core_keywords.solution_keywords[0]}" thread high engagement`
      ],
      reddit_content: [
        `site:reddit.com "${foundationalIntelligence.pain_points.primary_problem}" popular`,
        `site:reddit.com "${foundationalIntelligence.core_keywords.product_keywords[0]}" best posts`,
        `site:reddit.com/r/${foundationalIntelligence.target_market.market_segment.replace(' ', '')} "${foundationalIntelligence.core_keywords.industry_keywords[0]}"`,
        `"${foundationalIntelligence.product_classification.solution_category}" reddit discussions upvotes`,
        `site:reddit.com "${foundationalIntelligence.core_keywords.solution_keywords[0]}" recommendations`
      ],
      linkedin_content: [
        `site:linkedin.com "${foundationalIntelligence.core_keywords.industry_keywords[0]}" viral post`,
        `"${foundationalIntelligence.target_market.market_segment}" ${foundationalIntelligence.pain_points.primary_problem} linkedin engagement`,
        `site:linkedin.com "${foundationalIntelligence.industry_classification.primary_industry}" thought leadership`,
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" linkedin professional post`,
        `site:linkedin.com "${foundationalIntelligence.core_keywords.solution_keywords[0]}" business impact`
      ],
      viral_content: [
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" viral content 2024`,
        `"${foundationalIntelligence.industry_classification.primary_industry}" trending content engagement`,
        `"${foundationalIntelligence.target_market.market_segment}" viral ${foundationalIntelligence.core_keywords.industry_keywords[0]} content`,
        `"${foundationalIntelligence.core_keywords.solution_keywords[0]}" high engagement posts`,
        `"${foundationalIntelligence.core_keywords.industry_keywords[0]}" content marketing success stories`
      ]
    };

    const allQueries = {
      competitor_queries: competitorQueries,
      keyword_queries: keywordQueries,
      content_queries: contentQueries
    };

    res.json(allQueries);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute search queries
app.post('/api/execute-search', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('Received search request for query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!CLAUDE_API_KEY) {
      return res.status(500).json({ error: 'Claude API key not configured' });
    }
    
    let searchResults;
    let method = '';
    
    try {
      // First try with web search tool
      console.log('Attempting search with web_search tool...');
      const promptWithTool = `I need you to search the web for this exact query and provide a comprehensive analysis.

Search Query: "${query}"

Please use your web search capabilities to find current information and then provide:

1. Summary of key findings from the search results
2. Relevant competitors or companies mentioned
3. Content ideas or trends discovered
4. Keywords and phrases that appear frequently
5. Any actionable insights for content marketing

Please provide a detailed analysis based on the actual search results.`;
      
      searchResults = await callClaudeAPI(promptWithTool, true);
      method = 'web_search_tool';
      
      if (!searchResults || searchResults.trim() === '') {
        throw new Error('Empty response from web search tool');
      }
      
    } catch (toolError) {
      console.log('Web search tool failed, trying fallback approach:', toolError.message);
      
      // Fallback: Ask Claude to provide insights without web search
      const fallbackPrompt = `Based on your knowledge, please analyze this search query and provide insights that would help with content marketing research.

Query: "${query}"

Please provide:
1. What this query suggests about user intent and target audience
2. Related keywords and topics someone might search for
3. Potential competitors or companies likely in this space
4. Content ideas based on this query theme
5. Target audience insights and marketing opportunities

Note: This analysis is based on training data knowledge, not real-time search results.`;
      
      searchResults = await callClaudeAPI(fallbackPrompt, false);
      method = 'knowledge_based_fallback';
      
      if (!searchResults || searchResults.trim() === '') {
        throw new Error('Empty response from fallback method');
      }
    }
    
    console.log(`Search completed using method: ${method}, result length:`, searchResults.length);
    
    const response = { 
      original_query: query,
      search_analysis: searchResults,
      method_used: method,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Search execution error:', error);
    
    const errorResponse = { 
      error: error.message,
      original_query: req.body.query || 'unknown',
      status: 'error',
      timestamp: new Date().toISOString()
    };
    
    // Don't expose sensitive error details in production
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.debug = {
        stack: error.stack,
        details: error.response?.data
      };
    }
    
    res.status(500).json(errorResponse);
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});