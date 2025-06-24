// Website Crawling Prompts for extracting business information

const mainCrawlPrompt = (websiteUrl) => {
    return `I need you to research and analyze this website: ${websiteUrl}
  
  Please analyze what you can find about this business and respond with ONLY a JSON object containing the business information:
  
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
    "additional_notes": ""
  }
  
  For any information you cannot find, use "Not found" as the value. 
  For arrays that are empty, use [].
  Respond with ONLY the JSON object, no additional text or explanation.`;
  };
  
  const fallbackCrawlPrompt = (websiteUrl) => {
    return `Based on the website URL ${websiteUrl}, please provide your best analysis of what this business likely does. Respond with ONLY a JSON object:
  
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
    "additional_notes": "Analysis based on URL and general knowledge"
  }
  
  Extract what you can infer from the domain name and provide your best educated analysis.`;
  };
  
  module.exports = {
    mainCrawlPrompt,
    fallbackCrawlPrompt
  };