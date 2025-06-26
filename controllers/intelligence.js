// Intelligence generation controller
const { callClaudeAPI, crawlWebsite } = require('../services/ai');
const { searchBrave } = require('../services/search');
const { intelligence } = require('../prompts');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// NEW FUNCTION: Crawl website and extract business information
async function crawlWebsiteController(req, res) {
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl || !websiteUrl.trim()) {
      return res.status(400).json({ error: 'Website URL is required' });
    }
    
    console.log('🌐 Website crawling request for:', websiteUrl);
    
    const crawledData = await crawlWebsite(websiteUrl);
    
    console.log('✅ Website crawling completed for:', crawledData.company_name || 'Unknown');
    
    res.json({
      success: true,
      website_url: websiteUrl,
      crawled_data: crawledData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Website crawling controller error:', error);
    res.status(500).json({ 
      error: 'Website crawling failed: ' + error.message,
      website_url: req.body.websiteUrl || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
}

// ENHANCED: Generate foundational intelligence with competitor research
async function generateIntelligence(req, res) {
  try {
    const onboardingData = req.body;
    
    // Check if we have crawled website data
    let combinedData = { ...onboardingData };
    if (onboardingData.crawledData) {
      console.log('🌐 Using crawled website data in intelligence generation');
      combinedData.websiteCrawlResults = onboardingData.crawledData;
    }
    
    console.log('🧠 Starting enhanced intelligence generation with competitor research...');
    
    // STEP 1: Generate initial foundational intelligence + competitor queries
    const businessPrompt = intelligence.businessAnalysisPrompt(combinedData);
    const initialIntelligence = await callClaudeAPI(businessPrompt);
    
    // Parse initial intelligence
    let foundationalIntelligence;
    try {
      const jsonMatch = initialIntelligence.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foundationalIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in initial intelligence response');
      }
    } catch (parseError) {
      console.error('JSON Parse Error in initial intelligence:', parseError);
      return res.status(500).json({ error: 'Failed to parse initial intelligence' });
    }
    
    console.log('✅ Initial intelligence generated, starting competitor research...');
    
    // STEP 2: Competitor research (with error handling)
    let competitorIntelligence = null;
    try {
      if (foundationalIntelligence.competitor_discovery_queries && 
          foundationalIntelligence.competitor_discovery_queries.length >= 2) {
        
        competitorIntelligence = await performCompetitorResearch(
          foundationalIntelligence.competitor_discovery_queries,
          foundationalIntelligence
        );
        
        console.log('✅ Competitor research completed successfully');
      } else {
        console.log('⚠️ No competitor queries found, skipping competitor research');
      }
    } catch (competitorError) {
      console.error('⚠️ Competitor research failed, continuing without competitor data:', competitorError.message);
      // Continue without competitor data - don't fail the entire request
    }
    
    // STEP 3: Combine all intelligence
    const enhancedIntelligence = {
      ...foundationalIntelligence,
      competitor_intelligence: competitorIntelligence
    };
    
    console.log('✅ Enhanced intelligence generation completed');
    res.json(enhancedIntelligence);
    
  } catch (error) {
    console.error('Error generating intelligence:', error);
    res.status(500).json({ error: error.message });
  }
}

// FIXED: Perform competitor research with sequential API calls to respect rate limits
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
    
    // STEP 3: Crawl competitor websites (homepage only)
    const competitorCrawlResults = [];
    for (const competitor of competitorUrls) {
      try {
        console.log(`🌐 Crawling competitor: ${competitor.title} (${competitor.url})`);
        const crawledData = await crawlWebsite(competitor.url);
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: crawledData
        });
        console.log(`✅ Successfully crawled: ${crawledData.company_name || competitor.title}`);
        
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

// ENHANCED: Generate search queries using competitor intelligence
async function generateQueries(req, res) {
  try {
    const foundationalIntelligence = req.body;
    
    // Extract competitor names for enhanced queries
    let competitorNames = [];
    if (foundationalIntelligence.competitor_intelligence && 
        foundationalIntelligence.competitor_intelligence.competitor_analysis) {
      competitorNames = foundationalIntelligence.competitor_intelligence.competitor_analysis
        .map(comp => comp.company_name)
        .filter(name => name && name !== 'Not found');
    }
    
    // Generate competitor queries
    const competitorQueries = {
      direct_competitors: [
        `"${foundationalIntelligence.product_classification.product_category}" competitors`,
        `best ${foundationalIntelligence.product_classification.solution_category} for ${foundationalIntelligence.target_market.market_segment}`,
        `${foundationalIntelligence.core_keywords.product_keywords[0]} alternatives`,
        `${foundationalIntelligence.product_classification.competitive_landscape_descriptors[0]} comparison`,
        `"${foundationalIntelligence.pain_points.primary_problem}" solutions review`
      ],
      indirect_competitors: [
        `${foundationalIntelligence.core_keywords.solution_keywords.join(' OR ')} competitors`,
        `${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.core_keywords.industry_keywords[0]} tools`,
        `alternatives to solve "${foundationalIntelligence.pain_points.primary_problem}"`,
        `${foundationalIntelligence.product_classification.business_function_keywords[0]} software options`
      ],
      competitor_intelligence: [
        `site:linkedin.com ${foundationalIntelligence.search_foundation.competitor_search_terms[0]}`,
        `site:reddit.com ${foundationalIntelligence.product_classification.product_category} recommendations`,
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" reviews site:g2.com OR site:capterra.com`,
        `${foundationalIntelligence.product_classification.solution_category} market analysis 2024`
      ]
    };
    
    // Add competitor-specific queries if we have competitor data
    if (competitorNames.length > 0) {
      competitorQueries.competitor_specific = competitorNames.slice(0, 3).map(name => 
        `"${name}" vs alternatives comparison`
      );
      competitorQueries.competitor_analysis = competitorNames.slice(0, 3).map(name =>
        `site:reddit.com "${name}" review OR experience`
      );
    }

    // Generate keyword queries (enhanced with competitor insights)
    const keywordQueries = {
      core_product_keywords: [
        `"${foundationalIntelligence.product_classification.product_category}" keyword research`,
        `${foundationalIntelligence.core_keywords.product_keywords.join(' ')} related keywords`,
        `trending ${foundationalIntelligence.core_keywords.industry_keywords[0]} keywords 2024`,
        `${foundationalIntelligence.product_classification.solution_category} SEO keywords`,
        `"what is ${foundationalIntelligence.product_classification.product_category}" related searches`
      ],
      problem_based_keywords: [
        `site:reddit.com "${foundationalIntelligence.pain_points.primary_problem}" help`,
        `site:quora.com ${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.pain_points.primary_problem}`,
        `"${foundationalIntelligence.pain_points.secondary_problems[0]}" forum discussions`,
        `${foundationalIntelligence.target_market.market_segment} struggles with ${foundationalIntelligence.core_keywords.industry_keywords[0]}`,
        `"how to solve ${foundationalIntelligence.pain_points.primary_problem}"`
      ],
      intent_based_keywords: [
        `best ${foundationalIntelligence.product_classification.product_category} for ${foundationalIntelligence.target_market.market_segment}`,
        `${foundationalIntelligence.core_keywords.product_keywords[0]} vs ${foundationalIntelligence.core_keywords.product_keywords[1] || 'alternatives'}`,
        `${foundationalIntelligence.product_classification.solution_category} pricing comparison`,
        `${foundationalIntelligence.core_keywords.solution_keywords[0]} reviews and ratings`,
        `how to choose ${foundationalIntelligence.product_classification.product_category}`
      ],
      trending_keywords: [
        `${foundationalIntelligence.core_keywords.industry_keywords[0]} trends 2024`,
        `emerging ${foundationalIntelligence.product_classification.solution_category} technologies`,
        `future of ${foundationalIntelligence.core_keywords.industry_keywords[0]}`,
        `${foundationalIntelligence.target_market.market_segment} ${foundationalIntelligence.core_keywords.industry_keywords[0]} predictions`
      ]
    };

    // Add competitor-enhanced keyword queries
    if (competitorNames.length > 0) {
      keywordQueries.competitor_keywords = [
        `${competitorNames[0]} alternatives keywords`,
        `"better than ${competitorNames[0]}" search terms`,
        `${foundationalIntelligence.core_keywords.product_keywords[0]} vs ${competitorNames[0]} keywords`
      ];
    }

    // Generate content discovery queries (enhanced with competitor insights)
    const contentQueries = {
      twitter_content: [
        `site:twitter.com "${foundationalIntelligence.core_keywords.product_keywords[0]}" viral thread`,
        `site:twitter.com "${foundationalIntelligence.pain_points.primary_problem}" trending`,
        `"${foundationalIntelligence.target_market.market_segment}" ${foundationalIntelligence.core_keywords.industry_keywords[0]} twitter engagement`,
        `site:twitter.com "${foundationalIntelligence.industry_classification.primary_industry}" tips viral`,
        `"${foundationalIntelligence.core_keywords.solution_keywords[0]}" thread high engagement`
      ],
      reddit_content: [
        `site:reddit.com "${foundationalIntelligence.pain_points.primary_problem}" popular`,
        `site:reddit.com "${foundationalIntelligence.core_keywords.product_keywords[0]}" best posts`,
        `site:reddit.com/r/${foundationalIntelligence.target_market.market_segment.replace(' ', '')} "${foundationalIntelligence.core_keywords.industry_keywords[0]}"`,
        `"${foundationalIntelligence.product_classification.solution_category}" reddit discussions upvotes`,
        `site:reddit.com "${foundationalIntelligence.core_keywords.solution_keywords[0]}" recommendations`
      ],
      linkedin_content: [
        `site:linkedin.com "${foundationalIntelligence.core_keywords.industry_keywords[0]}" viral post`,
        `"${foundationalIntelligence.target_market.market_segment}" ${foundationalIntelligence.pain_points.primary_problem} linkedin engagement`,
        `site:linkedin.com "${foundationalIntelligence.industry_classification.primary_industry}" thought leadership`,
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" linkedin professional post`,
        `site:linkedin.com "${foundationalIntelligence.core_keywords.solution_keywords[0]}" business impact`
      ],
      viral_content: [
        `"${foundationalIntelligence.core_keywords.product_keywords[0]}" viral content 2024`,
        `"${foundationalIntelligence.industry_classification.primary_industry}" trending content engagement`,
        `"${foundationalIntelligence.target_market.market_segment}" viral ${foundationalIntelligence.core_keywords.industry_keywords[0]} content`,
        `"${foundationalIntelligence.core_keywords.solution_keywords[0]}" high engagement posts`,
        `"${foundationalIntelligence.core_keywords.industry_keywords[0]}" content marketing success stories`
      ]
    };

    // Add competitor content discovery queries
    if (competitorNames.length > 0) {
      contentQueries.competitor_content = competitorNames.slice(0, 2).map(name =>
        `site:twitter.com "${name}" popular tweets OR viral content`
      );
    }

    const allQueries = {
      competitor_queries: competitorQueries,
      keyword_queries: keywordQueries,
      content_queries: contentQueries
    };

    res.json(allQueries);
  } catch (error) {
    console.error('Error generating queries:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crawlWebsiteController,
  generateIntelligence,
  generateQueries
};