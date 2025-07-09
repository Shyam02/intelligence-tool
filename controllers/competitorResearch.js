// Competitor research controller
const { callClaudeAPI } = require('../services/ai');
const { crawlHomepageOnly } = require('../services/websiteCrawler');
const { searchBrave } = require('../services/webSearch');
const { intelligence } = require('../prompts');
const systemLogger = require('../services/systemLogger');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ENHANCED: Perform competitor research with global search and better logging
async function performCompetitorResearch(competitorQueries, businessContext, masterId = null, businessPrompt = null, businessAiResponse = null) {
  // Initialize global debug data
  global.competitorDebugData = {
    timestamp: new Date().toISOString(),
    competitorQueries: competitorQueries,
    businessContext: businessContext,
    searchResults: [],
    competitorUrls: [],
    crawlResults: [],
    searchScope: 'Global (Country Neutral)',
    aiInteractions: [
      {
        step: 'competitor_discovery_query_generation',
        timestamp: new Date().toISOString(),
        prompt: businessPrompt || 'Prompt not available',
        response: businessAiResponse || 'AI response not available',
        parsedData: competitorQueries,
        promptSource: {
          sourceFile: 'prompts/intelligence/businessAnalysis.js',
          functionName: 'businessAnalysisPrompt()',
          description: 'AI prompt for generating foundational intelligence including competitor discovery queries'
        },
        logic: {
          description: 'AI-generated competitor discovery queries from business analysis',
          sourceFile: 'controllers/businessIntelligence.js',
          functionName: 'generateIntelligence() - business analysis',
          steps: [
            'Prepare business analysis prompt with form data and crawl results',
            'Send prompt to AI for foundational intelligence generation',
            'AI generates competitor_discovery_queries as part of response',
            'Extract queries from AI response JSON',
            'Pass queries to competitor research process'
          ],
          dataUsage: {
            competitiveInsights: [
              'Competitor Discovery Queries (used for global web search)'
            ],
            differentiationOpportunities: [
              'Query targeting for competitor analysis'
            ],
            contentStrategyInsights: [
              'Search strategy for competitor discovery'
            ]
          }
        },
        note: 'The actual AI prompt and response for query generation are now included here.'
      }
    ],
    finalResult: null
  };
  
  if (masterId) systemLogger.logStep(masterId, {
    step: 'Competitor research: started',
    competitorQueries,
    searchScope: 'Global (Country Neutral)',
    logic: 'Begin competitor research with provided queries using global search.',
    next: 'Run global web search for each query.'
  });
  
  try {
    console.log('🔍 Starting competitor research with queries:', competitorQueries);
    console.log('🌐 Using global search (country neutral)');
    console.log('⏱️ Using sequential requests to respect API rate limits...');
    
    // STEP 1: Search for competitors using sequential requests (1 request per second)
    const searchResults = [];
    
    for (let i = 0; i < competitorQueries.length; i++) {
      const query = competitorQueries[i];
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: executing global search',
        query,
        index: i,
        searchScope: 'Global',
        logic: 'Run global web search for competitor discovery.',
        next: 'Store search results.'
      });
      console.log(`🔍 Executing global search ${i + 1}/${competitorQueries.length}: ${query}`);
      
      try {
        const result = await searchBrave(query, 3);
        searchResults.push(result);
        console.log(`✅ Global search ${i + 1} completed successfully`);
        
        // Store search result in debug data
        global.competitorDebugData.searchResults.push({
          step: 'global_web_search',
          timestamp: new Date().toISOString(),
          query: query,
          queryIndex: i,
          result: result,
          searchScope: 'Global (Country Neutral)',
          logic: {
            description: 'Global web search for competitor discovery',
            sourceFile: 'services/webSearch.js',
            functionName: 'searchBrave()',
            steps: [
              'Send query to Brave Search API without country restriction',
              'Request 3 results per query for global coverage',
              'Handle rate limiting with 1.1s delays',
              'Store search results for URL extraction'
            ]
          }
        });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: global search completed',
          query,
          result,
          searchScope: 'Global',
          logic: 'Global search completed successfully.',
          next: 'Continue to next query or extract competitor URLs.'
        });
        
        // Add delay between requests (1.1 seconds to be safe with 1 req/sec limit)
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request...');
          await delay(1100);
        }
        
      } catch (searchError) {
        console.error(`❌ Global search ${i + 1} failed:`, searchError.message);
        // Add empty result for failed search
        searchResults.push({ web: { results: [] } });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: global search failed',
          query,
          error: searchError.message,
          searchScope: 'Global',
          logic: 'Global search failed, storing empty result.',
          next: 'Continue to next query.'
        });
        
        // Still wait before next request to respect rate limits
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request (after error)...');
          await delay(1100);
        }
      }
    }
    
    // STEP 2: Extract competitor URLs (top 3 from each query = max 6 competitors)
    const competitorUrls = [];
    searchResults.forEach((result, queryIndex) => {
      if (result.web && result.web.results) {
        result.web.results.forEach((webResult, resultIndex) => {
          if (competitorUrls.length < 6) { // Limit to 6 total competitors
            competitorUrls.push({
              url: webResult.url,
              title: webResult.title,
              description: webResult.description,
              query_source: `Query ${queryIndex + 1}`,
              rank: resultIndex + 1,
              search_scope: 'Global'
            });
          }
        });
      }
    });
    
    console.log(`📊 Found ${competitorUrls.length} potential competitors to analyze (Global search)`);
    
    // Store URL extraction in debug data
    global.competitorDebugData.competitorUrls = competitorUrls;
    global.competitorDebugData.urlExtraction = {
      step: 'url_extraction',
      timestamp: new Date().toISOString(),
      totalUrlsFound: competitorUrls.length,
      searchScope: 'Global (Country Neutral)',
      urlsByQuery: searchResults.map((result, index) => ({
        queryIndex: index,
        urlsFound: result.web?.results?.length || 0
      })),
      logic: {
        description: 'Extract competitor URLs from global search results',
        sourceFile: 'controllers/competitorResearch.js',
        functionName: 'performCompetitorResearch() - URL extraction',
        steps: [
          'Process each global search result',
          'Extract top 3 results from each query',
          'Limit to maximum 6 total competitors',
          'Store URL, title, description, and metadata',
          'Track query source and ranking information'
        ]
      }
    };
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: extracted competitor URLs',
      competitorUrls,
      searchScope: 'Global',
      logic: 'Extracted up to 6 competitor URLs from global search results.',
      next: 'Crawl competitor homepages.'
    });
    
    if (competitorUrls.length === 0) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: no competitors found',
        searchScope: 'Global',
        logic: 'No competitors found in global search results.',
        next: 'Return empty competitor intelligence.'
      });
      return {
        discovery_queries_used: competitorQueries,
        competitors_found: 0,
        competitors_selected: 0,
        search_scope: 'Global (Country Neutral)',
        competitor_analysis: [],
        competitive_insights: {
          market_gaps: [],
          common_features: [],
          pricing_landscape: "No competitor data available",
          positioning_opportunities: []
        },
        differentiation_opportunities: [],
        content_strategy_insights: {
          competitor_content_themes: [],
          content_gaps_to_exploit: [],
          messaging_opportunities: []
        },
        analysis_note: "No competitors found in global search results"
      };
    }
    
    // STEP 3: Crawl competitor homepages (simple and fast)
    const competitorCrawlResults = [];
    const crawledUrls = new Set(); // Track crawled URLs to prevent duplicates
    
    for (const competitor of competitorUrls) {
      // Skip if URL already crawled (prevent duplicates)
      if (crawledUrls.has(competitor.url)) {
        console.log(`⏭️ Skipping duplicate URL: ${competitor.url}`);
        continue;
      }
      crawledUrls.add(competitor.url);
      
      try {
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawling competitor homepage',
          competitor,
          logic: 'Crawl homepage of competitor for data extraction.',
          next: 'Extract and store crawl data.'
        });
        console.log(`🏠 Crawling competitor homepage: ${competitor.title} (${competitor.url})`);
        const crawledData = await crawlHomepageOnly(competitor.url);
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: crawledData
        });
        console.log(`✅ Successfully crawled homepage: ${crawledData.company_name || competitor.title}`);
        
        // Store crawl result in debug data
        global.competitorDebugData.crawlResults.push({
          step: 'competitor_homepage_crawl',
          timestamp: new Date().toISOString(),
          websiteUrl: competitor.url,
          companyName: crawledData.company_name || competitor.title,
          searchScope: 'Global',
          rawData: {
            originalHtmlLength: crawledData.original_html?.length || 0,
            cleanTextLength: crawledData.clean_text?.length || 0,
            compressionRatio: crawledData.original_html && crawledData.clean_text ?
              ((crawledData.clean_text.length / crawledData.original_html.length) * 100).toFixed(1) + '%' : 'N/A'
          },
          processedData: crawledData,
          aiInteraction: crawledData.aiInteraction || null,
          logic: {
            description: 'Crawl competitor homepage for business intelligence',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlHomepageOnly()',
            steps: [
              'Fetch homepage HTML content',
              'Extract and clean text content',
              'Identify company name and business description',
              'Store structured business data'
            ],
            crawlingMethod: 'Homepage-only crawl with content extraction',
            contentProcessing: 'Text cleaning, company identification, business data extraction'
          }
        });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawl success',
          competitor,
          crawledData,
          logic: 'Successfully crawled competitor homepage.',
          next: 'Continue to next competitor.'
        });
        
        // Add small delay between crawls to be respectful to competitor sites
        await delay(500);
        
      } catch (crawlError) {
        console.log(`⚠️ Failed to crawl ${competitor.url}: ${crawlError.message}`);
        // Continue with other competitors - don't fail entire process
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: null,
          error: crawlError.message
        });
        
        // Store failed crawl in debug data
        global.competitorDebugData.crawlResults.push({
          step: 'competitor_homepage_crawl',
          timestamp: new Date().toISOString(),
          websiteUrl: competitor.url,
          companyName: competitor.title,
          searchScope: 'Global',
          error: crawlError.message,
          logic: {
            description: 'Crawl competitor homepage for business intelligence',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlHomepageOnly()',
            steps: [
              'Fetch homepage HTML content',
              'Extract and clean text content',
              'Identify company name and business description',
              'Store structured business data'
            ],
            crawlingMethod: 'Homepage-only crawl with content extraction',
            contentProcessing: 'Text cleaning, company identification, business data extraction'
          }
        });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawl failed',
          competitor,
          error: crawlError.message,
          logic: 'Failed to crawl competitor homepage.',
          next: 'Continue to next competitor.'
        });
      }
    }
    
    // STEP 4: AI analysis of competitor data
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: analyzing competitor data with AI',
      competitorCrawlResults,
      searchScope: 'Global',
      logic: 'Prepare prompt and send to AI for competitor analysis.',
      next: 'Parse AI response.'
    });
    console.log('🤖 Analyzing competitor data with AI...');
    const competitorAnalysisPrompt = intelligence.competitorAnalysisPrompt(businessContext, competitorCrawlResults);
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: AI prompt',
      competitorAnalysisPrompt,
      logic: 'Prompt constructed for AI competitor analysis.',
      next: 'Send prompt to AI.'
    });
    const competitorAnalysisResponse = await callClaudeAPI(competitorAnalysisPrompt, false, masterId, 'AI: Competitor Analysis');
    
    // Store final AI interaction in debug data
    global.competitorDebugData.aiInteractions.push({
      step: 'final_competitor_analysis',
      timestamp: new Date().toISOString(),
      prompt: competitorAnalysisPrompt,
      response: competitorAnalysisResponse,
      searchScope: 'Global',
      promptSource: {
        sourceFile: 'prompts/intelligence/competitorAnalysis.js',
        functionName: 'competitorAnalysisPrompt()',
        description: 'AI prompt for comprehensive competitor intelligence analysis'
      },
      logic: {
        description: 'Final AI analysis of all competitor data from global search',
        sourceFile: 'controllers/competitorResearch.js',
        functionName: 'performCompetitorResearch() - final analysis',
        steps: [
          'Combine all crawled competitor data from global search',
          'Create comprehensive analysis prompt',
          'Send to AI for competitor intelligence generation',
          'Parse AI response to extract structured insights',
          'Generate market gaps, positioning opportunities, and content strategy insights'
        ],
        dataUsage: {
          competitiveInsights: [
            'Market Gaps',
            'Common Features',
            'Pricing Landscape',
            'Positioning Opportunities'
          ],
          differentiationOpportunities: [
            'Unique Value Propositions',
            'Competitive Advantages',
            'Market Positioning'
          ],
          contentStrategyInsights: [
            'Competitor Content Themes',
            'Content Gaps to Exploit',
            'Messaging Opportunities'
          ]
        }
      }
    });
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: AI response',
      competitorAnalysisResponse,
      logic: 'AI response received for competitor analysis.',
      next: 'Parse AI response.'
    });
    
    // Parse competitor analysis
    let competitorAnalysis;
    try {
      const jsonMatch = competitorAnalysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        competitorAnalysis = JSON.parse(jsonMatch[0]);
        competitorAnalysis.discovery_queries_used = competitorQueries;
        competitorAnalysis.competitors_found = competitorUrls.length;
        competitorAnalysis.search_scope = 'Global (Country Neutral)';
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: parsed AI analysis',
          competitorAnalysis,
          logic: 'Extracted JSON from AI competitor analysis response.',
          next: 'Return competitor intelligence.'
        });
      } else {
        throw new Error('No JSON found in competitor analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse competitor analysis:', parseError);
      // Return basic structure if parsing fails
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: AI parse error',
        error: parseError.message,
        logic: 'Failed to extract JSON from AI competitor analysis response.',
        next: 'Return fallback competitor intelligence.'
      });
      return {
        discovery_queries_used: competitorQueries,
        competitors_found: competitorUrls.length,
        competitors_selected: 0,
        search_scope: 'Global (Country Neutral)',
        competitor_analysis: [],
        competitive_insights: {
          market_gaps: [],
          common_features: [],
          pricing_landscape: "Analysis failed",
          positioning_opportunities: []
        },
        differentiation_opportunities: [],
        content_strategy_insights: {
          competitor_content_themes: [],
          content_gaps_to_exploit: [],
          messaging_opportunities: []
        },
        analysis_note: "Competitor analysis parsing failed: " + parseError.message
      };
    }
    
    // Store final result in debug data
    global.competitorDebugData.finalResult = competitorAnalysis;
    global.competitorDebugData.summary = {
      queriesExecuted: competitorQueries.length,
      competitorsFound: competitorUrls.length,
      competitorsCrawled: competitorCrawlResults.length,
      successfulCrawls: competitorCrawlResults.filter(c => !c.error).length,
      failedCrawls: competitorCrawlResults.filter(c => c.error).length,
      aiInteractions: global.competitorDebugData.aiInteractions.length,
      totalSearchResults: searchResults.length,
      searchScope: 'Global (Country Neutral)',
      analysisMethod: 'sequential_search_and_crawl_global'
    };
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: complete',
      competitorAnalysis,
      searchScope: 'Global',
      logic: 'Final competitor intelligence ready from global search.',
      next: 'Return to business profile flow.'
    });
    
    return competitorAnalysis;
  } catch (error) {
    console.error('Competitor research failed:', error);
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: error',
      error: error.message,
      searchScope: 'Global',
      logic: 'Unhandled error during competitor research.',
      next: 'Return fallback competitor intelligence.'
    });
    throw error;
  }
}

module.exports = {
  performCompetitorResearch
};