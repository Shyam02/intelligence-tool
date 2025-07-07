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
    
    // Parse the response
    let briefs;
    try {
      const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        briefs = JSON.parse(jsonMatch[0]);
        global.contentBriefsDebugData.steps.push({
          step: 'parse_success',
          timestamp: new Date().toISOString(),
          parsedBriefs: briefs,
          logic: {
            description: 'Parse AI response for content briefs',
            sourceFile: 'controllers/contentBriefs.js',
            functionName: 'generateContentBriefs()'
          }
        });
        global.contentBriefsDebugData.summary = {
          viableCount: briefs.viable_count,
          totalBriefs: briefs.total_briefs,
          evaluatedCount: briefs.evaluated_count
        };
        console.log(`✅ Generated briefs: ${briefs.viable_count} viable articles, ${briefs.total_briefs} total briefs`);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      global.contentBriefsDebugData.error = 'Failed to parse content briefs';
      global.contentBriefsDebugData.steps.push({
        step: 'parse_error',
        timestamp: new Date().toISOString(),
        error: parseError.message,
        logic: {
          description: 'Error parsing AI response',
          sourceFile: 'controllers/contentBriefs.js',
          functionName: 'generateContentBriefs()'
        }
      });
      console.error('Failed to parse briefs:', parseError);
      return res.status(500).json({ error: 'Failed to parse content briefs' });
    }
    
    res.json(briefs);
    
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

module.exports = {
  generateContentBriefs
};