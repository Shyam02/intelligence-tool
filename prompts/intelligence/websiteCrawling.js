// prompts/intelligence/websiteCrawling.js
// Enhanced prompts with design asset analysis and content_voice_analysis

const mainCrawlPrompt = (websiteUrl, cleanTextContent) => {
  return `Analyze the following website content and extract detailed business information. This content has been processed to remove HTML markup and focus on meaningful business information.

Website URL: ${websiteUrl}

WEBSITE CONTENT TO ANALYZE:
${cleanTextContent}

Extract business information and respond with ONLY a JSON object containing the business details:

{
"company_name": "",
"business_description": "",
"value_proposition": "",
"target_customer": "",
"main_product_service": "",
"key_features": [],
"pricing_info": "",
"business_stage": "",
"industry_category": "",
"competitors_mentioned": [],
"unique_selling_points": [],
"team_size": "",
"recent_updates": "",
"social_media": {
  "twitter": "",
  "linkedin": "",
  "instagram": "",
  "facebook": "",
  "youtube": "",
  "tiktok": "",
  "pinterest": "",
  "reddit": "",
  "discord": "",
  "other": []
},
"funding_info": "",
"company_mission": "",
"team_background": "",
"content_voice_analysis": {
  "tone": "",
  "writing_style": "",
  "sentence_structure": "",
  "technical_language_level": "",
  "personality_traits": [],
  "voice_examples": []
},
"additional_notes": ""
}

EXTRACTION RULES:
- Use ONLY information explicitly found in the website content
- For any information you cannot find, use "Not found" as the value
- For arrays that are empty, use []
- Look for specific details like founder names, funding amounts, customer types, pricing models
- Pay attention to company descriptions, mission statements, product descriptions
- Extract social media links if present
- Note any mentioned competitors or partnerships
- Include team/founder background information if available
- Business stage indicators: "just getting started", "early stage", "growing", "established", etc.
- Look for pricing information, subscription models, or business model details
- Extract key features, benefits, or capabilities mentioned
- Note any recent updates, news, or milestones mentioned

CONTENT VOICE ANALYSIS INSTRUCTIONS:
Analyze the writing style, tone, and voice used throughout the content. Pay attention to:
- TONE: professional|casual|conversational|technical|friendly|authoritative
- WRITING_STYLE: storytelling|data_driven|educational|conversational|formal
- SENTENCE_STRUCTURE: short_punchy|detailed_explanatory|mixed
- TECHNICAL_LANGUAGE_LEVEL: beginner|intermediate|expert|mixed
- PERSONALITY_TRAITS: Extract 3-5 key personality traits that come through in their writing
- VOICE_EXAMPLES: Extract 1-2 specific phrases that exemplify their unique voice

Look for how they:
- Explain complex concepts (analogies, step-by-step, examples)
- Address their audience (formal vs casual, technical vs simple)
- Structure their messaging (headlines, body text, CTAs)
- Use personality in their copy (humor, authority, friendliness)

Respond with ONLY the JSON object, no additional text or explanation.`;
};

const multiPageAnalysisPrompt = (websiteUrl, combinedContent, crawlData, designAssets = null) => {


  return `Analyze the following comprehensive website content and extract detailed business information. This analysis includes the homepage plus ${crawlData.additionalPages.length} additional pages selected for maximum business intelligence value.

Website URL: ${websiteUrl}


COMPREHENSIVE WEBSITE CONTENT:
${combinedContent}

Extract business information and respond with ONLY a JSON object containing the business details:

{
"company_name": "",
"business_description": "",
"value_proposition": "",
"target_customer": "",
"main_product_service": "",
"key_features": [],
"pricing_info": "",
"business_stage": "",
"industry_category": "",
"competitors_mentioned": [],
"unique_selling_points": [],
"team_size": "",
"recent_updates": "",
"social_media": {
  "twitter": "",
  "linkedin": "",
  "instagram": "",
  "facebook": "",
  "youtube": "",
  "tiktok": "",
  "pinterest": "",
  "reddit": "",
  "discord": "",
  "other": []
},
"funding_info": "",
"company_mission": "",
"team_background": "",
"content_voice_analysis": {
  "tone": "",
  "writing_style": "",
  "sentence_structure": "",
  "technical_language_level": "",
  "personality_traits": [],
  "voice_examples": [],
  "brand_language_patterns": {
    "preferred_terminology": {},
    "power_words": [],
    "industry_specific_terms": []
  },
  "messaging_approach": {
    "how_they_explain_complex_concepts": "",
    "value_proposition_structure": "",
    "call_to_action_style": ""
  }
},
"additional_notes": ""
}

EXTRACTION RULES:
- Use ONLY information explicitly found in the website content
- For any information you cannot find, use "Not found" as the value
- For arrays that are empty, use []
- Combine information from ALL pages (internal and external) to create comprehensive business profile
- External domain content (social media, app stores) provides valuable supplementary business intelligence
- Prioritize specific details like founder names, funding amounts, customer types, pricing models
- Look for specific business metrics, customer counts, revenue information
- Extract team/founder background information if available
- Note any competitive advantages or unique positioning mentioned
- Include recent news, updates, or milestones if mentioned
- Leverage social media profiles and app store listings for additional business context

ENHANCED CONTENT VOICE ANALYSIS INSTRUCTIONS:
With multiple pages available, conduct a comprehensive analysis of their content voice and communication patterns:

1. TONE & STYLE ANALYSIS:
   - Analyze consistency across different page types (homepage vs about vs pricing)
   - Note any variations in tone for different audiences
   - Identify their professional vs casual communication balance

2. MESSAGING PATTERNS:
   - How they structure value propositions across pages
   - Common phrases or terminology they use consistently
   - How they address different customer segments

3. BRAND LANGUAGE:
   - Specific terms they use for customers (users, clients, members, etc.)
   - How they refer to their product/service (platform, tool, solution, app)
   - Industry-specific terminology they consistently use

4. COMMUNICATION APPROACH:
   - How they explain complex concepts (step-by-step, analogies, examples)
   - How they structure their calls-to-action
   - Balance between features and benefits in their messaging

5. VOICE EXAMPLES:
   - Extract 3-5 specific phrases that exemplify their unique voice
   - Include examples of how they explain their value proposition
   - Note any unique ways they address customer pain points

The goal is to capture their complete "content DNA" that can be used to generate authentic, on-brand content that matches their established voice and messaging patterns.

Respond with ONLY the JSON object, no additional text or explanation.`;
};

const fallbackCrawlPrompt = (websiteUrl) => {
return `The website content could not be fetched. Based only on the website URL ${websiteUrl}, provide your best analysis of what this business likely does. Respond with ONLY a JSON object:

{
"company_name": "",
"business_description": "",
"value_proposition": "",
"target_customer": "",
"main_product_service": "",
"key_features": [],
"pricing_info": "Not found",
"business_stage": "Unknown",
"industry_category": "",
"competitors_mentioned": [],
"unique_selling_points": [],
"team_size": "Not found",
"recent_updates": "Not found",
"social_media": {
  "twitter": "",
  "linkedin": "",
  "instagram": "",
  "facebook": "",
  "youtube": "",
  "tiktok": "",
  "pinterest": "",
  "reddit": "",
  "discord": "",
  "other": []
},
"funding_info": "Not found",
"company_mission": "Not found",
"team_background": "Not found",
"content_voice_analysis": {
  "tone": "Unknown - content not accessible",
  "writing_style": "Unknown - content not accessible",
  "sentence_structure": "Unknown - content not accessible",
  "technical_language_level": "Unknown - content not accessible",
  "personality_traits": [],
  "voice_examples": []
},
"additional_notes": "Analysis based on URL only - website content could not be accessed"
}

Extract what you can infer from the domain name and provide your best educated analysis.`;
};

module.exports = {
mainCrawlPrompt,
multiPageAnalysisPrompt,
fallbackCrawlPrompt
};