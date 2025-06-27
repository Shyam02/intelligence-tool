// Reddit API service - Core Reddit communication functionality with FIXED response handling
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

// FIXED: Search Reddit for posts and discussions with proper error handling
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
    
    console.log('📊 Reddit API raw response structure:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : 'none',
      dataType: typeof response.data
    });
    
    // FIXED: Better response structure handling
    if (!response.data) {
      console.log('⚠️ Reddit API returned no data');
      return [];
    }
    
    // Log the actual structure we received
    console.log('📋 Reddit response structure:', JSON.stringify(response.data, null, 2).substring(0, 500));
    
    // FIXED: Handle different possible response structures
    let posts = [];
    
    // Try the expected structure first
    if (response.data.data && response.data.data.children) {
      posts = response.data.data.children.map(child => child.data);
      console.log('✅ Used standard Reddit response structure');
    }
    // Try alternative structure
    else if (response.data.children) {
      posts = response.data.children.map(child => child.data);
      console.log('✅ Used alternative Reddit response structure');
    }
    // Try direct data array
    else if (Array.isArray(response.data)) {
      posts = response.data;
      console.log('✅ Used direct array Reddit response structure');
    }
    // Handle empty but successful response
    else if (response.data.error) {
      console.log('⚠️ Reddit API returned error:', response.data.error);
      return [];
    }
    else {
      console.log('⚠️ Unexpected Reddit response structure, trying to extract data...');
      
      // Try to find any array in the response
      const findArrayInObject = (obj) => {
        if (Array.isArray(obj)) return obj;
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            const result = findArrayInObject(obj[key]);
            if (result) return result;
          }
        }
        return null;
      };
      
      const foundArray = findArrayInObject(response.data);
      if (foundArray && foundArray.length > 0) {
        posts = foundArray.filter(item => item && typeof item === 'object');
        console.log('✅ Found array data in Reddit response');
      } else {
        console.log('❌ No usable data found in Reddit response');
        return [];
      }
    }
    
    // Validate posts
    if (!Array.isArray(posts)) {
      console.log('⚠️ Posts is not an array:', typeof posts);
      return [];
    }
    
    // Filter valid posts
    const validPosts = posts.filter(post => 
      post && 
      typeof post === 'object' && 
      (post.title || post.name || post.id)
    );
    
    console.log('✅ Reddit search completed:', validPosts.length, 'valid posts found out of', posts.length, 'total items');
    
    return validPosts;
    
  } catch (error) {
    console.error('❌ Reddit search failed:', error.response?.status, error.message);
    
    // Log more details for debugging
    if (error.response) {
      console.error('📊 Reddit API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
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
        
        // FIXED: Same structure handling for subreddit search
        let subredditData = [];
        if (response.data.data && response.data.data.children) {
          subredditData = response.data.data.children;
        } else if (response.data.children) {
          subredditData = response.data.children;
        } else {
          console.log('⚠️ Unexpected subreddit response structure for keyword:', keyword);
          continue;
        }
        
        const foundSubreddits = subredditData.map(child => ({
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
  console.log('📝 Formatting', redditPosts.length, 'Reddit posts as articles');
  
  return redditPosts.map((post, index) => {
    // Handle different post structures
    const title = post.title || post.name || `Reddit Post ${index + 1}`;
    const selftext = post.selftext || post.body || '';
    const subreddit = post.subreddit || 'unknown';
    const score = post.score || post.ups || 0;
    const numComments = post.num_comments || post.comment_count || 0;
    const permalink = post.permalink || `/r/${subreddit}/comments/${post.id}/`;
    const createdUtc = post.created_utc || Math.floor(Date.now() / 1000);
    
    // Create engaging title
    const displayTitle = title.length > 80 
      ? `${title.substring(0, 80)}...` 
      : title;
    
    // Create preview with context
    let preview = '';
    if (selftext && selftext.trim()) {
      // For text posts, use the content
      preview = selftext.length > 200 
        ? `"${selftext.substring(0, 200)}..."` 
        : `"${selftext}"`;
    } else {
      // For link posts, use title as preview
      preview = `Reddit discussion: "${displayTitle}"`;
    }
    
    // Add engagement context
    const engagement = `(${score} upvotes, ${numComments} comments from r/${subreddit})`;
    preview += ` ${engagement}`;
    
    // Format date
    const publishedDate = createdUtc 
      ? new Date(createdUtc * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    return {
      id: `reddit_${index + 1}`,
      title: `Reddit: ${displayTitle}`,
      url: `https://reddit.com${permalink}`,
      preview: preview,
      domain: 'reddit.com',
      published: publishedDate,
      selected: false,
      // Additional Reddit-specific metadata for internal use
      source_type: 'reddit',
      subreddit: subreddit,
      upvotes: score,
      comments: numComments,
      post_type: selftext ? 'text' : 'link',
      original_title: title
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
        
        // FIXED: Same structure handling for trending posts
        let posts = [];
        if (response.data.data && response.data.data.children) {
          posts = response.data.data.children.map(child => child.data);
        } else if (response.data.children) {
          posts = response.data.children.map(child => child.data);
        } else {
          console.log('⚠️ Unexpected trending response structure for subreddit:', subredditName);
          continue;
        }
        
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