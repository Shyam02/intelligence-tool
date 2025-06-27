// Business intelligence generation controller
const { callClaudeAPI } = require('../services/ai');
const { crawlWebsite } = require('../services/websiteCrawler');
const { performCompetitorResearch } = require('./competitorResearch');
const { intelligence } = require('../prompts');

// ENHANCED: Generate foundational intelligence with competitor research
async function generateIntelligence(req, res) {
  try {
    const onboardingData = req.body;
    
    // Check if we have crawled website data
    let combinedData = { ...onboardingData };
    if (onboardingData.crawledData) {
      console.log('🌐 Using crawled website data in intelligence generation');
      combinedData.websiteCrawlResults = onboardingData.crawledData;
    }
    
    console.log('🧠 Starting enhanced intelligence generation with competitor research...');
    
    // STEP 1: Generate initial foundational intelligence + competitor queries
    const businessPrompt = intelligence.businessAnalysisPrompt(combinedData);
    const initialIntelligence = await callClaudeAPI(businessPrompt);
    
    // Parse initial intelligence
    let foundationalIntelligence;
    try {
      const jsonMatch = initialIntelligence.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foundationalIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in initial intelligence response');
      }
    } catch (parseError) {
      console.error('JSON Parse Error in initial intelligence:', parseError);
      return res.status(500).json({ error: 'Failed to parse initial intelligence' });
    }
    
    console.log('✅ Initial intelligence generated, starting competitor research...');
    
    // STEP 2: Competitor research (with error handling)
    let competitorIntelligence = null;
    try {
      if (foundationalIntelligence.competitor_discovery_queries && 
          foundationalIntelligence.competitor_discovery_queries.length >= 2) {
        
        competitorIntelligence = await performCompetitorResearch(
          foundationalIntelligence.competitor_discovery_queries,
          foundationalIntelligence
        );
        
        console.log('✅ Competitor research completed successfully');
      } else {
        console.log('⚠️ No competitor queries found, skipping competitor research');
      }
    } catch (competitorError) {
      console.error('⚠️ Competitor research failed, continuing without competitor data:', competitorError.message);
      // Continue without competitor data - don't fail the entire request
    }
    
    // STEP 3: Combine all intelligence
    const enhancedIntelligence = {
      ...foundationalIntelligence,
      competitor_intelligence: competitorIntelligence
    };
    
    console.log('✅ Enhanced intelligence generation completed');
    res.json(enhancedIntelligence);
    
  } catch (error) {
    console.error('Error generating intelligence:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateIntelligence
};