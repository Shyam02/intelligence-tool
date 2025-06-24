// Search functionality controller
const { searchBrave } = require('../services/search');
const { config } = require('../config/config');

// Execute search queries using Brave Search API
async function executeSearch(req, res) {
  try {
    const { query } = req.body;
    console.log('🔍 Search request received for query:', query);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!config.braveApiKey) {
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
}

module.exports = {
  executeSearch
};