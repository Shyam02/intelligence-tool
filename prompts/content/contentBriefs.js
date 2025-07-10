const contentBriefsPrompt = (articles, businessContext) => {
  const contextPrompt = businessContext ? `
Business Context:
- Company: ${businessContext.companyName || 'Not specified'}
- Launch Date: ${businessContext.launchDate || 'Not specified'}
- Target Market: ${businessContext.targetGeography || 'Not specified'}
- Business Details: ${businessContext.businessSpecifics || 'Not specified'}
- Value Proposition: ${businessContext.valueProposition || 'Not specified'}
- Target Customer: ${businessContext.targetCustomer || 'Not specified'}
- Industry: ${businessContext.industryCategory || 'Not specified'}
- Key Features: ${businessContext.keyFeatures || 'Not specified'}
- Business Stage: ${businessContext.businessStage || 'Not specified'}
` : 'No business context provided.';

  return `You are an expert content strategist creating strategic content briefs. Your job is to evaluate search results and create STRATEGIC PLANNING DOCUMENTS for viable content opportunities.

${contextPrompt}

CRITICAL INSTRUCTIONS:
1. CREATE STRATEGIC BRIEFS - Not final content, but detailed plans for content creation
2. FILTER AGGRESSIVELY - Only approve ideas with genuine business value
3. MULTI-CHANNEL THINKING - Identify which platforms each idea works best for
4. COMPONENT PLANNING - Specify if content needs text, visuals, or both
5. AUTHENTIC BUSINESS VOICE - Everything must connect to real business expertise

VIABILITY CRITERIA:
✅ APPROVE ideas with:
- Specific data, metrics, or concrete insights
- Real customer examples or case studies  
- Unique business perspectives or surprising information
- Clear value demonstration for target audience
- Strong connection to founder expertise areas

❌ REJECT ideas that are:
- Too generic or obvious
- Lacking concrete supporting details
- Not relevant to business goals or expertise
- Requiring fabricated information to work
- Poor strategic fit for content marketing

ARTICLES TO EVALUATE:
${JSON.stringify(articles, null, 2)}

For each viable article, create 1-3 strategic content briefs with different angles or channel approaches.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "evaluated_count": <number of articles evaluated>,
  "viable_count": <number of viable articles>,
  "total_briefs": <total number of strategic briefs generated>,
  "results": [
    {
      "article_id": <article id>,
      "article_title": "<original article title>",
      "viable": true/false,
      "rejection_reason": "<if not viable, detailed explanation why>",
      "briefs": [
        {
          "brief_id": "<unique_brief_id>",
          "content_angle": "<specific strategic perspective or approach>",
          "strategic_value": "<why this content advances business goals>",
          "target_channels": ["<optimal platforms for this content>"],
          "content_type": "<single_modal or multi_modal>",
          "key_message": "<core takeaway for audience>",
          "business_connection": "<how this demonstrates founder expertise>",
          "content_components": {
            "primary_component": {
              "type": "<narrative_type: case_study, insight_share, process_explanation, etc>",
              "focus": "<main content focus>",
              "founder_voice": "<voice characteristics for this content>",
              "authenticity_boundaries": "<what real information is available>"
            },
            "supporting_visual": {
              "type": "<visual_type: infographic, chart, before_after, process_diagram, etc>",
              "required_data": ["<specific data points to visualize>"],
              "brand_consistency": "<visual brand requirements>"
            }
          },
          "channel_strategies": {
            "twitter": {
              "format": "<thread or single_post>",
              "hook_strategy": "<engagement approach>",
              "content_length": "<estimated length>",
              "engagement_goal": "<what response we want>",
              "hashtag_strategy": "<hashtag approach>"
            },
            "linkedin": {
              "format": "<professional_post, article, or carousel>",
              "hook_strategy": "<professional engagement approach>",
              "content_length": "<estimated word count>",
              "engagement_goal": "<professional networking goal>",
              "cta_strategy": "<call to action approach>"
            }
          },
          "creation_prompts": {
            "twitter_creation_prompt": "<exact detailed instructions for AI to create Twitter content>",
            "linkedin_creation_prompt": "<exact detailed instructions for AI to create LinkedIn content>",
            "visual_creation_prompt": "<exact instructions for visual creation>",
            "coordination_notes": "<how components should work together>"
          }
        }
      ]
    }
  ]
}

Remember: Create strategic plans, not final content. These briefs will be used by content generators to create actual posts.`;
};

module.exports = { contentBriefsPrompt };