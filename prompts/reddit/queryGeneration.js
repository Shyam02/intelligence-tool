// Reddit Query Generation Prompts
// Generate Reddit search queries from foundational intelligence

const generateRedditSearchQueries = (foundationalIntelligence) => {
    return `You are a Reddit search expert. Generate specific search queries to find valuable content ideas and customer conversations on Reddit.
  
  BUSINESS INTELLIGENCE:
  ${JSON.stringify(foundationalIntelligence, null, 2)}
  
  Your task is to create Reddit search queries that will find:
  1. Customer pain points and complaints
  2. Solution-seeking discussions
  3. Competitor mentions and reviews  
  4. Industry trends and discussions
  5. Target audience conversations
  
  INSTRUCTIONS:
  - Create specific, targeted search queries
  - Focus on finding authentic customer conversations
  - Include both broad and specific query variations
  - Consider different ways people express problems
  - Target queries that will find engaged discussions (not just mentions)
  
  Generate exactly 10 Reddit search queries in this JSON format:
  
  {
    "pain_point_queries": [
      "struggling with [specific problem from pain_points.primary_problem]",
      "frustrated with [problem variation]",
      "[problem] is so annoying"
    ],
    "solution_seeking_queries": [
      "looking for [product_category] recommendations",
      "best [solution_keywords] for [target_market]",
      "alternatives to [common solution]"
    ],
    "competitor_queries": [
      "[competitor_name] problems OR issues",
      "[competitor_name] vs alternatives"
    ],
    "industry_discussion_queries": [
      "[industry_keywords] trends 2024",
      "[target_market] [industry_problem] discussion"
    ]
  }
  
  Focus on queries that will find real customer conversations with engagement (upvotes and comments), not just random mentions.
  
  Respond with ONLY the JSON object, no additional text.`;
  };
  
  module.exports = {
    generateRedditSearchQueries
  };