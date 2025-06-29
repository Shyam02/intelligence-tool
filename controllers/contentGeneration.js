// Content generation controller
const { generateContentFromBriefs } = require('../services/contentGenerator');

// Generate final content from Twitter briefs
async function generateTwitterContent(req, res) {
  try {
    const { briefs, businessContext, regenerateOptions } = req.body;
    console.log('🎨 Content generation request received');
    
    if (!briefs || !Array.isArray(briefs) || briefs.length === 0) {
      return res.status(400).json({ error: 'Briefs array is required' });
    }
    
    console.log('Generating content for', briefs.length, 'briefs');
    console.log('Business context:', businessContext ? 'provided' : 'not provided');
    console.log('Regenerate options:', regenerateOptions || 'none');
    
    const generatedContent = await generateContentFromBriefs(
      briefs, 
      businessContext, 
      regenerateOptions
    );
    
    console.log('✅ Content generation completed:', generatedContent.total_generated, 'pieces generated');
    
    res.json(generatedContent);
    
  } catch (error) {
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