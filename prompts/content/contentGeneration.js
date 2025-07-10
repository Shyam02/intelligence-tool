const contentGenerationPrompt = (strategicBriefs, generationContext) => {
  const contextPrompt = generationContext.business_context ? `
Business Context:
- Company: ${generationContext.business_context.companyName || 'Not specified'}
- Launch Date: ${generationContext.business_context.launchDate || 'Not specified'}
- Target Market: ${generationContext.business_context.targetGeography || 'Not specified'}
- Business Description: ${generationContext.business_context.businessDescription || 'Not specified'}
- Value Proposition: ${generationContext.business_context.valueProposition || 'Not specified'}
- Target Customer: ${generationContext.business_context.targetCustomer || 'Not specified'}
- Industry: ${generationContext.business_context.industryCategory || 'Not specified'}
- Company Stage: ${generationContext.business_context.businessStage || 'Not specified'}
` : 'No business context provided.';

  const regenerateInstructions = generationContext.regenerate_options?.regenerate_mode ? `
REGENERATION MODE: You are regenerating content. 
- Create a DIFFERENT version from what was previously generated
- Variation Request: ${generationContext.regenerate_options.variation_request || 'Create a different style/approach'}
- Maintain the same core message but change the approach, tone, or structure
` : '';

  return `You are an expert content execution engine. Your job is to execute strategic content briefs by creating final, ready-to-post content according to the detailed creation prompts and specifications provided.

${contextPrompt}

${regenerateInstructions}

CRITICAL INSTRUCTIONS:
1. EXECUTE STRATEGIC BRIEFS - Follow the creation_prompts exactly as specified
2. CREATE FINAL READY-TO-POST CONTENT - Not suggestions, but actual copy-paste content
3. MAINTAIN AUTHENTIC FOUNDER VOICE - Personal, genuine, expertise-based content
4. MULTI-CHANNEL EXECUTION - Create content for each target channel specified
5. COMPONENT COORDINATION - Ensure text and visual components work together seamlessly

PLATFORM-SPECIFIC REQUIREMENTS:
✅ TWITTER:
- Single tweets: ≤280 characters including hashtags
- Threads: Each tweet ≤280 chars, numbered (2/, 3/, etc.)
- Strong hooks in first few words
- Include 1-3 relevant hashtags
- End with engagement driver (question/CTA)

✅ LINKEDIN:
- Professional tone while maintaining founder authenticity
- Longer form content (300-1000 words typical)
- Industry-relevant insights and business value
- Professional networking CTAs
- Strategic hashtag usage

✅ VISUAL COORDINATION:
- Text content references specific visual elements
- Visual supports but doesn't repeat text content
- Consistent branding and messaging
- Both components work independently and together

STRATEGIC BRIEFS TO EXECUTE:
${JSON.stringify(strategicBriefs, null, 2)}

For each strategic brief, execute the creation_prompts for each target channel. Create final content that matches the strategic specifications.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "total_generated": <number of content pieces created>,
  "generation_summary": {
    "total_generated": <same as above>,
    "twitter_content": <count of Twitter pieces>,
    "linkedin_content": <count of LinkedIn pieces>, 
    "visual_components": <count of visual specs>,
    "generation_timestamp": "<ISO timestamp>"
  },
  "generated_content": [
    {
      "brief_id": "<matching strategic brief ID>",
      "brief_angle": "<angle from strategic brief>",
      "channel": "<twitter, linkedin, etc>",
      "content_type": "<single_tweet, thread, professional_post, etc>",
      "final_content": "<actual content to post>" or ["<tweet 1>", "<tweet 2>"] for threads,
      "character_count": <total characters> or [<count1>, <count2>] for threads,
      "within_limit": true/false,
      "hashtags": ["<hashtag1>", "<hashtag2>"],
      "engagement_hook": "<what makes this engaging>",
      "call_to_action": "<specific CTA used>",
      "visual_component_specs": {
        "type": "<visual type if applicable>",
        "description": "<what visual should show>",
        "coordination_notes": "<how visual works with text>"
      },
      "status": "generated",
      "generation_timestamp": "<ISO timestamp>"
    }
  ]
}

Execute each strategic brief according to its creation prompts. Create compelling, authentic content that founders can immediately use.`;
};

module.exports = { contentGenerationPrompt };