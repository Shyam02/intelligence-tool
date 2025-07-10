// Content briefs controller
const { callClaudeAPI } = require('../services/ai');
const { content } = require('../prompts');

// Generate content briefs from search results
async function generateContentBriefs(req, res) {
  try {
    const { articles, businessContext } = req.body;
    // Initialize debug data
    global.contentBriefsDebugData = {
      timestamp: new Date().toISOString(),
      input: { articles, businessContext },
      steps: [],
      error: null,
      summary: null
    };
    global.contentBriefsDebugData.steps.push({
      step: 'input_received',
      timestamp: new Date().toISOString(),
      articlesCount: articles ? articles.length : 0,
      businessContextPresent: !!businessContext,
      logic: {
        description: 'Receive articles and business context for content briefs generation',
        sourceFile: 'controllers/contentBriefs.js',
        functionName: 'generateContentBriefs()'
      }
    });
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      global.contentBriefsDebugData.error = 'Articles array is required';
      return res.status(400).json({ error: 'Articles array is required' });
    }
    
    // Use extracted prompt instead of inline
    const briefingPrompt = content.contentBriefsPrompt(articles, businessContext);
    global.contentBriefsDebugData.steps.push({
      step: 'prompt_created',
      timestamp: new Date().toISOString(),
      prompt: briefingPrompt,
      logic: {
        description: 'Create content briefs prompt',
        sourceFile: 'prompts/content/contentBriefs.js',
        functionName: 'contentBriefsPrompt()'
      }
    });
    const briefsResponse = await callClaudeAPI(briefingPrompt, false, null, 'AI: Content Briefs');
    global.contentBriefsDebugData.steps.push({
      step: 'ai_response',
      timestamp: new Date().toISOString(),
      response: briefsResponse,
      logic: {
        description: 'Call Claude API for content briefs',
        sourceFile: 'services/ai.js',
        functionName: 'callClaudeAPI()'
      }
    });
    
    // Parse the strategic briefs response
let strategicBriefs;
try {
  const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    strategicBriefs = JSON.parse(jsonMatch[0]);
    
    // Validate strategic brief structure
    const isValidStructure = validateStrategicBriefsStructure(strategicBriefs);
    if (!isValidStructure) {
      throw new Error('Invalid strategic briefs structure received from AI');
    }
    
    global.contentBriefsDebugData.steps.push({
      step: 'parse_success',
      timestamp: new Date().toISOString(),
      parsedBriefs: strategicBriefs,
      logic: {
        description: 'Parse AI response for strategic content briefs',
        sourceFile: 'controllers/contentBriefs.js',
        functionName: 'generateContentBriefs()'
      }
    });
    global.contentBriefsDebugData.summary = {
      viableCount: strategicBriefs.viable_count,
      totalBriefs: strategicBriefs.total_briefs,
      evaluatedCount: strategicBriefs.evaluated_count
    };
    console.log(`✅ Generated strategic briefs: ${strategicBriefs.viable_count} viable articles, ${strategicBriefs.total_briefs} total strategic briefs`);
  } else {
    throw new Error('No JSON found in response');
  }
} catch (parseError) {
  global.contentBriefsDebugData.error = 'Failed to parse strategic content briefs';
  global.contentBriefsDebugData.steps.push({
    step: 'parse_error',
    timestamp: new Date().toISOString(),
    error: parseError.message,
    logic: {
      description: 'Error parsing AI response for strategic briefs',
      sourceFile: 'controllers/contentBriefs.js',
      functionName: 'generateContentBriefs()'
    }
  });
  console.error('Failed to parse strategic briefs:', parseError);
  return res.status(500).json({ error: 'Failed to parse strategic content briefs' });
}

res.json(strategicBriefs);
    
  
    
  } catch (error) {
    global.contentBriefsDebugData.error = error.message;
    global.contentBriefsDebugData.steps.push({
      step: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      logic: {
        description: 'Unhandled error during content briefs generation',
        sourceFile: 'controllers/contentBriefs.js',
        functionName: 'generateContentBriefs()'
      }
    });
    console.error('Content brief generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Validate strategic briefs structure
function validateStrategicBriefsStructure(briefs) {
  try {
    // Check required top-level fields
    if (!briefs.hasOwnProperty('evaluated_count') || 
        !briefs.hasOwnProperty('viable_count') || 
        !briefs.hasOwnProperty('total_briefs') || 
        !Array.isArray(briefs.results)) {
      return false;
    }
    
    // Check each result has required structure
    for (const result of briefs.results) {
      if (!result.hasOwnProperty('article_id') || 
          !result.hasOwnProperty('article_title') || 
          !result.hasOwnProperty('viable')) {
        return false;
      }
      
      // If viable, check briefs structure
      if (result.viable && Array.isArray(result.briefs)) {
        for (const brief of result.briefs) {
          if (!brief.hasOwnProperty('brief_id') || 
              !brief.hasOwnProperty('content_angle') || 
              !brief.hasOwnProperty('target_channels') || 
              !brief.hasOwnProperty('creation_prompts')) {
            return false;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Strategic briefs validation error:', error);
    return false;
  }
}

module.exports = {
  generateContentBriefs
};