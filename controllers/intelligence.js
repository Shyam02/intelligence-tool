// Intelligence generation controller
const { callClaudeAPI, crawlWebsite } = require('../services/ai');
const { intelligence } = require('../prompts');

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

// Generate foundational intelligence from onboarding data
async function generateIntelligence(req, res) {
  try {
    const onboardingData = req.body;
    
    // Check if we have crawled website data
    let combinedData = { ...onboardingData };
    if (onboardingData.crawledData) {
      console.log('🌐 Using crawled website data in intelligence generation');
      combinedData.websiteCrawlResults = onboardingData.crawledData;
    }
    
    // Use extracted prompt instead of inline
    const prompt = intelligence.businessAnalysisPrompt(combinedData);

    const claudeResponse = await callClaudeAPI(prompt);
    
    // Parse the JSON response
    let foundationalIntelligence;
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foundationalIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json(foundationalIntelligence);
  } catch (error) {
    console.error('Error generating intelligence:', error);
    res.status(500).json({ error: error.message });
  }
}

// Generate search queries from foundational intelligence
async function generateQueries(req, res) {
  try {
    const foundationalIntelligence = req.body;
    
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

    // Generate keyword queries
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

    // Generate content discovery queries
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