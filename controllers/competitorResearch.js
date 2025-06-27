// Competitor research controller
const { callClaudeAPI } = require('../services/ai');
const { crawlHomepageOnly } = require('../services/websiteCrawler');
const { searchBrave } = require('../services/search');
const { intelligence } = require('../prompts');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// FIXED: Perform competitor research with sequential API calls and simple homepage crawling
async function performCompetitorResearch(competitorQueries, businessContext) {
  try {
    console.log('🔍 Starting competitor research with queries:', competitorQueries);
    console.log('⏱️ Using sequential requests to respect API rate limits...');
    
    // STEP 1: Search for competitors using sequential requests (1 request per second)
    const searchResults = [];
    
    for (let i = 0; i < competitorQueries.length; i++) {
      const query = competitorQueries[i];
      console.log(`🔍 Executing search ${i + 1}/${competitorQueries.length}: ${query}`);
      
      try {
        const result = await searchBrave(query, 3);
        searchResults.push(result);
        console.log(`✅ Search ${i + 1} completed successfully`);
        
        // Add delay between requests (1.1 seconds to be safe with 1 req/sec limit)
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request...');
          await delay(1100);
        }
        
      } catch (searchError) {
        console.error(`❌ Search ${i + 1} failed:`, searchError.message);
        // Add empty result for failed search
        searchResults.push({ web: { results: [] } });
        
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
    
    if (competitorUrls.length === 0) {
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
        console.log(`🏠 Crawling competitor homepage: ${competitor.title} (${competitor.url})`);
        const crawledData = await crawlHomepageOnly(competitor.url);
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: crawledData
        });
        console.log(`✅ Successfully crawled homepage: ${crawledData.company_name || competitor.title}`);
        
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
      }
    }
    
    // STEP 4: AI analysis of competitor data
    console.log('🤖 Analyzing competitor data with AI...');
    const competitorAnalysisPrompt = intelligence.competitorAnalysisPrompt(businessContext, competitorCrawlResults);
    const competitorAnalysisResponse = await callClaudeAPI(competitorAnalysisPrompt);
    
    // Parse competitor analysis
    let competitorAnalysis;
    try {
      const jsonMatch = competitorAnalysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        competitorAnalysis = JSON.parse(jsonMatch[0]);
        competitorAnalysis.discovery_queries_used = competitorQueries;
        competitorAnalysis.competitors_found = competitorUrls.length;
      } else {
        throw new Error('No JSON found in competitor analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse competitor analysis:', parseError);
      // Return basic structure if parsing fails
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
    
    return competitorAnalysis;
    
  } catch (error) {
    console.error('Competitor research failed:', error);
    throw error;
  }
}

module.exports = {
  performCompetitorResearch
};