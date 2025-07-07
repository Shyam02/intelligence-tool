// Content generation controller
const { generateContentFromBriefs } = require('../services/contentGenerator');

// Generate final content from content briefs
async function generateTwitterContent(req, res) {
  try {
    const { briefs, businessContext, regenerateOptions } = req.body;
    // Initialize debug data
    global.contentGenerationDebugData = {
      timestamp: new Date().toISOString(),
      input: { briefs, businessContext, regenerateOptions },
      steps: [],
      error: null,
      summary: null
    };
    global.contentGenerationDebugData.steps.push({
      step: 'input_received',
      timestamp: new Date().toISOString(),
      briefsCount: briefs ? briefs.length : 0,
      businessContextPresent: !!businessContext,
      regenerateOptionsPresent: !!regenerateOptions,
      logic: {
        description: 'Receive briefs and context for content generation',
        sourceFile: 'controllers/contentGeneration.js',
        functionName: 'generateTwitterContent()'
      }
    });
    console.log('🎨 Content generation request received');
    
    if (!briefs || !Array.isArray(briefs) || briefs.length === 0) {
      global.contentGenerationDebugData.error = 'Briefs array is required';
      return res.status(400).json({ error: 'Briefs array is required' });
    }
    
    console.log('Generating content for', briefs.length, 'briefs');
    console.log('Business context:', businessContext ? 'provided' : 'not provided');
    console.log('Regenerate options:', regenerateOptions || 'none');
    
    // Prepare context
    const generationContext = {
      business_context: businessContext || {},
      regenerate_options: regenerateOptions || {},
      timestamp: new Date().toISOString()
    };
    global.contentGenerationDebugData.steps.push({
      step: 'context_prepared',
      timestamp: new Date().toISOString(),
      generationContext,
      logic: {
        description: 'Prepare context for content generation',
        sourceFile: 'controllers/contentGeneration.js',
        functionName: 'generateTwitterContent()'
      }
    });
    
    global.contentGenerationDebugData.steps.push({
      step: 'content_generation_started',
      timestamp: new Date().toISOString()
    });
    const generatedContent = await generateContentFromBriefs(
      briefs, 
      businessContext, 
      regenerateOptions
    );
    global.contentGenerationDebugData.steps.push({
      step: 'content_generated',
      timestamp: new Date().toISOString(),
      generatedContent: generatedContent
    });
    global.contentGenerationDebugData.summary = {
      totalGenerated: generatedContent.total_generated,
      singleTweets: generatedContent.generation_summary?.single_tweets,
      threads: generatedContent.generation_summary?.threads
    };
    console.log('✅ Content generation completed:', generatedContent.total_generated, 'pieces generated');
    
    // Create prompt
    const { content } = require('../prompts');
    const contentPrompt = content.contentGenerationPrompt(briefs, generationContext);
    global.contentGenerationDebugData.steps.push({
      step: 'prompt_created',
      timestamp: new Date().toISOString(),
      prompt: contentPrompt,
      logic: {
        description: 'Create content generation prompt',
        sourceFile: 'prompts/content/contentGeneration.js',
        functionName: 'contentGenerationPrompt()'
      }
    });
    // AI call
    const { callClaudeAPI } = require('../services/ai');
    const contentResponse = await callClaudeAPI(contentPrompt, false, null, 'Content Generation');
    global.contentGenerationDebugData.steps.push({
      step: 'ai_response',
      timestamp: new Date().toISOString(),
      response: contentResponse,
      logic: {
        description: 'Call Claude API for content generation',
        sourceFile: 'services/ai.js',
        functionName: 'callClaudeAPI()'
      }
    });
    // Parse response
    let parsedContent;
    try {
      const jsonMatch = contentResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
        global.contentGenerationDebugData.steps.push({
          step: 'parse_success',
          timestamp: new Date().toISOString(),
          parsedContent: parsedContent,
          logic: {
            description: 'Parse AI response for generated content',
            sourceFile: 'controllers/contentGeneration.js',
            functionName: 'generateTwitterContent()'
          }
        });
      } else {
        throw new Error('No JSON found in content generation response');
      }
    } catch (parseError) {
      global.contentGenerationDebugData.error = 'Failed to parse generated content';
      global.contentGenerationDebugData.steps.push({
        step: 'parse_error',
        timestamp: new Date().toISOString(),
        error: parseError.message,
        logic: {
          description: 'Error parsing AI response',
          sourceFile: 'controllers/contentGeneration.js',
          functionName: 'generateTwitterContent()'
        }
      });
      console.error('Failed to parse generated content:', parseError);
      return res.status(500).json({ error: 'Failed to parse generated content' });
    }
    // Validate and enhance
    const { validateAndEnhanceContent } = require('../services/contentGenerator');
    const validatedContent = validateAndEnhanceContent(parsedContent, briefs);
    global.contentGenerationDebugData.steps.push({
      step: 'content_validated',
      timestamp: new Date().toISOString(),
      validatedContent,
      logic: {
        description: 'Validate and enhance generated content',
        sourceFile: 'services/contentGenerator.js',
        functionName: 'validateAndEnhanceContent()'
      }
    });
    global.contentGenerationDebugData.summary = {
      totalGenerated: validatedContent.total_generated || validatedContent.generation_summary?.total_generated,
      singleTweets: validatedContent.generation_summary?.single_tweets,
      threads: validatedContent.generation_summary?.threads
    };
    res.json(validatedContent);
    
  } catch (error) {
    global.contentGenerationDebugData.error = error.message;
    global.contentGenerationDebugData.steps.push({
      step: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      logic: {
        description: 'Unhandled error during content generation',
        sourceFile: 'controllers/contentGeneration.js',
        functionName: 'generateTwitterContent()'
      }
    });
    console.error('Content generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

// Regenerate specific content piece
async function regenerateContent(req, res) {
  try {
    const { brief, businessContext, variationRequest } = req.body;
    console.log('🔄 Content regeneration request received');
    
    if (!brief) {
      return res.status(400).json({ error: 'Brief is required for regeneration' });
    }
    
    console.log('Regenerating content for brief:', brief.angle || 'Unknown angle');
    console.log('Variation request:', variationRequest || 'none');
    
    const regenerateOptions = {
      variation_request: variationRequest,
      regenerate_mode: true
    };
    
    const regeneratedContent = await generateContentFromBriefs(
      [brief], 
      businessContext, 
      regenerateOptions
    );
    
    console.log('✅ Content regeneration completed');
    
    res.json({
      success: true,
      generated_content: regeneratedContent.generated_content[0] || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Content regeneration error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateTwitterContent,
  regenerateContent
};