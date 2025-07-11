// prompts/content/contentBriefs.js - UPDATED to use full article content

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

  // ENHANCEMENT: Prepare articles with full content when available
  const enrichedArticlesForPrompt = articles.map(article => {
    const hasFullContent = !!(article.contentFetched && article.fullContent);
    
    return {
      id: article.id,
      title: article.title,
      url: article.url,
      domain: article.domain,
      published: article.published,
      
      // ENHANCED: Use full content when available, fallback to preview
      content: hasFullContent ? article.fullContent : (article.preview || 'No content available'),
      content_type: hasFullContent ? 'full_article_content' : 'preview_only',
      content_length: hasFullContent ? article.contentLength : (article.preview ? article.preview.length : 0),
      
      // Add metadata about content quality
      content_quality: {
        has_full_content: hasFullContent,
        content_fetched_successfully: article.contentFetched || false,
        fetch_error: article.fetchError || null,
        estimated_depth: hasFullContent ? 'high' : 'low'
      }
    };
  });

  // Calculate content quality statistics
  const contentStats = {
    total_articles: articles.length,
    articles_with_full_content: enrichedArticlesForPrompt.filter(a => a.content_quality.has_full_content).length,
    articles_with_preview_only: enrichedArticlesForPrompt.filter(a => !a.content_quality.has_full_content).length,
    total_content_length: enrichedArticlesForPrompt.reduce((sum, a) => sum + a.content_length, 0)
  };

  return `You are an expert content strategist creating strategic content briefs. Your job is to evaluate articles with FULL CONTENT and create STRATEGIC PLANNING DOCUMENTS for viable content opportunities.

${contextPrompt}

CONTENT QUALITY ENHANCEMENT:
You now have access to FULL ARTICLE CONTENT for most articles, not just previews. This gives you significantly more context to:
- Identify specific data points, metrics, and insights within articles
- Understand the full context and nuance of each piece
- Extract concrete examples, case studies, and supporting details
- Assess the true strategic value and authenticity potential

ARTICLE CONTENT STATISTICS:
- Total Articles: ${contentStats.total_articles}
- Articles with Full Content: ${contentStats.articles_with_full_content}
- Articles with Preview Only: ${contentStats.articles_with_preview_only}
- Total Content Volume: ${Math.round(contentStats.total_content_length / 1000)}k characters

CRITICAL INSTRUCTIONS:
1. CREATE STRATEGIC BRIEFS - Not final content, but detailed plans for content creation
2. LEVERAGE FULL CONTENT - Use the complete article content to identify specific insights, data, and opportunities
3. FILTER AGGRESSIVELY - Only approve ideas with genuine business value and concrete supporting details
4. MULTI-CHANNEL THINKING - Identify which platforms each idea works best for
5. COMPONENT PLANNING - Specify if content needs text, visuals, or both
6. AUTHENTIC BUSINESS VOICE - Everything must connect to real business expertise

ENHANCED VIABILITY CRITERIA (with full content access):
✅ APPROVE ideas with:
- Specific data, metrics, statistics, or concrete insights found in the full content
- Real customer examples, case studies, or success stories detailed in the articles
- Unique business perspectives, surprising information, or counterintuitive findings
- Clear value demonstration supported by evidence in the full article content
- Strong connection to founder expertise areas with concrete supporting details
- Actionable insights that can be authentically shared based on article depth

❌ REJECT ideas that are:
- Too generic or obvious, even with full content access
- Lacking concrete supporting details despite having full article content
- Not relevant to business goals or expertise after reviewing complete content
- Requiring fabricated information to work, even with full context
- Poor strategic fit for content marketing after full content analysis

ARTICLE CONTENT ANALYSIS PRIORITY:
For articles with "content_type": "full_article_content" - prioritize these as they contain complete context
For articles with "content_type": "preview_only" - be more conservative due to limited information

ARTICLES TO EVALUATE (with enhanced content):
${JSON.stringify(enrichedArticlesForPrompt, null, 2)}

For each viable article, create 1-3 strategic content briefs with different angles or channel approaches. Focus on leveraging the specific insights, data, and examples found in the full article content.

RESPOND WITH THIS EXACT JSON FORMAT:
{
  "evaluated_count": <number of articles evaluated>,
  "viable_count": <number of viable articles>,
  "total_briefs": <total number of strategic briefs generated>,
  "content_analysis_summary": {
    "articles_with_full_content_used": <count of articles where full content influenced decision>,
    "specific_insights_identified": <count of concrete data points/insights found>,
    "high_quality_opportunities": <count of briefs based on full content analysis>
  },
  "results": [
    {
      "article_id": <article id>,
      "article_title": "<original article title>",
      "content_analysis": {
        "content_type_analyzed": "<full_article_content or preview_only>",
        "key_insights_found": ["<specific insights from content>"],
        "data_points_available": ["<specific metrics, statistics, examples>"],
        "content_depth_score": "<high, medium, low>"
      },
      "viable": true/false,
      "rejection_reason": "<if not viable, detailed explanation considering full content>",
      "briefs": [
        {
          "brief_id": "<unique_brief_id>",
          "content_angle": "<specific strategic perspective based on full content analysis>",
          "strategic_value": "<why this content advances business goals, with specific evidence>",
          "target_channels": ["<optimal platforms for this content>"],
          "content_type": "<single_modal or multi_modal>",
          "key_message": "<core takeaway based on full article insights>",
          "business_connection": "<how this demonstrates founder expertise with specific examples>",
          "supporting_evidence": {
            "specific_data_points": ["<concrete metrics, statistics from article>"],
            "examples_available": ["<real examples, case studies from content>"],
            "authenticity_foundation": "<what real information enables authentic sharing>"
          },
          "content_components": {
            "primary_component": {
              "type": "<narrative_type: case_study, insight_share, process_explanation, etc>",
              "focus": "<main content focus based on full article analysis>",
              "founder_voice": "<voice characteristics for this content>",
              "authenticity_boundaries": "<what real information is available from full content>"
            },
            "supporting_visual": {
              "type": "<visual_type: infographic, chart, before_after, process_diagram, etc>",
              "required_data": ["<specific data points from article to visualize>"],
              "brand_consistency": "<visual brand requirements>"
            }
          },
          "channel_strategies": {
            "twitter": {
              "format": "<thread or single_post>",
              "hook_strategy": "<engagement approach based on article insights>",
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
            "twitter_creation_prompt": "<exact detailed instructions for AI, including specific data/insights from article>",
            "linkedin_creation_prompt": "<exact detailed instructions for AI, including specific examples from content>",
            "visual_creation_prompt": "<exact instructions for visual creation using article data>",
            "coordination_notes": "<how components should work together using article insights>"
          }
        }
      ]
    }
  ]
}

Remember: You now have access to FULL ARTICLE CONTENT. Use this advantage to create much more strategic, data-rich, and authentically grounded content briefs. Look for specific insights, metrics, examples, and unique perspectives that weren't visible in just previews.`;
};

module.exports = { contentBriefsPrompt };