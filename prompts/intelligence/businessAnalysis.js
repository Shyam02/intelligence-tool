// Business Analysis Prompt for generating foundational intelligence

const businessAnalysisPrompt = (combinedData) => {
  return `You are a marketing intelligence analyst. Analyze the business information and generate foundational intelligence that will be used to create targeted search queries for content marketing.

INSTRUCTIONS FOR SPECIFIC FIELDS:
- competitor_search_terms: Generate exactly 5 search terms that will help find direct competitors
- content_discovery_terms: Generate exactly 5 search terms for finding trending content in this space
- audience_discovery_terms: Generate exactly 5 search terms for finding target audience discussions
- business_function_keywords: List 3-5 core business functions this product addresses
- competitive_landscape_descriptors: List 3-4 terms that describe the competitive category
- competitor_discovery_queries: Generate exactly 2 highly specific search queries that will find the most relevant direct competitors

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
  },
  "competitor_discovery_queries": [
    "highly specific query to find direct competitors with similar business model",
    "broader query to find indirect competitors in the same market space"
  ]
}

INSTRUCTIONS FOR COMPETITOR DISCOVERY QUERIES:
- Query 1: Should find DIRECT competitors with very similar business models and target markets
- Query 2: Should find INDIRECT competitors or alternatives in the broader solution space
- Use specific product categories, solution types, and target market descriptors
- Avoid generic terms - be specific to get quality competitor results
- Examples: "AI content marketing tools for startups", "B2B productivity software for small teams"

Please respond with ONLY the JSON, no other text.`;
};

module.exports = {
  businessAnalysisPrompt
};