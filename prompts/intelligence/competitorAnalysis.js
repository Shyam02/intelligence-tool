// Competitor Analysis Prompt for analyzing crawled competitor data
// File path: /prompts/intelligence/competitorAnalysis.js

const competitorAnalysisPrompt = (mainBusinessData, competitorCrawlResults) => {
    return `You are a competitive intelligence analyst. Analyze the crawled competitor data and provide detailed competitive intelligence for strategic marketing planning.
  
  MAIN BUSINESS CONTEXT:
  ${JSON.stringify(mainBusinessData, null, 2)}
  
  COMPETITOR CRAWL RESULTS:
  ${JSON.stringify(competitorCrawlResults, null, 2)}
  
  Your task is to:
  1. Select the 3 MOST RELEVANT competitors from the crawled data based on business model similarity, target market overlap, and direct competition
  2. Provide detailed analysis of each selected competitor
  3. Generate competitive insights and differentiation opportunities
  
  SELECTION CRITERIA for choosing 3 competitors:
  - Direct business model similarity
  - Target market overlap
  - Product/service relevance
  - Company stage appropriateness
  - Quality of available data
  
  RESPOND WITH THIS EXACT JSON FORMAT:
  
  {
    "discovery_queries_used": ["query1", "query2"],
    "competitors_found": <total_number_of_competitors_crawled>,
    "competitors_selected": 3,
    "competitor_analysis": [
      {
        "company_name": "<competitor company name>",
        "website_url": "<competitor website URL>",
        "business_description": "<clear description of what they do>",
        "value_proposition": "<their main value proposition>",
        "target_customer": "<their target customer segment>",
        "main_products_services": "<their main offerings>",
        "key_features": ["<feature1>", "<feature2>", "<feature3>"],
        "pricing_approach": "<their pricing strategy if found>",
        "unique_selling_points": ["<usp1>", "<usp2>"],
        "company_stage": "<startup/growth/established/enterprise>",
        "social_media_presence": {
          "twitter": "<twitter handle or 'Not found'>",
          "linkedin": "<linkedin URL or 'Not found'>",
          "instagram": "<instagram URL or 'Not found'>",
          "facebook": "<facebook URL or 'Not found'>",
          "youtube": "<youtube URL or 'Not found'>",
          "tiktok": "<tiktok URL or 'Not found'>",
          "pinterest": "<pinterest URL or 'Not found'>",
          "reddit": "<reddit URL or 'Not found'>",
          "discord": "<discord URL or 'Not found'>",
          "other": ["<other social platforms>"]
        },
        "content_strategy_observations": "<observations about their content/marketing approach>",
        "market_positioning": "<how they position themselves in the market>",
        "relevance_score": "<high/medium/low - why this competitor was selected>"
      }
    ],
    "competitive_insights": {
      "market_gaps": ["<gap1>", "<gap2>"],
      "common_features": ["<feature1>", "<feature2>"],
      "pricing_landscape": "<overview of competitor pricing>",
      "positioning_opportunities": ["<opportunity1>", "<opportunity2>"]
    },
    "differentiation_opportunities": [
      "<specific way main business can differentiate>",
      "<another differentiation strategy>",
      "<unique positioning angle>"
    ],
    "content_strategy_insights": {
      "competitor_content_themes": ["<theme1>", "<theme2>"],
      "content_gaps_to_exploit": ["<gap1>", "<gap2>"],
      "messaging_opportunities": ["<opportunity1>", "<opportunity2>"]
    }
  }
  
  IMPORTANT INSTRUCTIONS:
  - Use ONLY information directly found in the crawled competitor data
  - For any information not found, use "Not found" as the value
  - If fewer than 3 quality competitors found, analyze what's available and note the limitation
  - Focus on actionable competitive intelligence for content marketing strategy
  - Ensure selected competitors are genuinely relevant to the main business
  
  Respond with ONLY the JSON object, no additional text.`;
  };
  
  module.exports = {
    competitorAnalysisPrompt
  };