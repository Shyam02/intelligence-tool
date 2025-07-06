// Reddit controllers - Handle Reddit-related HTTP requests
const { searchReddit, discoverSubreddits, formatRedditPostsAsArticles, getTrendingPosts } = require('../services/reddit');
const { callClaudeAPI } = require('../services/ai');
const { reddit } = require('../prompts');

// Discover relevant subreddits based on business intelligence
async function discoverRelevantSubreddits(req, res) {
  try {
    const { foundationalIntelligence } = req.body;
    
    if (!foundationalIntelligence) {
      return res.status(400).json({ error: 'Foundational intelligence data is required' });
    }
    
    // Initialize debug data if not exists
    if (!global.redditDebugData) {
      global.redditDebugData = {
        timestamp: new Date().toISOString(),
        foundationalIntelligence: foundationalIntelligence,
        queryGeneration: null,
        subredditDiscovery: null,
        searchExecutions: []
      };
    }
    
    // Add subreddit discovery to debug data
    global.redditDebugData.subredditDiscovery = {
      step: 'subreddit_discovery',
      timestamp: new Date().toISOString(),
      inputData: foundationalIntelligence,
      logic: {
        description: 'Discover relevant subreddits based on business intelligence',
        sourceFile: 'controllers/reddit.js',
        functionName: 'discoverRelevantSubreddits()',
        steps: [
          'Extract keywords from business intelligence',
          'Call Reddit API for subreddit discovery',
          'Filter subreddits by relevance and activity',
          'Return ranked list of relevant subreddits'
        ]
      },
      keywords: [],
      discoveredSubreddits: [],
      error: null
    };
    
    console.log('🔍 Starting subreddit discovery based on business intelligence...');
    
    // Extract keywords for subreddit discovery
    const keywords = [
      ...foundationalIntelligence.core_keywords?.industry_keywords || [],
      ...foundationalIntelligence.core_keywords?.product_keywords || [],
      foundationalIntelligence.target_market?.market_segment || '',
      foundationalIntelligence.industry_classification?.primary_industry || ''
    ].filter(keyword => keyword && keyword.trim() !== '');
    
    if (keywords.length === 0) {
      return res.status(400).json({ error: 'No keywords found in business intelligence for subreddit discovery' });
    }
    
    // Store keywords in debug data
    global.redditDebugData.subredditDiscovery.keywords = keywords;
    
    console.log('🎯 Using keywords for discovery:', keywords);
    
    // Discover subreddits
    const subreddits = await discoverSubreddits(keywords, 15);
    
    // Filter and rank subreddits based on relevance
    const relevantSubreddits = subreddits.filter(subreddit => 
      subreddit.subscribers > 1000 && // Minimum activity threshold
      subreddit.name && 
      subreddit.title
    );
    
    // Store results in debug data
    global.redditDebugData.subredditDiscovery.discoveredSubreddits = relevantSubreddits;
    global.redditDebugData.subredditDiscovery.totalSubredditsFound = relevantSubreddits.length;
    
    console.log('✅ Subreddit discovery completed:', relevantSubreddits.length, 'relevant subreddits found');
    
    res.json({
      success: true,
      keywords_used: keywords,
      subreddits_found: relevantSubreddits.length,
      subreddits: relevantSubreddits,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Subreddit discovery failed:', error.message);
    res.status(500).json({ 
      error: 'Subreddit discovery failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// UPDATED: Search Reddit discussions using generated queries (supports single or multiple queries)
async function searchRedditDiscussions(req, res) {
  try {
    const { searchQueries, subreddits, timeFrame = 'month' } = req.body;
    
    if (!searchQueries || !Array.isArray(searchQueries) || searchQueries.length === 0) {
      return res.status(400).json({ error: 'Search queries array is required' });
    }
    
    // Initialize debug data if not exists
    if (!global.redditDebugData) {
      global.redditDebugData = {
        timestamp: new Date().toISOString(),
        searchExecutions: []
      };
    }
    
    // Add search execution to debug data
    const searchExecution = {
      step: 'reddit_search_execution',
      timestamp: new Date().toISOString(),
      searchQueries: searchQueries,
      subreddits: subreddits || [],
      timeFrame: timeFrame,
      logic: {
        description: 'Search Reddit discussions using generated queries',
        sourceFile: 'controllers/reddit.js',
        functionName: 'searchRedditDiscussions()',
        steps: [
          'Validate search queries and parameters',
          'Execute searches for each query',
          'Search sitewide and within specific subreddits',
          'Remove duplicates and sort by engagement',
          'Format results as articles'
        ]
      },
      searchResults: [],
      finalResults: null,
      error: null
    };
    
    global.redditDebugData.searchExecutions.push(searchExecution);
    
    console.log('🔍 Starting Reddit discussion search with', searchQueries.length, 'queries...');
    
    const allPosts = [];
    const searchResults = [];
    
    // UPDATED: Support both single and multiple queries efficiently
    const limitedQueries = searchQueries.slice(0, 5); // Limit to 5 queries maximum for rate limiting
    const isMultipleQueries = limitedQueries.length > 1;
    
    // Execute searches
    for (let i = 0; i < limitedQueries.length; i++) {
      const query = limitedQueries[i];
      console.log(`🔍 Executing search ${i + 1}/${limitedQueries.length}: ${query}`);
      
      try {
        // UPDATED: Adjust search limits based on single vs multiple queries
        const searchLimit = isMultipleQueries ? 10 : 15; // More results for single query
        const subredditLimit = isMultipleQueries ? 5 : 8;  // More subreddit results for single query
        
        // Search sitewide first
        const sitewideResults = await searchReddit(query, null, timeFrame, searchLimit);
        
        let subredditResults = [];
        // If specific subreddits provided, search within them too
        if (subreddits && subreddits.length > 0) {
          const targetSubreddit = subreddits[i % subreddits.length]; // Rotate through subreddits
          subredditResults = await searchReddit(query, targetSubreddit, timeFrame, subredditLimit);
        }
        
        const combinedResults = [...sitewideResults, ...subredditResults];
        allPosts.push(...combinedResults);
        
        const searchResult = {
          query: query,
          sitewide_results: sitewideResults.length,
          subreddit_results: subredditResults.length,
          total_results: combinedResults.length,
          logic: {
            description: 'Individual Reddit search result',
            sourceFile: 'services/reddit.js',
            functionName: 'searchReddit()',
            steps: [
              'Search Reddit API with query',
              'Handle rate limiting and authentication',
              'Parse JSON response',
              'Extract post data'
            ]
          }
        };
        
        searchResults.push(searchResult);
        searchExecution.searchResults.push(searchResult);
        
        console.log(`✅ Search ${i + 1} completed: ${combinedResults.length} posts found`);
        
        // UPDATED: Shorter delay for single queries, longer for multiple
        if (i < limitedQueries.length - 1) {
          const delay = isMultipleQueries ? 1000 : 500; // 0.5s for single, 1s for multiple
          console.log(`⏱️ Waiting ${delay}ms before next search...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (searchError) {
        console.error(`❌ Search failed for query "${query}":`, searchError.message);
        searchResults.push({
          query: query,
          error: searchError.message,
          sitewide_results: 0,
          subreddit_results: 0,
          total_results: 0
        });
        
        // Continue with other searches
        continue;
      }
    }
    
    // Remove duplicates (same post ID)
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    
    // Sort by engagement (score + comments)
    const sortedPosts = uniquePosts.sort((a, b) => {
      const scoreA = (a.score || 0) + (a.num_comments || 0);
      const scoreB = (b.score || 0) + (b.num_comments || 0);
      return scoreB - scoreA;
    });
    
    // UPDATED: Return more results for single queries
    const maxResults = isMultipleQueries ? 25 : 35;
    const formattedArticles = formatRedditPostsAsArticles(sortedPosts.slice(0, maxResults));
    
    console.log('✅ Reddit discussion search completed:', formattedArticles.length, 'unique discussions found');
    
    // Store final results in debug data
    searchExecution.finalResults = {
      total_posts_found: uniquePosts.length,
      articles_count: formattedArticles.length,
      query_type: isMultipleQueries ? 'multiple' : 'single',
      articles: formattedArticles
    };
    
    res.json({
      success: true,
      search_queries: limitedQueries,
      search_results: searchResults,
      total_posts_found: uniquePosts.length,
      articles: formattedArticles,
      query_type: isMultipleQueries ? 'multiple' : 'single',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Reddit discussion search failed:', error.message);
    res.status(500).json({ 
      error: 'Reddit discussion search failed: ' + error.message,
      search_queries: req.body.searchQueries || [],
      articles: [],
      timestamp: new Date().toISOString()
    });
  }
}

// Get trending content from discovered subreddits
async function getRedditTrending(req, res) {
  try {
    const { subredditNames } = req.body;
    
    if (!subredditNames || !Array.isArray(subredditNames) || subredditNames.length === 0) {
      return res.status(400).json({ error: 'Subreddit names array is required' });
    }
    
    console.log('📈 Getting trending content from', subredditNames.length, 'subreddits...');
    
    const trendingPosts = await getTrendingPosts(subredditNames, 20);
    const formattedArticles = formatRedditPostsAsArticles(trendingPosts);
    
    console.log('✅ Retrieved', formattedArticles.length, 'trending discussions');
    
    res.json({
      success: true,
      subreddits_monitored: subredditNames,
      trending_posts_found: trendingPosts.length,
      articles: formattedArticles,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Reddit trending failed:', error.message);
    res.status(500).json({ 
      error: 'Reddit trending failed: ' + error.message,
      subreddits_monitored: req.body.subredditNames || [],
      articles: [],
      timestamp: new Date().toISOString()
    });
  }
}

// FIXED: Generate Reddit search queries using AI with robust error handling
async function generateRedditSearchQueries(req, res) {
  try {
    const { foundationalIntelligence } = req.body;
    
    if (!foundationalIntelligence) {
      return res.status(400).json({ error: 'Foundational intelligence data is required' });
    }
    
    // Initialize debug data
    global.redditDebugData = {
      timestamp: new Date().toISOString(),
      foundationalIntelligence: foundationalIntelligence,
      queryGeneration: {
        step: 'reddit_query_generation',
        timestamp: new Date().toISOString(),
        inputData: foundationalIntelligence,
        logic: {
          description: 'Generate Reddit search queries using AI',
          sourceFile: 'controllers/reddit.js',
          functionName: 'generateRedditSearchQueries()',
          steps: [
            'Prepare AI prompt with business intelligence',
            'Send prompt to Claude API for query generation',
            'Parse AI response and extract structured queries',
            'Handle parsing errors with fallback queries',
            'Return formatted query array'
          ]
        }
      },
      subredditDiscovery: null,
      searchExecutions: []
    };
    
    console.log('🔍 Starting AI-powered Reddit query generation...');
    
    // Use the sophisticated AI prompt for Reddit query generation
    const redditQueryPrompt = reddit.generateRedditSearchQueries(foundationalIntelligence);
    const redditQueriesResponse = await callClaudeAPI(redditQueryPrompt, false, null, 'AI: Reddit Queries');
    
    // Store AI interaction in debug data
    global.redditDebugData.queryGeneration.aiInteraction = {
      prompt: redditQueryPrompt,
      response: redditQueriesResponse,
      promptSource: {
        sourceFile: 'prompts/reddit/queryGeneration.js',
        functionName: 'generateRedditSearchQueries()',
        description: 'AI prompt for Reddit search query generation'
      }
    };
    
    // Parse the AI response
    let generatedQueries;
    try {
      const jsonMatch = redditQueriesResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedQueries = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed AI-generated Reddit queries');
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse Reddit queries from AI, using fallback queries:', parseError.message);
      
      // FALLBACK: Generate basic queries using business intelligence data
      const primaryProblem = foundationalIntelligence.pain_points?.primary_problem || 'productivity issues';
      const productKeywords = foundationalIntelligence.core_keywords?.product_keywords || ['business tools'];
      const targetMarket = foundationalIntelligence.target_market?.market_segment || 'small business';
      const industryKeywords = foundationalIntelligence.core_keywords?.industry_keywords || ['business'];
      const solutionKeywords = foundationalIntelligence.core_keywords?.solution_keywords || ['solutions'];
      const competitorName = foundationalIntelligence.competitor_intelligence?.competitor_analysis?.[0]?.company_name || 'existing solutions';
      
      generatedQueries = {
        pain_point_queries: [
          `struggling with ${primaryProblem}`,
          `frustrated with ${productKeywords[0] || 'productivity tools'}`,
          `${primaryProblem} driving me crazy`
        ],
        solution_seeking_queries: [
          `looking for ${solutionKeywords[0] || 'business solutions'} recommendations`,
          `best ${productKeywords[0] || 'tools'} for ${targetMarket}`,
          `alternatives to ${competitorName}`
        ],
        competitor_queries: [
          `${competitorName} problems`,
          `${competitorName} vs alternatives`
        ],
        industry_discussion_queries: [
          `${industryKeywords[0] || 'business'} trends 2024`,
          `${targetMarket} ${primaryProblem} discussion`,
          `${solutionKeywords[0] || 'solutions'} for ${industryKeywords[0] || 'business'}`,
          `${productKeywords[0] || 'tools'} recommendations`
        ]
      };
      
      console.log('✅ Generated fallback Reddit queries successfully');
    }
    
    // Extract queries into a simple array for consistency with frontend expectations
    const queryArray = [];
    if (generatedQueries.pain_point_queries && Array.isArray(generatedQueries.pain_point_queries)) {
      queryArray.push(...generatedQueries.pain_point_queries);
    }
    if (generatedQueries.solution_seeking_queries && Array.isArray(generatedQueries.solution_seeking_queries)) {
      queryArray.push(...generatedQueries.solution_seeking_queries);
    }
    if (generatedQueries.competitor_queries && Array.isArray(generatedQueries.competitor_queries)) {
      queryArray.push(...generatedQueries.competitor_queries);
    }
    if (generatedQueries.industry_discussion_queries && Array.isArray(generatedQueries.industry_discussion_queries)) {
      queryArray.push(...generatedQueries.industry_discussion_queries);
    }
    
    console.log('✅ Reddit query generation completed:', queryArray.length, 'queries generated');
    
    // Store generated queries in debug data
    global.redditDebugData.queryGeneration.outputData = {
      queries: queryArray,
      structured_queries: generatedQueries,
      total_queries: queryArray.length
    };
    
    res.json({
      success: true,
      queries: queryArray,
      structured_queries: generatedQueries,
      total_queries: queryArray.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Reddit query generation failed completely:', error.message);
    
    // ULTIMATE FALLBACK: Return basic generic queries
    const fallbackQueries = [
      'looking for productivity tools',
      'business automation software',
      'struggling with workflow management', 
      'small business efficiency tools',
      'alternatives to current solutions',
      'best business tools 2024',
      'startup productivity recommendations',
      'workflow optimization discussion'
    ];
    
    res.json({ 
      success: true,
      queries: fallbackQueries,
      structured_queries: {
        pain_point_queries: fallbackQueries.slice(0, 3),
        solution_seeking_queries: fallbackQueries.slice(3, 6),
        competitor_queries: fallbackQueries.slice(6, 7),
        industry_discussion_queries: fallbackQueries.slice(7, 8)
      },
      total_queries: fallbackQueries.length,
      fallback_used: true,
      error_message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  discoverRelevantSubreddits,
  searchRedditDiscussions,
  getRedditTrending,
  generateRedditSearchQueries
};