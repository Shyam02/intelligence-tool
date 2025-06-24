// Business Analysis Prompt for generating foundational intelligence

const businessAnalysisPrompt = (combinedData) => {
    return `You are a marketing intelligence analyst. Analyze the business information and generate foundational intelligence that will be used to create targeted search queries for content marketing.
  
  INSTRUCTIONS FOR SPECIFIC FIELDS:
  - competitor_search_terms: Generate exactly 5 search terms that will help find direct competitors
  - content_discovery_terms: Generate exactly 5 search terms for finding trending content in this space
  - audience_discovery_terms: Generate exactly 5 search terms for finding target audience discussions
  - business_function_keywords: List 3-5 core business functions this product addresses
  - competitive_landscape_descriptors: List 3-4 terms that describe the competitive category
  
  INPUT DATA:
  ${JSON.stringify(combinedData, null, 2)}
  
  ${combinedData.websiteCrawlResults ? `
  WEBSITE CRAWL RESULTS AVAILABLE:
  Use the crawled website data as the primary source of business information. The form data should supplement or override the crawled data where the user has provided more specific information.
  
  Priority: Website crawled data > User form input > Defaults
  ` : ''}
  
  Generate ONLY what can be determined with 100% accuracy from the provided information:
  
  OUTPUT FORMAT (JSON):
  {
    "industry_classification": {
      "primary_industry": "",
      "sub_categories": [],
      "business_model": "",
      "market_type": "B2B|B2C|B2B2C"
    },
    "product_classification": {
      "product_category": "",
      "solution_category": "",
      "business_function_keywords": [],
      "competitive_landscape_descriptors": []
    },
    "core_keywords": {
      "product_keywords": [],
      "solution_keywords": [],
      "industry_keywords": [],
      "target_keywords": []
    },
    "pain_points": {
      "primary_problem": "",
      "secondary_problems": [],
      "solution_approach": ""
    },
    "target_market": {
      "market_segment": "",
      "demographics": []
    },
    "search_foundation": {
      "competitor_search_terms": [],
      "content_discovery_terms": [],
      "audience_discovery_terms": []
    }
  }
  
  Please respond with ONLY the JSON, no other text.`;
  };
  
  module.exports = {
    businessAnalysisPrompt
  };