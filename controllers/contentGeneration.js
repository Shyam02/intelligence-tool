// Content generation controller
const { generateContentFromBriefs } = require('../services/contentGenerator');

// Generate final content from strategic briefs
async function generateTwitterContent(req, res) {
  try {
    const { strategicBriefs, businessContext, regenerateOptions } = req.body;
    
    // Initialize debug data
    global.contentGenerationDebugData = {
      timestamp: new Date().toISOString(),
      input: { strategicBriefs, businessContext, regenerateOptions },
      steps: [],
      error: null,
      summary: null
    };
    
    global.contentGenerationDebugData.steps.push({
      step: 'input_received',
      timestamp: new Date().toISOString(),
      strategicBriefsCount: strategicBriefs ? strategicBriefs.length : 0,
      businessContextPresent: !!businessContext,
      regenerateOptionsPresent: !!regenerateOptions,
      logic: {
        description: 'Receive strategic briefs and context for content generation',
        sourceFile: 'controllers/contentGeneration.js',
        functionName: 'generateTwitterContent()'
      }
    });
    
    console.log('🎨 Content generation request received');
    
    if (!strategicBriefs || !Array.isArray(strategicBriefs) || strategicBriefs.length === 0) {
      global.contentGenerationDebugData.error = 'Strategic briefs array is required';
      return res.status(400).json({ error: 'Strategic briefs array is required' });
    }
    
    console.log('Generating content for', strategicBriefs.length, 'strategic briefs');
    console.log('Business context:', businessContext ? 'provided' : 'not provided');
    console.log('Regenerate options:', regenerateOptions || 'none');
    
    // Call the content generation service (ONLY ONCE!)
    const generatedContent = await generateContentFromBriefs(
      strategicBriefs, 
      businessContext, 
      regenerateOptions
    );
    
    global.contentGenerationDebugData.steps.push({
      step: 'content_generated',
      timestamp: new Date().toISOString(),
      generatedContent: generatedContent
    });
    
    global.contentGenerationDebugData.summary = {
      totalGenerated: generatedContent.total_generated || generatedContent.generation_summary?.total_generated,
      singleTweets: generatedContent.generation_summary?.single_tweets,
      threads: generatedContent.generation_summary?.threads
    };
    
    console.log('✅ Content generation completed:', generatedContent.generation_summary?.total_generated || 0, 'pieces generated');
    
    res.json(generatedContent);
    
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
    
    console.log('Regenerating content for brief:', brief.content_angle || 'Unknown angle');
    console.log('Variation request:', variationRequest || 'none');
    
    const regenerateOptions = {
      variation_request: variationRequest,
      regenerate_mode: true
    };
    
    // FIX: Actually call the generation service
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