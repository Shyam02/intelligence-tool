// Twitter content briefs controller
const { callClaudeAPI } = require('../services/claude');

// Generate Twitter content briefs from search results
async function generateTwitterBriefs(req, res) {
  try {
    const { articles, businessContext } = req.body;
    console.log('🐦 Twitter brief generation request received');
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'Articles array is required' });
    }
    
    // Build comprehensive context for brief generation
    const contextPrompt = businessContext ? `
Business Context:
- Company: ${businessContext.companyName || 'Not specified'}
- Launch Date: ${businessContext.launchDate || 'Not specified'}
- Target Market: ${businessContext.targetGeography || 'Not specified'}
- Business Details: ${businessContext.businessSpecifics || 'Not specified'}
- Category: ${businessContext.category || 'Not specified'}
- Additional Info: ${JSON.stringify(businessContext)}
` : 'No business context provided.';

    const briefingPrompt = `You are an expert content strategist creating Twitter content briefs. Your job is to evaluate search results and create HIGH-QUALITY Twitter content ONLY for ideas with real value.

${contextPrompt}

CRITICAL INSTRUCTIONS:
1. FILTER AGGRESSIVELY - Reject ideas that are too generic, lack concrete value, or don't align with business goals
2. NO FABRICATION - Use only information directly from the article. Never invent details.
3. AUTHENTIC VOICE - Write from the founder's perspective, not generic marketing
4. MULTIPLE ANGLES - For viable ideas, create 2-3 different tweet angles
5. BUSINESS VALUE - Every tweet must demonstrate expertise or advance business goals

VIABILITY CRITERIA:
✅ APPROVE ideas with:
- Specific data, metrics, or insights
- Real examples or case studies
- Unique perspectives or surprising information
- Clear value for the target audience
- Connection to business expertise

❌ REJECT ideas that are:
- Too generic or obvious
- Lacking concrete details
- Not relevant to business goals
- Requiring fabricated information
- Poor fit for Twitter engagement

ARTICLES TO EVALUATE:
${JSON.stringify(articles, null, 2)}

For each article, determine if it's viable for Twitter content. For viable articles, create 2-3 different tweet briefs.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "evaluated_count": <number of articles evaluated>,
  "viable_count": <number of viable articles>,
  "total_briefs": <total number of briefs generated>,
  "results": [
    {
      "article_id": <article id>,
      "article_title": "<original article title>",
      "viable": true/false,
      "rejection_reason": "<if not viable, explain why>",
      "briefs": [
        {
          "angle": "<specific angle/perspective for this tweet>",
          "hook": "<attention-grabbing first line>",
          "content": "<complete tweet text, 280 chars max>",
          "content_type": "single_tweet",
          "engagement_strategy": "<question/statement/statistic>",
          "hashtags": ["<relevant hashtag>"],
          "metrics_to_track": ["replies", "retweets", "clicks"]
        }
      ]
    }
  ]
}

Remember: Quality over quantity. It's better to have fewer excellent tweets than many mediocre ones.`;

    const briefsResponse = await callClaudeAPI(briefingPrompt, false);
    
    // Parse the response
    let briefs;
    try {
      const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        briefs = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated briefs: ${briefs.viable_count} viable articles, ${briefs.total_briefs} total briefs`);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse briefs:', parseError);
      return res.status(500).json({ error: 'Failed to parse content briefs' });
    }
    
    res.json(briefs);
    
  } catch (error) {
    console.error('Twitter brief generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateTwitterBriefs
};