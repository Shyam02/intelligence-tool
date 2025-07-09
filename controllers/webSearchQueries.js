// ===== controllers/webSearchQueries.js =====
// Web search query generation controller - FIXED to use AI queries

async function generateQueries(req, res) {
  try {
    const foundationalIntelligence = req.body;
    
    // Initialize debug data
    global.webSearchDebugData = {
      timestamp: new Date().toISOString(),
      foundationalIntelligence: foundationalIntelligence,
      queryGeneration: {
        step: 'search_query_reformatting',
        timestamp: new Date().toISOString(),
        inputData: foundationalIntelligence,
        logic: {
          description: 'Use AI-generated queries from search_foundation instead of templates',
          sourceFile: 'controllers/webSearchQueries.js',
          functionName: 'generateQueries()',
          steps: [
            'Extract search_foundation from foundational intelligence',
            'Organize AI queries into frontend-expected structure',
            'Add competitor-specific queries if available',
            'Return formatted query structure'
          ]
        }
      },
      generatedQueries: null,
      searchExecutions: []
    };

    // VALIDATION: Ensure search_foundation exists
    const searchFoundation = foundationalIntelligence.search_foundation;
    if (!searchFoundation) {
      return res.status(400).json({ 
        error: 'search_foundation not found in foundational intelligence' 
      });
    }

    // USE AI-GENERATED QUERIES (no more templates!)
    const competitorQueries = {
      direct_competitors: searchFoundation.competitor_search_terms || [],
      content_discovery: searchFoundation.content_discovery_terms || [],
      audience_research: searchFoundation.audience_discovery_terms || []
    };

    const keywordQueries = {
      primary_keywords: searchFoundation.competitor_search_terms || [],
      content_keywords: searchFoundation.content_discovery_terms || [],
      audience_keywords: searchFoundation.audience_discovery_terms || []
    };

    const contentQueries = {
      twitter_content: searchFoundation.twitter_content_terms || [],
      linkedin_content: searchFoundation.linkedin_content_terms || [],
      instagram_content: searchFoundation.instagram_content_terms || [],
      discovery_terms: searchFoundation.content_discovery_terms || []
    };

    // ADD: Competitor-specific queries if available (keep existing logic)
    const competitorNames = foundationalIntelligence.competitor_intelligence?.competitor_analysis
      ?.map(comp => comp.company_name)
      ?.filter(name => name && name !== 'Not found') || [];

    if (competitorNames.length > 0) {
      competitorQueries.competitor_specific = competitorNames.slice(0, 3).map(name => 
        `"${name}" vs alternatives comparison`
      );
    }

    const allQueries = {
      competitor_queries: competitorQueries,
      keyword_queries: keywordQueries,
      content_queries: contentQueries
    };

    // Store in debug data
    global.webSearchDebugData.generatedQueries = allQueries;
    global.webSearchDebugData.queryGeneration.outputData = allQueries;
    global.webSearchDebugData.queryGeneration.sourceQueries = {
      competitor_search_terms: searchFoundation.competitor_search_terms?.length || 0,
      content_discovery_terms: searchFoundation.content_discovery_terms?.length || 0,
      audience_discovery_terms: searchFoundation.audience_discovery_terms?.length || 0,
      twitter_content_terms: searchFoundation.twitter_content_terms?.length || 0,
      linkedin_content_terms: searchFoundation.linkedin_content_terms?.length || 0,
      instagram_content_terms: searchFoundation.instagram_content_terms?.length || 0
    };

    console.log('✅ Using AI-generated queries from search_foundation');
    res.json(allQueries);

  } catch (error) {
    console.error('Error using AI queries:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateQueries
};