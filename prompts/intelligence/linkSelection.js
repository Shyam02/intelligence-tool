// Link Selection Prompt for AI to choose 0-10 most valuable business information pages
// File path: /prompts/intelligence/linkSelection.js

const linkSelectionPrompt = (links, companyName, baseUrl) => {
  return `Analyze ${companyName || 'this company'}: ${baseUrl}

Your goal: Find pages that tell us about THE BUSINESS - who they are, what they sell, how they make money, who runs it.

LINKS TO CHOOSE FROM:
${JSON.stringify(links, null, 2)}

Select 3-8 pages that will give us the most information about:
- What the company does and who runs it
- What products/services they offer  
- Who their customers are
- How their business works
- Company background and story

Examples of valuable pages:
- About page → tells company story and mission
- Team page → shows who the founders/leaders are
- Pricing page → shows business model
- Case studies → shows real customers and use cases

Select pages based on their potential to give business insights, not rigid rules.

RESPOND WITH EXACTLY THIS JSON FORMAT:
{
  "selected_links": [
    {
      "url": "full_url_here",
      "text": "link_text_here", 
      "reasoning": "what_business_info_this_will_provide"
    }
  ],
  "total_selected": <number_0_to_10>,
  "selection_strategy": "brief_explanation_of_your_approach"
}

REQUIREMENTS:
- Select between 0-10 links based on business value
- Each selected link must be from the provided list
- Focus on getting comprehensive business intelligence
- If no links provide significant value, select 0 and explain why`;
};

module.exports = {
  linkSelectionPrompt
};