// Reddit API service - Core Reddit communication functionality
const axios = require('axios');
const { config } = require('../config/config');

// Helper function to get Reddit access token
async function getRedditAccessToken() {
  try {
    const auth = Buffer.from(`${config.reddit.clientId}:${config.reddit.clientSecret}`).toString('base64');
    
    const response = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': config.reddit.userAgent
        }
      }
    );
    
    console.log('✅ Reddit access token obtained');
    return response.data.access_token;
    
  } catch (error) {
    console.error('❌ Reddit authentication failed:', error.message);
    throw new Error('Reddit API authentication failed: ' + error.message);
  }
}

// Search Reddit for posts and discussions
async function searchReddit(query, subreddit = null, timeFrame = 'month', limit = 25) {
  try {
    console.log('🔍 Searching Reddit for:', query, subreddit ? `in r/${subreddit}` : 'sitewide');
    
    const accessToken = await getRedditAccessToken();
    
    // Build search URL
    let searchUrl = 'https://oauth.reddit.com/search';
    const params = {
      q: query,
      type: 'link,sr',
      sort: 'relevance',
      t: timeFrame,
      limit: limit,
      raw_json: 1
    };
    
    // If searching specific subreddit
    if (subreddit) {
      params.restrict_sr = 'true';
      params.subreddit = subreddit;
    }
    
    const response = await axios.get(searchUrl, {
      params: params,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': config.reddit.userAgent
      }
    });
    
    const posts = response.data.data.children.map(child => child.data);
    console.log('✅ Reddit search completed:', posts.length, 'posts found');
    
    return posts;
    
  } catch (error) {
    console.error('❌ Reddit search failed:', error.response?.status, error.message);
    throw new Error(`Reddit search failed: ${error.message}`);
  }
}

// Discover relevant subreddits based on keywords
async function discoverSubreddits(keywords, limit = 10) {
  try {
    console.log('🔍 Discovering subreddits for keywords:', keywords);
    
    const accessToken = await getRedditAccessToken();
    const subreddits = [];
    
    // Search for subreddits using each keyword
    for (const keyword of keywords.slice(0, 3)) { // Limit to 3 keywords to avoid rate limits
      try {
        const response = await axios.get('https://oauth.reddit.com/subreddits/search', {
          params: {
            q: keyword,
            type: 'sr',
            sort: 'relevance',
            limit: 5,
            raw_json: 1
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': config.reddit.userAgent
          }
        });
        
        const foundSubreddits = response.data.data.children.map(child => ({
          name: child.data.display_name,
          title: child.data.title,
          description: child.data.public_description,
          subscribers: child.data.subscribers,
          url: `https://reddit.com/r/${child.data.display_name}`,
          keyword_source: keyword
        }));
        
        subreddits.push(...foundSubreddits);
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (keywordError) {
        console.log(`⚠️ Failed to search for keyword "${keyword}":`, keywordError.message);
        continue;
      }
    }
    
    // Remove duplicates and sort by subscriber count
    const uniqueSubreddits = subreddits
      .filter((subreddit, index, self) => 
        index === self.findIndex(s => s.name === subreddit.name)
      )
      .sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0))
      .slice(0, limit);
    
    console.log('✅ Discovered', uniqueSubreddits.length, 'relevant subreddits');
    return uniqueSubreddits;
    
  } catch (error) {
    console.error('❌ Subreddit discovery failed:', error.message);
    throw new Error(`Subreddit discovery failed: ${error.message}`);
  }
}

// Format Reddit posts to match existing article structure
function formatRedditPostsAsArticles(redditPosts) {
  return redditPosts.map((post, index) => {
    // Create engaging title
    const title = post.title.length > 80 
      ? `${post.title.substring(0, 80)}...` 
      : post.title;
    
    // Create preview with context
    let preview = '';
    if (post.selftext && post.selftext.trim()) {
      // For text posts, use the content
      preview = post.selftext.length > 200 
        ? `"${post.selftext.substring(0, 200)}..."` 
        : `"${post.selftext}"`;
    } else {
      // For link posts, use title as preview
      preview = `Reddit discussion: "${title}"`;
    }
    
    // Add engagement context
    const engagement = `(${post.score || 0} upvotes, ${post.num_comments || 0} comments from r/${post.subreddit})`;
    preview += ` ${engagement}`;
    
    // Format date
    const publishedDate = post.created_utc 
      ? new Date(post.created_utc * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    return {
      id: `reddit_${index + 1}`,
      title: `Reddit: ${title}`,
      url: `https://reddit.com${post.permalink}`,
      preview: preview,
      domain: 'reddit.com',
      published: publishedDate,
      selected: false,
      // Additional Reddit-specific metadata for internal use
      source_type: 'reddit',
      subreddit: post.subreddit,
      upvotes: post.score || 0,
      comments: post.num_comments || 0,
      post_type: post.selftext ? 'text' : 'link',
      original_title: post.title
    };
  });
}

// Get trending posts from specific subreddits
async function getTrendingPosts(subredditNames, limit = 10) {
  try {
    console.log('📈 Getting trending posts from:', subredditNames);
    
    const accessToken = await getRedditAccessToken();
    const allPosts = [];
    
    // Get hot posts from each subreddit
    for (const subredditName of subredditNames.slice(0, 5)) { // Limit to 5 subreddits
      try {
        const response = await axios.get(`https://oauth.reddit.com/r/${subredditName}/hot`, {
          params: {
            limit: Math.min(limit, 10),
            raw_json: 1
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': config.reddit.userAgent
          }
        });
        
        const posts = response.data.data.children.map(child => child.data);
        allPosts.push(...posts);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (subredditError) {
        console.log(`⚠️ Failed to get trending posts from r/${subredditName}:`, subredditError.message);
        continue;
      }
    }
    
    // Sort by score and limit results
    const trendingPosts = allPosts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
    
    console.log('✅ Retrieved', trendingPosts.length, 'trending posts');
    return trendingPosts;
    
  } catch (error) {
    console.error('❌ Failed to get trending posts:', error.message);
    throw new Error(`Failed to get trending posts: ${error.message}`);
  }
}

// Test Reddit API connection
async function testRedditAPI() {
  try {
    if (!config.reddit.clientId || !config.reddit.clientSecret) {
      return { 
        status: 'error', 
        message: 'Reddit API credentials not configured' 
      };
    }
    
    const accessToken = await getRedditAccessToken();
    
    // Test a simple search
    const testQuery = 'productivity';
    const results = await searchReddit(testQuery, null, 'week', 1);
    
    return { 
      status: 'success', 
      message: 'Reddit API working correctly',
      test_results: `Found ${results.length} results for "${testQuery}"`
    };
    
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Reddit API test failed: ' + error.message 
    };
  }
}

module.exports = {
  searchReddit,
  discoverSubreddits,
  formatRedditPostsAsArticles,
  getTrendingPosts,
  testRedditAPI
};