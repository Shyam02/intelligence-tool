// Content Strategy Prompt for generating comprehensive content strategy

const contentStrategyPrompt = (businessContext, availableData) => {
  return `You are a senior content marketing strategist. Based on the provided business context and available data, generate a comprehensive content strategy that covers channel analysis, hashtag strategies, writing guidelines, and resource allocation.

INSTRUCTIONS:
- Work with available data and note limitations clearly
- Make reasonable assumptions when data is missing
- Provide alternative recommendations when data is limited
- Focus on practical, actionable strategies
- Consider the business model, target audience, and competitive landscape

AVAILABLE BUSINESS CONTEXT:
${JSON.stringify(businessContext, null, 2)}

DATA AVAILABILITY:
${JSON.stringify(availableData, null, 2)}

Generate a comprehensive content strategy focusing on:
1. Channel suitability analysis (work with available data, note limitations)
2. Hashtag and mention recommendations for each channel
3. Brand voice and writing style guidelines
4. Channel prioritization and resource allocation

If certain business data is missing, make reasonable assumptions and note them clearly.

OUTPUT FORMAT (JSON):
{
  "content_strategy": {
    "data_completeness": {
      "score": 75,
      "missing_fields": ["competitor_data", "industry_insights"],
      "recommendations": ["Complete competitor research for better hashtag suggestions"]
    },
    "strategy_overview": {
      "recommended_channels": ["twitter", "linkedin"],
      "secondary_channels": ["instagram"],
      "avoid_channels": ["tiktok"],
      "reasoning": "Based on business model and available data..."
    },
    "channels": {
      "twitter": {
        "suitability_score": 9,
        "reasoning": "Perfect for B2B SaaS, tech-savvy audience...",
        "target_audience": "Tech founders, startup employees, B2B decision makers",
        "content_types": ["threads", "single_tweets", "polls"],
        "posting_frequency": "2-3 times daily",
        "best_times": ["9:00 AM EST", "1:00 PM EST", "7:00 PM EST"],
        "key_metrics": ["engagement_rate", "profile_visits", "link_clicks"],
        "hashtag_pools": {
          "industry": ["#SaaS", "#startups", "#productivity"],
          "trending": ["#AI", "#automation"],
          "niche": ["#B2Btools", "#workflow"],
          "branded": ["#YourProductName"],
          "community": ["#buildinpublic", "#indiehackers"]
        },
        "mention_opportunities": {
          "influencers": ["@paulg", "@naval", "@pmarca"],
          "publications": ["@techcrunch", "@producthunt"],
          "communities": ["@indiehackers", "@ycombinator"],
          "partners": ["@complementarytools"],
          "customers": ["@happycustomers"]
        }
      },
      "linkedin": {
        "suitability_score": 8,
        "reasoning": "Strong B2B platform, professional audience...",
        "target_audience": "Business professionals, decision makers, industry leaders",
        "content_types": ["thought_leadership", "company_updates", "industry_insights"],
        "posting_frequency": "3-4 posts/week",
        "best_times": ["Tuesday 9-10am", "Thursday 1-2pm"],
        "key_metrics": ["impressions", "engagement", "profile_views"],
        "hashtag_pools": {
          "industry": ["#B2B", "#SaaS", "#Marketing"],
          "trending": ["#DigitalTransformation", "#Innovation"],
          "niche": ["#BusinessGrowth", "#Leadership"],
          "branded": ["#YourCompanyName"],
          "community": ["#BusinessTips", "#ProfessionalDevelopment"]
        },
        "mention_opportunities": {
          "influencers": ["@industry_expert1", "@thought_leader2"],
          "publications": ["@linkedin_pulse", "@business_insider"],
          "communities": ["@professional_groups", "@industry_associations"],
          "partners": ["@strategic_partners"],
          "customers": ["@successful_clients"]
        }
      },
      "instagram": {
        "suitability_score": 6,
        "reasoning": "Visual platform, may not be ideal for B2B...",
        "target_audience": "Young professionals, visual learners",
        "content_types": ["infographics", "behind_scenes", "product_demos"],
        "posting_frequency": "2-3 posts/week",
        "best_times": ["12:00 PM EST", "7:00 PM EST"],
        "key_metrics": ["reach", "engagement", "story_views"],
        "hashtag_pools": {
          "industry": ["#Business", "#Marketing", "#Growth"],
          "trending": ["#WorkFromHome", "#DigitalMarketing"],
          "niche": ["#BusinessTips", "#EntrepreneurLife"],
          "branded": ["#YourBrand"],
          "community": ["#BusinessOwners", "#StartupLife"]
        },
        "mention_opportunities": {
          "influencers": ["@business_influencer1", "@marketing_expert2"],
          "publications": ["@business_accounts", "@industry_leaders"],
          "communities": ["@business_communities", "@professional_networks"],
          "partners": ["@visual_partners"],
          "customers": ["@visual_customers"]
        }
      }
    },
    "writing_style": {
      "brand_voice": "authentic_expert",
      "personality_traits": ["authentic", "helpful", "data-driven", "transparent"],
      "tone_preferences": {
        "formality": "conversational_professional",
        "energy": "confident_but_approachable",
        "expertise": "knowledgeable_without_jargon"
      },
      "language_style": "clear_and_actionable",
      "key_phrases": ["Actually useful", "Real results", "No fluff", "Practical insights"],
      "content_principles": [
        "Always provide actionable value",
        "Share real experiences and data",
        "Be transparent about challenges",
        "Focus on helping others succeed"
      ],
      "dos_and_donts": {
        "dos": ["Share real metrics", "Ask engaging questions", "Respond to comments"],
        "donts": ["Over-promote products", "Use excessive jargon", "Make unsubstantiated claims"]
      }
    },
    "resource_allocation": {
      "priority_ranking": [
        {"channel": "twitter", "priority": 1, "status": "active", "focus_level": "high"},
        {"channel": "linkedin", "priority": 2, "status": "active", "focus_level": "medium"},
        {"channel": "instagram", "priority": 3, "status": "testing", "focus_level": "low"}
      ]
    }
  }
}

Please respond with ONLY the JSON, no other text.`;
};

module.exports = {
  contentStrategyPrompt
};
