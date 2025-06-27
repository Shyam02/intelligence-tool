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
    
    console.log('🎯 Using keywords for discovery:', keywords);
    
    // Discover subreddits
    const subreddits = await discoverSubreddits(keywords, 15);
    
    // Filter and rank subreddits based on relevance
    const relevantSubreddits = subreddits.filter(subreddit => 
      subreddit.subscribers > 1000 && // Minimum activity threshold
      subreddit.name && 
      subreddit.title
    );
    
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

// Search Reddit discussions using generated queries
async function searchRedditDiscussions(req, res) {
  try {
    const { searchQueries, subreddits, timeFrame = 'month' } = req.body;
    
    if (!searchQueries || !Array.isArray(searchQueries) || searchQueries.length === 0) {
      return res.status(400).json({ error: 'Search queries array is required' });
    }
    
    console.log('🔍 Starting Reddit discussion search with', searchQueries.length, 'queries...');
    
    const allPosts = [];
    const searchResults = [];
    
    // Execute searches (limit to prevent rate limiting)
    const limitedQueries = searchQueries.slice(0, 5); // Limit to 5 queries
    
    for (let i = 0; i < limitedQueries.length; i++) {
      const query = limitedQueries[i];
      console.log(`🔍 Executing search ${i + 1}/${limitedQueries.length}: ${query}`);
      
      try {
        // Search sitewide first
        const sitewideResults = await searchReddit(query, null, timeFrame, 10);
        
        let subredditResults = [];
        // If specific subreddits provided, search within them too
        if (subreddits && subreddits.length > 0) {
          const targetSubreddit = subreddits[i % subreddits.length]; // Rotate through subreddits
          subredditResults = await searchReddit(query, targetSubreddit, timeFrame, 5);
        }
        
        const combinedResults = [...sitewideResults, ...subredditResults];
        allPosts.push(...combinedResults);
        
        searchResults.push({
          query: query,
          sitewide_results: sitewideResults.length,
          subreddit_results: subredditResults.length,
          total_results: combinedResults.length
        });
        
        console.log(`✅ Search ${i + 1} completed: ${combinedResults.length} posts found`);
        
        // Rate limiting: wait between searches
        if (i < limitedQueries.length - 1) {
          console.log('⏱️ Waiting 1 second before next search...');
          await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Format as articles for existing system
    const formattedArticles = formatRedditPostsAsArticles(sortedPosts.slice(0, 25)); // Limit to top 25
    
    console.log('✅ Reddit discussion search completed:', formattedArticles.length, 'unique discussions found');
    
    res.json({
      success: true,
      search_queries: limitedQueries,
      search_results: searchResults,
      total_posts_found: uniquePosts.length,
      articles: formattedArticles,
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

module.exports = {
  discoverRelevantSubreddits,
  searchRedditDiscussions,
  getRedditTrending
};