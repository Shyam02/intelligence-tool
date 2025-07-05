// Content strategy generation controller
const { callClaudeAPI } = require('../services/ai');
const { intelligence } = require('../prompts');
// systemLogger removed for simplified approach


// Generate comprehensive content strategy
async function generateContentStrategy(req, res) {
  // Debug logging removed for simplified approach
  try {
    const { businessContext, availableData } = req.body;
    
    console.log('📋 Starting content strategy generation...');
    
    // Prepare context with missing field handling
    const strategyContext = prepareContext(businessContext);
    const dataCompleteness = calculateCompleteness(availableData);
    
    console.log('📊 Data completeness score:', dataCompleteness.score);
    
    // Generate AI prompt
    const prompt = intelligence.contentStrategyPrompt(strategyContext, dataCompleteness);
    
    // Get AI response
    const response = await callClaudeAPI(prompt, false, null, 'AI: Content Strategy');
    
    // Parse strategy response
    const strategy = parseStrategyResponse(response);
    
    console.log('✅ Content strategy generated successfully');
    res.json({
      success: true,
      strategy: strategy,
      data_completeness: strategy.content_strategy.data_completeness
    });
    
    // Debug logging removed for simplified approach
  } catch (error) {
    console.error('❌ Content strategy generation failed:', error);
    // Error logging removed for simplified approach
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Prepare business context with missing field handling
function prepareContext(businessContext) {
  return {
    business_profile: businessContext.business_profile || {},
    competitor_analysis: businessContext.competitor_analysis || {},
    industry_insights: businessContext.industry_insights || [],
    website_data: businessContext.website_data || {},
    business_goals: businessContext.business_goals || "general growth",
    current_presence: businessContext.current_presence || {}
  };
}

// Calculate data completeness score
function calculateCompleteness(availableData) {
  const fields = ['business_profile', 'competitor_analysis', 'industry_insights', 'website_data'];
  const completedFields = fields.filter(field => availableData[field]);
  
  const score = Math.round((completedFields.length / fields.length) * 100);
  const missingFields = fields.filter(field => !availableData[field]);
  
  return {
    score: score,
    missing_fields: missingFields,
    recommendations: generateRecommendations(availableData)
  };
}

// Generate recommendations for missing data
function generateRecommendations(availableData) {
  const recommendations = [];
  
  if (!availableData.competitor_analysis) {
    recommendations.push("Complete competitor research for better hashtag suggestions");
  }
  
  if (!availableData.industry_insights) {
    recommendations.push("Add industry insights for more targeted content strategy");
  }
  
  if (!availableData.website_data) {
    recommendations.push("Crawl website for detailed business information");
  }
  
  return recommendations;
}

// Parse strategy response from AI
function parseStrategyResponse(response) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in strategy response');
    }
  } catch (parseError) {
    console.error('JSON Parse Error in strategy response:', parseError);
    throw new Error('Failed to parse strategy response');
  }
}

module.exports = {
  generateContentStrategy
};
