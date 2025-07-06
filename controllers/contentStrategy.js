// Content strategy generation controller
const { callClaudeAPI } = require('../services/ai');
const { intelligence } = require('../prompts');
// systemLogger removed for simplified approach


// Generate comprehensive content strategy
async function generateContentStrategy(req, res) {
  try {
    const { businessContext, availableData } = req.body;
    
    console.log('📋 Starting content strategy generation...');
    
    // Initialize global debug data
    global.contentStrategyDebugData = {
      timestamp: new Date().toISOString(),
      businessContext: businessContext,
      availableData: availableData,
      strategyContext: null,
      dataCompleteness: null,
      aiPrompt: null,
      aiResponse: null,
      finalStrategy: null,
      error: null
    };
    
    // Prepare context with missing field handling
    const strategyContext = prepareContext(businessContext);
    global.contentStrategyDebugData.strategyContext = strategyContext;
    
    // Store business context preparation logic in debug data
    global.contentStrategyDebugData.businessContextPreparation = {
      step: 'business_context_preparation',
      timestamp: new Date().toISOString(),
      inputContext: businessContext,
      outputContext: strategyContext,
      logic: {
        description: 'Prepare business context with missing field handling and defaults',
        sourceFile: 'controllers/contentStrategy.js',
        functionName: 'prepareContext()',
        steps: [
          'Extract business_profile from input or use empty object',
          'Extract competitor_analysis from input or use empty object',
          'Extract industry_insights from input or use empty array',
          'Extract website_data from input or use empty object',
          'Extract business_goals from input or use "general growth" default',
          'Extract current_presence from input or use empty object',
          'Return structured context object for AI processing'
        ],
        dataUsage: {
          inputFields: [
            'business_profile',
            'competitor_analysis', 
            'industry_insights',
            'website_data',
            'business_goals',
            'current_presence'
          ],
          defaultValues: {
            business_profile: '{}',
            competitor_analysis: '{}',
            industry_insights: '[]',
            website_data: '{}',
            business_goals: '"general growth"',
            current_presence: '{}'
          },
          outputStructure: 'Structured object with all required fields for AI prompt'
        }
      }
    };
    
    const dataCompleteness = calculateCompleteness(availableData);
    global.contentStrategyDebugData.dataCompleteness = dataCompleteness;
    
    console.log('📊 Data completeness score:', dataCompleteness.score);
    
    // Generate AI prompt
    const prompt = intelligence.contentStrategyPrompt(strategyContext, dataCompleteness);
    global.contentStrategyDebugData.aiPrompt = {
      step: 'content_strategy_generation',
      timestamp: new Date().toISOString(),
      prompt: prompt,
      promptSource: {
        sourceFile: 'prompts/intelligence/contentStrategy.js',
        functionName: 'contentStrategyPrompt()',
        description: 'AI prompt for comprehensive content strategy generation'
      },
      logic: {
        description: 'Generate comprehensive content strategy using business context and data completeness',
        sourceFile: 'controllers/contentStrategy.js',
        functionName: 'generateContentStrategy() - AI prompt generation',
        steps: [
          'Prepare business context with missing field handling',
          'Calculate data completeness score',
          'Generate AI prompt with business context and completeness data',
          'Send prompt to Claude API for content strategy generation'
        ],
        dataUsage: {
          businessContext: [
            'Business Profile',
            'Competitor Analysis',
            'Industry Insights',
            'Website Data',
            'Business Goals',
            'Current Social Presence'
          ],
          dataCompleteness: [
            'Completeness Score',
            'Missing Fields',
            'Recommendations'
          ]
        }
      }
    };
    
    // Get AI response
    const response = await callClaudeAPI(prompt, false, null, 'AI: Content Strategy');
    global.contentStrategyDebugData.aiResponse = {
      step: 'content_strategy_ai_response',
      timestamp: new Date().toISOString(),
      response: response,
      logic: {
        description: 'AI response for content strategy generation',
        sourceFile: 'services/ai.js',
        functionName: 'callClaudeAPI()',
        steps: [
          'Send content strategy prompt to Claude API',
          'Receive AI response with comprehensive strategy',
          'Handle API rate limiting and errors'
        ]
      }
    };
    
    // Parse strategy response
    const strategy = parseStrategyResponse(response);
    global.contentStrategyDebugData.finalStrategy = strategy;
    
    // Add final result to debug data
    global.contentStrategyDebugData.summary = {
      businessContextFields: Object.keys(businessContext || {}).length,
      availableDataFields: Object.keys(availableData || {}).length,
      dataCompletenessScore: dataCompleteness.score,
      missingFields: dataCompleteness.missing_fields,
      recommendations: dataCompleteness.recommendations,
      strategyGenerated: !!strategy,
      strategyChannels: strategy?.content_strategy?.channels ? Object.keys(strategy.content_strategy.channels).length : 0,
      analysisMethod: 'ai_powered_content_strategy_generation'
    };
    
    console.log('✅ Content strategy generated successfully');
    res.json({
      success: true,
      strategy: strategy,
      data_completeness: strategy.content_strategy.data_completeness
    });
    
  } catch (error) {
    console.error('❌ Content strategy generation failed:', error);
    
    // Store error in debug data
    if (global.contentStrategyDebugData) {
      global.contentStrategyDebugData.error = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      };
    }
    
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
