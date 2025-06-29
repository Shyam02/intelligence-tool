// Content Generation Prompts for creating final, ready-to-post content from briefs

const contentGenerationPrompt = (briefs, generationContext) => {
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

  return `You are an expert content creator specializing in social media content. Your job is to transform content briefs into final, ready-to-post content that founders can copy and paste directly.

${contextPrompt}

${regenerateInstructions}

CRITICAL INSTRUCTIONS:
1. CREATE FINAL CONTENT - Not suggestions or templates, but actual ready-to-post content
2. MAINTAIN AUTHENTIC FOUNDER VOICE - Personal, genuine, not corporate marketing speak
3. ENSURE TWITTER COMPLIANCE - Single tweets ≤280 characters, threads with numbered tweets
4. INCLUDE STRATEGIC ELEMENTS - Hooks, calls-to-action, relevant hashtags
5. OPTIMIZE FOR ENGAGEMENT - Use proven engagement techniques for Twitter

CONTENT CREATION RULES:
✅ For SINGLE TWEETS:
- Maximum 280 characters including hashtags
- Strong hook in first 1-2 words
- Include 1-3 relevant hashtags
- End with engagement driver (question/CTA)

✅ For THREADS:
- Start with hook tweet (280 chars max)
- Number subsequent tweets (2/, 3/, etc.)
- Each tweet ≤280 characters
- End thread with summary/CTA tweet
- Use thread when brief suggests detailed explanation

✅ CONTENT QUALITY:
- Use specific data/numbers when available from brief
- Write from founder's personal perspective
- Include actionable insights or takeaways
- Avoid generic marketing language
- Make it immediately valuable to readers

CONTENT BRIEFS TO TRANSFORM:
${JSON.stringify(briefs, null, 2)}

For each brief, determine if it should be a single tweet or thread based on:
- Content complexity and depth
- Amount of information to convey
- Brief's content type specification
- Natural storytelling flow

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "success": true,
  "generated_content": [
    {
      "brief_id": "<original brief identifier>",
      "brief_angle": "<original brief angle>",
      "content_type": "single_tweet" OR "thread",
      "final_content": "<complete ready-to-post tweet content>",
      "thread_tweets": ["<tweet 1>", "<tweet 2>", "<tweet 3>"] // only if thread
      "hashtags": ["<hashtag1>", "<hashtag2>"],
      "character_count": <total character count>,
      "engagement_hook": "<the hook used>",
      "call_to_action": "<the CTA used>",
      "content_notes": "<brief explanation of approach taken>"
    }
  ],
  "total_generated": <number of content pieces created>,
  "generation_timestamp": "${new Date().toISOString()}"
}

EXAMPLES:

Single Tweet Example:
"Just discovered: 73% of startups fail because they build features nobody wants. 

Here's the 5-minute validation test I use before building anything:

[Hook] → [Statistic] → [Value promise] → [CTA]

What's your go-to validation method? 🧵"

Thread Example:
"1/ Why most startup advice is dangerous (and what to do instead)

2/ "Follow your passion" sounds inspiring but ignores market reality...

3/ "Move fast and break things" works for Facebook, not your bootstrapped startup...

4/ Here's what actually works: [specific actionable advice]

What startup advice do you wish someone had told you? Reply and I'll share more."

Remember: Create content that sounds like it comes from an experienced founder sharing genuine insights, not a marketing agency pushing products.`;
};

module.exports = {
  contentGenerationPrompt
};