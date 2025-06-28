// Reddit Query Generation Prompts
// Generate Reddit search queries from foundational intelligence

const generateRedditSearchQueries = (foundationalIntelligence) => {
    return `You are a Reddit search expert. Create specific Reddit search queries to find valuable discussions and customer conversations.

BUSINESS INTELLIGENCE DATA:
${JSON.stringify(foundationalIntelligence, null, 2)}

TASK: Generate 12 specific Reddit search queries based on the business data above that will find engaged discussions with real customer conversations.

CRITICAL JSON FORMATTING REQUIREMENTS:
- Respond with ONLY valid JSON, no other text
- Use exact double quotes for all strings
- Ensure proper comma placement
- Close all brackets correctly
- No trailing commas

Generate queries in this EXACT format:

{
  "pain_point_queries": [
    "specific query about the primary problem",
    "another pain point query",
    "third pain point query"
  ],
  "solution_seeking_queries": [
    "query about seeking recommendations",
    "query about finding alternatives", 
    "query about best solutions"
  ],
  "competitor_queries": [
    "query about competitor problems",
    "query about competitor alternatives"
  ],
  "industry_discussion_queries": [
    "query about industry trends",
    "query about target market discussions",
    "query about solution discussions",
    "query about industry challenges"
  ]
}

Use the actual business data to create specific, targeted queries. Replace placeholder text with real information from the business intelligence data.`;
};

module.exports = {
  generateRedditSearchQueries
};