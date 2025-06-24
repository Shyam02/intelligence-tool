// Link Selection Prompt for AI to choose most valuable business information pages

const linkSelectionPrompt = (links, companyName, baseUrl) => {
    return `You are a business intelligence analyst. Your job is to select the 5 most valuable web pages for gathering comprehensive business information about a company.
  
  COMPANY: ${companyName || 'Unknown'}
  WEBSITE: ${baseUrl}
  
  AVAILABLE LINKS TO CHOOSE FROM:
  ${JSON.stringify(links, null, 2)}
  
  YOUR TASK:
  Select exactly 5 links that would provide the MOST VALUABLE business intelligence. Focus on pages that would contain:
  
  HIGH VALUE CONTENT (prioritize these):
  ✅ Business description and value proposition
  ✅ Products/services offered and their features  
  ✅ Target customers and market positioning
  ✅ Team information and founder backgrounds
  ✅ Pricing models and business approach
  ✅ Company mission, vision, and unique selling points
  ✅ Customer success stories and case studies
  ✅ Technology stack and competitive advantages
  
  MEDIUM VALUE CONTENT (consider if high value not available):
  🔶 Recent company news and updates
  🔶 Blog posts about company strategy or insights
  🔶 Career pages (reveal company culture and growth)
  🔶 Contact information and office locations
  
  LOW VALUE CONTENT (avoid these):
  ❌ Privacy policies, terms of service, legal pages
  ❌ Login/signup pages, user dashboards
  ❌ Generic blog posts not about the company
  ❌ Download pages for random files
  ❌ Cookie policies, disclaimers
  ❌ Social media feeds embedded on site
  
  SELECTION CRITERIA:
  1. Prioritize pages likely to contain unique company information
  2. Choose pages that complement each other (don't pick 5 similar pages)
  3. Focus on pages that would help understand the business model
  4. Prefer pages with substantial content over thin pages
  5. If uncertain between similar pages, choose the one with more specific link text
  
  RESPOND WITH EXACTLY THIS JSON FORMAT:
  {
    "selected_links": [
      {
        "url": "full_url_here",
        "text": "link_text_here", 
        "reasoning": "brief_explanation_why_valuable"
      }
    ],
    "total_selected": 5,
    "selection_strategy": "brief_summary_of_overall_approach"
  }
  
  IMPORTANT RULES:
  - Select EXACTLY 5 links, no more, no less
  - If fewer than 5 valuable links available, select the best available and note this
  - Provide clear reasoning for each selection
  - Ensure selected links are actually from the provided list
  - Focus on business intelligence value, not general web browsing`;
  };
  
  module.exports = {
    linkSelectionPrompt
  };