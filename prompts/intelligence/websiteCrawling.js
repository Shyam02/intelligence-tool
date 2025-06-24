// Website Crawling Prompts for extracting business information - Updated for clean text

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
  "other": []
},
"funding_info": "",
"company_mission": "",
"team_background": "",
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
  "other": []
},
"funding_info": "Not found",
"company_mission": "Not found",
"team_background": "Not found",
"additional_notes": "Analysis based on URL only - website content could not be accessed"
}

Extract what you can infer from the domain name and provide your best educated analysis.`;
};

module.exports = {
mainCrawlPrompt,
fallbackCrawlPrompt
};