// Content briefs controller
const { callClaudeAPI } = require('../services/ai');
const { content } = require('../prompts');

// Generate content briefs from search results
async function generateContentBriefs(req, res) {
  try {
    const { articles, businessContext } = req.body;
    console.log('�� Content brief generation request received');
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'Articles array is required' });
    }
    
    // Use extracted prompt instead of inline
    const briefingPrompt = content.contentBriefsPrompt(articles, businessContext);

    const briefsResponse = await callClaudeAPI(briefingPrompt, false, null, 'AI: Content Briefs');
    
    // Parse the response
    let briefs;
    try {
      const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        briefs = JSON.parse(jsonMatch[0]);
        console.log(`✅ Generated briefs: ${briefs.viable_count} viable articles, ${briefs.total_briefs} total briefs`);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse briefs:', parseError);
      return res.status(500).json({ error: 'Failed to parse content briefs' });
    }
    
    res.json(briefs);
    
  } catch (error) {
    console.error('Content brief generation error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateContentBriefs
};