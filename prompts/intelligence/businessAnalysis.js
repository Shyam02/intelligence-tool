const businessAnalysisPrompt = (combinedData) => {
  return `You are a marketing intelligence analyst. Analyze the business information and generate foundational intelligence that will be used to create targeted search queries for content marketing.

INSTRUCTIONS FOR SPECIFIC FIELDS:
- competitor_search_terms: Generate exactly 5 search terms that will help find direct competitors
- content_discovery_terms: Generate exactly 5 search terms for finding trending content in this space
- audience_discovery_terms: Generate exactly 5 search terms for finding target audience discussions
- twitter_search_queries: Generate exactly 5 platform-specific Twitter search queries using "site:twitter.com [topic] discussion/thread/viral" format
- linkedin_search_queries: Generate exactly 5 platform-specific LinkedIn search queries using "site:linkedin.com [topic] professional/business/post" format  
- instagram_search_queries: Generate exactly 5 platform-specific Instagram search queries using "site:instagram.com [hashtag] OR [topic]" format
- business_function_keywords: List 3-5 core business functions this product addresses
- competitive_landscape_descriptors: List 3-4 terms that describe the competitive category
- competitor_discovery_queries: Generate exactly 2 simple search queries that will find the most relevant competitors

PLATFORM-SPECIFIC QUERY EXAMPLES:
Twitter: "site:twitter.com AI photography discussion", "site:twitter.com professional headshots thread"
LinkedIn: "site:linkedin.com AI technology professional post", "site:linkedin.com digital transformation business"
Instagram: "site:instagram.com #aiportrait", "site:instagram.com professional photography"

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
    "audience_discovery_terms": [],
    "twitter_search_queries": [],
    "linkedin_search_queries": [],
    "instagram_search_queries": []
  },
  "competitor_discovery_queries": [
    "primary search term for direct competitors",
    "alternative search term for same solution category"
  ]
}

PLATFORM QUERY FORMATTING RULES:
- Twitter queries: Always start with "site:twitter.com" followed by topic and discussion/thread/viral
- LinkedIn queries: Always start with "site:linkedin.com" followed by topic and professional/business/post
- Instagram queries: Always start with "site:instagram.com" followed by hashtag or topic
- Make queries specific to the business analyzed above
- Use natural language that people actually search for
- Include engagement words like "discussion", "thread", "viral", "professional", "business"

CRITICAL INSTRUCTIONS FOR COMPETITOR DISCOVERY QUERIES:
- Create SHORT, NATURAL search terms that people actually use
- Maximum 2-4 words per query
- Think like a customer searching for solutions
- Query 1: Find DIRECT competitors (primary search term)
- Query 2: Find CLOSE alternatives (alternative way to search for same thing)
- BOTH queries should target the SAME SOLUTION CATEGORY
- Use simple, common language - avoid jargon
- NO complex phrases or multiple descriptors

Remember: Search engines work best with simple, natural language that real users type.

IMPORTANT: Both queries should target the SAME solution category but use different search approaches. Don't make Query 2 a broader category - that will find irrelevant competitors.`;
};

module.exports = {
  businessAnalysisPrompt
};