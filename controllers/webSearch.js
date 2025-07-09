// ===== controllers/webSearch.js =====
// Web search functionality controller
const { searchBrave } = require('../services/webSearch');
const { config } = require('../config/config');

// Execute search queries using Brave Search API
async function executeSearch(req, res) {
  try {
    const { query } = req.body;
    console.log('🔍 Search request received for query:', query);
    
    // Initialize debug data if not exists
    if (!global.webSearchDebugData) {
      global.webSearchDebugData = {
        timestamp: new Date().toISOString(),
        searchExecutions: []
      };
    }
    
    // Add search execution to debug data
    const searchExecution = {
      step: 'web_search_execution',
      timestamp: new Date().toISOString(),
      query: query,
      searchScope: 'Global (Country Neutral)',
      logic: {
        description: 'Execute global web search using Brave Search API',
        sourceFile: 'controllers/webSearch.js',
        functionName: 'executeSearch()',
        steps: [
          'Validate query and API configuration',
          'Call Brave Search API with global search parameters',
          'Process web results and create enhanced previews',
          'Handle errors and provide fallbacks',
          'Return formatted search results with rich preview data'
        ]
      },
      apiCalls: [],
      results: null,
      error: null
    };
    
    global.webSearchDebugData.searchExecutions.push(searchExecution);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!config.braveApiKey) {
      return res.status(500).json({ error: 'Brave API key not configured' });
    }
    
    let method = 'brave_search_api_global';
    let apiCalls = [];
    let articles = [];
    
    try {
      console.log('🌐 Executing global search with Brave Search API...');
      
      // Call Brave Search API with global parameters
      const braveResponse = await searchBrave(query, 10);
      
      const apiCall = {
        call: 1,
        type: 'brave_search_api_global',
        query: query,
        searchScope: 'Global (Country Neutral)',
        results_count: braveResponse.web?.results?.length || 0,
        timestamp: new Date().toISOString(),
        logic: {
          description: 'Global Brave Search API call',
          sourceFile: 'services/webSearch.js',
          functionName: 'searchBrave()',
          steps: [
            'Send HTTP request to Brave Search API without country restriction',
            'Handle rate limiting and authentication',
            'Parse JSON response',
            'Extract web results with enhanced preview data'
          ]
        }
      };
      
      apiCalls.push(apiCall);
      searchExecution.apiCalls.push(apiCall);

      console.log('📊 Brave search response structure:', {
        hasWeb: !!braveResponse.web,
        webResultsCount: braveResponse.web?.results?.length || 0,
        hasNews: !!braveResponse.news,
        hasVideos: !!braveResponse.videos,
        searchScope: 'Global'
      });

      // Process web results with enhanced preview
      if (braveResponse.web && braveResponse.web.results) {
        articles = braveResponse.web.results.map((result, index) => {
          
          // Create enhanced preview from multiple sources
          const previewParts = [];
          
          // Primary description
          if (result.description) {
            previewParts.push(result.description);
          }
          
          // Add snippet if different from description
          if (result.snippet && result.snippet !== result.description) {
            previewParts.push(result.snippet);
          }
          
          // Add meta description if available and different
          if (result.meta_description && 
              result.meta_description !== result.description && 
              result.meta_description !== result.snippet) {
            previewParts.push(result.meta_description);
          }
          
          // Add extra snippets if available
          if (result.extra_snippets && result.extra_snippets.length > 0) {
            result.extra_snippets.forEach(snippet => {
              if (snippet && !previewParts.includes(snippet)) {
                previewParts.push(snippet);
              }
            });
          }
          
          // Create comprehensive preview (max 500 chars)
          const enhancedPreview = previewParts
            .filter(part => part && part.trim().length > 0)
            .join(' • ')
            .slice(0, 500);
          
          return {
            id: index + 1,
            title: result.title || `Result ${index + 1}`,
            url: result.url || '#',
            preview: enhancedPreview || `Content from ${result.url}`,
            domain: result.url ? new URL(result.url).hostname : 'unknown',
            published: result.age || new Date().toISOString().split('T')[0],
            selected: false,
            
            // Enhanced preview data
            original_description: result.description || '',
            original_snippet: result.snippet || '',
            meta_description: result.meta_description || '',
            extra_snippets: result.extra_snippets || [],
            thumbnail: result.thumbnail?.src || null,
            
            // Additional metadata
            site_name: result.site_name || '',
            language: result.language || 'en',
            family_friendly: result.family_friendly !== false,
            
            // Preview statistics
            preview_source_count: previewParts.length,
            preview_length: enhancedPreview.length,
            has_thumbnail: !!result.thumbnail?.src,
            
            // Search context
            search_scope: 'Global',
            query_relevance: index + 1  // Position in results
          };
        });
        
        console.log('✅ Successfully processed', articles.length, 'articles with enhanced previews from Global Brave Search');
      }

      // Fallback if no web results
      if (articles.length === 0) {
        console.log('⚠️ No web results found in Brave response');
        articles = [
          {
            id: 1,
            title: `No results found for: ${query}`,
            url: "#",
            preview: `Global Brave Search completed but returned no web results for this query. Try modifying your search terms for better results.`,
            domain: "no-results",
            published: new Date().toISOString().split('T')[0],
            selected: false,
            search_scope: 'Global',
            preview_source_count: 0,
            preview_length: 0
          }
        ];
        method = 'no_results_global';
      }

    } catch (error) {
      console.error('⚠️ Brave Search failed:', error.message);
      
      // Store error in debug data
      searchExecution.error = error.message;
      
      // Error fallback
      articles = [
        {
          id: 1,
          title: `Search Error: ${query}`,
          url: "#",
          preview: `Global Brave Search API error: ${error.message}. Please try again with different search terms.`,
          domain: "error",
          published: new Date().toISOString().split('T')[0],
          selected: false,
          search_scope: 'Global',
          preview_source_count: 0,
          preview_length: 0
        }
      ];
      method = 'error_global';
    }

    // Store results in debug data
    searchExecution.results = articles;

    const response = {
      success: true,
      query: query,
      method: method,
      search_scope: 'Global (Country Neutral)',
      articles: articles,
      total_results: articles.length,
      api_calls: apiCalls,
      timestamp: new Date().toISOString(),
      
      // Enhanced preview statistics
      preview_stats: {
        total_articles: articles.length,
        articles_with_thumbnails: articles.filter(a => a.has_thumbnail).length,
        average_preview_length: articles.length > 0 ? 
          Math.round(articles.reduce((sum, a) => sum + (a.preview_length || 0), 0) / articles.length) : 0,
        total_preview_sources: articles.reduce((sum, a) => sum + (a.preview_source_count || 0), 0)
      }
    };

    console.log('✅ Search completed successfully:', {
      query: query,
      results: articles.length,
      method: method,
      searchScope: 'Global'
    });

    res.json(response);
    
  } catch (error) {
    console.error('Search execution error:', error);
    res.status(500).json({ 
      error: error.message,
      query: req.body.query || 'unknown',
      search_scope: 'Global',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  executeSearch
};