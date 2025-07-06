// ===== controllers/webSearchQueries.js =====
// Web search query generation controller

// ENHANCED: Generate search queries using competitor intelligence
async function generateQueries(req, res) {
    try {
      const foundationalIntelligence = req.body;
      
      // Initialize debug data
      global.webSearchDebugData = {
        timestamp: new Date().toISOString(),
        foundationalIntelligence: foundationalIntelligence,
        queryGeneration: {
          step: 'search_query_generation',
          timestamp: new Date().toISOString(),
          inputData: foundationalIntelligence,
          logic: {
            description: 'Generate structured search queries from business intelligence',
            sourceFile: 'controllers/webSearchQueries.js',
            functionName: 'generateQueries()',
            steps: [
              'Extract competitor names from business intelligence',
              'Generate competitor-specific queries',
              'Generate keyword-based queries',
              'Generate content discovery queries',
              'Structure queries by category'
            ]
          }
        },
        generatedQueries: null,
        searchExecutions: []
      };
      
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

      // Store generated queries in debug data
      global.webSearchDebugData.generatedQueries = allQueries;
      global.webSearchDebugData.queryGeneration.outputData = allQueries;
      global.webSearchDebugData.queryGeneration.competitorNamesFound = competitorNames.length;
      global.webSearchDebugData.queryGeneration.totalQueriesGenerated = 
        Object.values(allQueries).reduce((total, category) => 
          total + Object.values(category).reduce((catTotal, queries) => 
            catTotal + (Array.isArray(queries) ? queries.length : 0), 0), 0);

      res.json(allQueries);
    } catch (error) {
      console.error('Error generating queries:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  module.exports = {
    generateQueries
  };