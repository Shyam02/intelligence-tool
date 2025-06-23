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

// API configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

// Helper function to call Claude API (for non-search tasks)
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
            const followUpResponse = await axios.post(CLAUDE_API_URL, {
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 4000,
              messages: currentMessages,
              tools: tools
            }, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
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

// NEW: Brave Search API function
async function searchBrave(query, count = 8) {
  try {
    console.log('🔍 Brave Search request for:', query);
    
    if (!BRAVE_API_KEY) {
      throw new Error('Brave API key not configured');
    }

    const response = await axios.get(BRAVE_API_URL, {
      params: {
        q: query,
        count: count,
        country: 'us',
        spellcheck: 1,
        search_lang: 'en'
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });

    console.log('✅ Brave Search response:', {
      status: response.status,
      hasWeb: !!response.data.web,
      webResultsCount: response.data.web?.results?.length || 0
    });

    return response.data;
    
  } catch (error) {
    console.error('Brave Search Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Brave API authentication failed. Check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Brave API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(`Brave API request error: ${error.response?.data?.message || 'Bad request'}`);
    } else {
      throw new Error(`Brave Search Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Test API key endpoint
app.get('/api/test', async (req, res) => {
  try {
    const results = {};
    
    // Test Claude API
    if (!CLAUDE_API_KEY) {
      results.claude = { status: 'error', message: 'No Claude API key configured' };
    } else if (!CLAUDE_API_KEY.startsWith('sk-ant-')) {
      results.claude = { status: 'error', message: 'Invalid Claude API key format' };
    } else {
      try {
        const testPrompt = 'Say "Claude API test successful" and nothing else.';
        const result = await callClaudeAPI(testPrompt, false);
        results.claude = { status: 'success', message: 'API key working', response: result };
      } catch (error) {
        results.claude = { status: 'error', message: 'Claude API test failed: ' + error.message };
      }
    }
    
    // Test Brave API
    if (!BRAVE_API_KEY) {
      results.brave = { status: 'error', message: 'No Brave API key configured' };
    } else {
      try {
        const braveResult = await searchBrave('test search', 2);
        results.brave = { 
          status: 'success', 
          message: 'API key working', 
          results_found: braveResult.web?.results?.length || 0 
        };
      } catch (error) {
        results.brave = { status: 'error', message: 'Brave API test failed: ' + error.message };
      }
    }
    
    res.json({ 
      timestamp: new Date().toISOString(),
      tests: results,
      overall_status: (results.claude.status === 'success' && results.brave.status === 'success') ? 'success' : 'partial'
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

// Execute search queries - NOW USING BRAVE SEARCH API
app.post('/api/execute-search', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('🔍 Search request received for query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!BRAVE_API_KEY) {
      return res.status(500).json({ error: 'Brave API key not configured' });
    }
    
    let method = 'brave_search_api';
    let apiCalls = [];
    let articles = [];
    
    try {
      console.log('🌐 Executing search with Brave Search API...');
      
      // Call Brave Search API
      const braveResponse = await searchBrave(query, 10);
      
      apiCalls.push({
        call: 1,
        type: 'brave_search_api',
        query: query,
        results_count: braveResponse.web?.results?.length || 0,
        timestamp: new Date().toISOString()
      });

      console.log('📊 Brave search response structure:', {
        hasWeb: !!braveResponse.web,
        webResultsCount: braveResponse.web?.results?.length || 0,
        hasNews: !!braveResponse.news,
        hasVideos: !!braveResponse.videos
      });

      // Process web results
      if (braveResponse.web && braveResponse.web.results) {
        articles = braveResponse.web.results.map((result, index) => ({
          id: index + 1,
          title: result.title || `Result ${index + 1}`,
          url: result.url || '#',
          preview: result.description || result.snippet || `Content from ${result.url}`,
          domain: result.url ? new URL(result.url).hostname : 'unknown',
          published: result.age || new Date().toISOString().split('T')[0],
          selected: false,
          extra_snippets: result.extra_snippets || [],
          meta_description: result.meta_description || '',
          thumbnail: result.thumbnail?.src || null
        }));
        
        console.log('✅ Successfully processed', articles.length, 'articles from Brave Search');
      }

      // Fallback if no web results
      if (articles.length === 0) {
        console.log('⚠️ No web results found in Brave response');
        articles = [
          {
            id: 1,
            title: `No results found for: ${query}`,
            url: "#",
            preview: `Brave Search completed but returned no web results for this query. Try modifying your search terms for better results.`,
            domain: "no-results",
            published: new Date().toISOString().split('T')[0],
            selected: false
          }
        ];
        method = 'no_results';
      }

    } catch (error) {
      console.error('⚠️ Brave Search failed:', error.message);
      
      // Error fallback
      articles = [
        {
          id: 1,
          title: `Search Error: ${query}`,
          url: "#",
          preview: `Brave Search API error: ${error.message}. Please check your API key and try again.`,
          domain: "error",
          published: new Date().toISOString().split('T')[0],
          selected: false
        }
      ];
      method = 'search_error';
    }

    console.log('📤 Sending response with:', {
      query: query,
      articles_count: articles.length,
      method: method,
      status: 'success'
    });

    const response = {
      original_query: query,
      articles: articles,
      method_used: method,
      timestamp: new Date().toISOString(),
      status: 'success',
      api_calls: apiCalls
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Search execution error:', error);
    
    const errorResponse = { 
      error: error.message,
      original_query: req.body.query || 'unknown',
      articles: [],
      status: 'error',
      timestamp: new Date().toISOString(),
      api_calls: []
    };
    
    res.status(500).json(errorResponse);
  }
});

// Generate Twitter content briefs from search results
app.post('/api/generate-twitter-briefs', async (req, res) => {
  try {
    const { articles, businessContext } = req.body;
    console.log('🐦 Twitter brief generation request received');
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'Articles array is required' });
    }
    
    // Build comprehensive context for brief generation
    const contextPrompt = businessContext ? `
Business Context:
- Company: ${businessContext.companyName || 'Not specified'}
- Launch Date: ${businessContext.launchDate || 'Not specified'}
- Target Market: ${businessContext.targetGeography || 'Not specified'}
- Business Details: ${businessContext.businessSpecifics || 'Not specified'}
- Category: ${businessContext.category || 'Not specified'}
- Additional Info: ${JSON.stringify(businessContext)}
` : 'No business context provided.';

    const briefingPrompt = `You are an expert content strategist creating Twitter content briefs. Your job is to evaluate search results and create HIGH-QUALITY Twitter content ONLY for ideas with real value.

${contextPrompt}

CRITICAL INSTRUCTIONS:
1. FILTER AGGRESSIVELY - Reject ideas that are too generic, lack concrete value, or don't align with business goals
2. NO FABRICATION - Use only information directly from the article. Never invent details.
3. AUTHENTIC VOICE - Write from the founder's perspective, not generic marketing
4. MULTIPLE ANGLES - For viable ideas, create 2-3 different tweet angles
5. BUSINESS VALUE - Every tweet must demonstrate expertise or advance business goals

VIABILITY CRITERIA:
✅ APPROVE ideas with:
- Specific data, metrics, or insights
- Real examples or case studies
- Unique perspectives or surprising information
- Clear value for the target audience
- Connection to business expertise

❌ REJECT ideas that are:
- Too generic or obvious
- Lacking concrete details
- Not relevant to business goals
- Requiring fabricated information
- Poor fit for Twitter engagement

ARTICLES TO EVALUATE:
${JSON.stringify(articles, null, 2)}

For each article, determine if it's viable for Twitter content. For viable articles, create 2-3 different tweet briefs.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "evaluated_count": <number of articles evaluated>,
  "viable_count": <number of viable articles>,
  "total_briefs": <total number of briefs generated>,
  "results": [
    {
      "article_id": <article id>,
      "article_title": "<original article title>",
      "viable": true/false,
      "rejection_reason": "<if not viable, explain why>",
      "briefs": [
        {
          "angle": "<specific angle/perspective for this tweet>",
          "hook": "<attention-grabbing first line>",
          "content": "<complete tweet text, 280 chars max>",
          "content_type": "single_tweet",
          "engagement_strategy": "<question/statement/statistic>",
          "hashtags": ["<relevant hashtag>"],
          "metrics_to_track": ["replies", "retweets", "clicks"]
        }
      ]
    }
  ]
}

Remember: Quality over quantity. It's better to have fewer excellent tweets than many mediocre ones.`;

    const briefsResponse = await callClaudeAPI(briefingPrompt, false);
    
    // Parse the response
    let briefs;
    try {
      const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        briefs = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated briefs: ${briefs.viable_count} viable articles, ${briefs.total_briefs} total briefs`);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse briefs:', parseError);
      return res.status(500).json({ error: 'Failed to parse content briefs' });
    }
    
    res.json(briefs);
    
  } catch (error) {
    console.error('Twitter brief generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
});