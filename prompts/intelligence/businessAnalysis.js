// Business Analysis Prompt for generating foundational intelligence

const businessAnalysisPrompt = (combinedData) => {
  return `You are a marketing intelligence analyst. Analyze the business information and generate foundational intelligence that will be used to create targeted search queries for content marketing.

INSTRUCTIONS FOR SPECIFIC FIELDS:
- competitor_search_terms: Generate exactly 5 search terms that will help find direct competitors
- content_discovery_terms: Generate exactly 5 search terms for finding trending content in this space
- audience_discovery_terms: Generate exactly 5 search terms for finding target audience discussions
- business_function_keywords: List 3-5 core business functions this product addresses
- competitive_landscape_descriptors: List 3-4 terms that describe the competitive category
- competitor_discovery_queries: Generate exactly 2 simple search queries that will find the most relevant competitors

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
    "primary search term for direct competitors",
    "alternative search term for same solution category"
  ]
}

CRITICAL INSTRUCTIONS FOR COMPETITOR DISCOVERY QUERIES:
- Create SHORT, NATURAL search terms that people actually use
- Maximum 2-4 words per query
- Think like a customer searching for solutions
- Query 1: Find DIRECT competitors (primary search term)
- Query 2: Find CLOSE alternatives (alternative way to search for same thing)
- BOTH queries should target the SAME SOLUTION CATEGORY
- Use simple, common language - avoid jargon
- NO complex phrases or multiple descriptors

GOOD EXAMPLES:
- For productivity software: ["project management tool", "project management software"] 
- For marketing tools: ["email marketing platform", "email marketing tool"]
- For business software: ["CRM software", "customer management tool"]
- For creative tools: ["video editing software", "video editor"]
- For data tools: ["analytics platform", "business intelligence tool"]

BAD EXAMPLES (too complex or wrong category):
- ❌ "enterprise project management platform for agile development teams"
- ❌ "professional email marketing service for content creators and businesses"
- ❌ "B2B customer relationship management software for sales teams"
- ❌ For productivity software: ["project management", "business communication tools"] ← Query 2 too broad!
- ❌ For marketing tools: ["email marketing", "social media tools"] ← Query 2 different category!

Remember: Search engines work best with simple, natural language that real users type.

IMPORTANT: Both queries should target the SAME solution category but use different search approaches. Don't make Query 2 a broader category - that will find irrelevant competitors.

KEY PRINCIPLE: Both queries should find the same type of direct competitors, just using different search terms that customers might use.

Please respond with ONLY the JSON, no other text.`;
};

module.exports = {
  businessAnalysisPrompt
};