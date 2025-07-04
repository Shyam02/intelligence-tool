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

// FIXED: Perform competitor research with sequential API calls and simple homepage crawling
async function performCompetitorResearch(competitorQueries, businessContext, masterId = null) {
  if (masterId) systemLogger.logStep(masterId, {
    step: 'Competitor research: started',
    competitorQueries,
    logic: 'Begin competitor research with provided queries.',
    next: 'Run web search for each query.'
  });
  try {
    console.log('🔍 Starting competitor research with queries:', competitorQueries);
    console.log('⏱️ Using sequential requests to respect API rate limits...');
    
    // STEP 1: Search for competitors using sequential requests (1 request per second)
    const searchResults = [];
    
    for (let i = 0; i < competitorQueries.length; i++) {
      const query = competitorQueries[i];
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: executing search',
        query,
        index: i,
        logic: 'Run web search for competitor discovery.',
        next: 'Store search results.'
      });
      console.log(`🔍 Executing search ${i + 1}/${competitorQueries.length}: ${query}`);
      
      try {
        const result = await searchBrave(query, 3);
        searchResults.push(result);
        console.log(`✅ Search ${i + 1} completed successfully`);
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: search completed',
          query,
          result,
          logic: 'Search completed successfully.',
          next: 'Continue to next query or extract competitor URLs.'
        });
        
        // Add delay between requests (1.1 seconds to be safe with 1 req/sec limit)
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request...');
          await delay(1100);
        }
        
      } catch (searchError) {
        console.error(`❌ Search ${i + 1} failed:`, searchError.message);
        // Add empty result for failed search
        searchResults.push({ web: { results: [] } });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: search failed',
          query,
          error: searchError.message,
          logic: 'Search failed, storing empty result.',
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
              rank: resultIndex + 1
            });
          }
        });
      }
    });
    
    console.log(`📊 Found ${competitorUrls.length} potential competitors to analyze`);
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: extracted competitor URLs',
      competitorUrls,
      logic: 'Extracted up to 6 competitor URLs from search results.',
      next: 'Crawl competitor homepages.'
    });
    
    if (competitorUrls.length === 0) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: no competitors found',
        logic: 'No competitors found in search results.',
        next: 'Return empty competitor intelligence.'
      });
      return {
        discovery_queries_used: competitorQueries,
        competitors_found: 0,
        competitors_selected: 0,
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
        analysis_note: "No competitors found in search results"
      };
    }
    
    // STEP 3: FIXED - Crawl competitor homepages only (simple and fast)
    const competitorCrawlResults = [];
    for (const competitor of competitorUrls) {
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
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: complete',
      competitorAnalysis,
      logic: 'Final competitor intelligence ready.',
      next: 'Return to business profile flow.'
    });
    return competitorAnalysis;
  } catch (error) {
    console.error('Competitor research failed:', error);
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: error',
      error: error.message,
      logic: 'Unhandled error during competitor research.',
      next: 'Return fallback competitor intelligence.'
    });
    throw error;
  }
}

module.exports = {
  performCompetitorResearch
};