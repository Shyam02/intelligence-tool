// Central prompts export file
// Import all prompts from their respective files

const { businessAnalysisPrompt } = require('./intelligence/businessAnalysis');
const { mainCrawlPrompt, fallbackCrawlPrompt } = require('./intelligence/websiteCrawling');
const { linkSelectionPrompt } = require('./intelligence/linkSelection');
const { twitterBriefsPrompt } = require('./content/twitterBriefs');

// Export all prompts for easy importing
module.exports = {
  // Intelligence prompts
  intelligence: {
    businessAnalysisPrompt,
    mainCrawlPrompt,
    fallbackCrawlPrompt,
    linkSelectionPrompt
  },
  
  // Content prompts
  content: {
    twitterBriefsPrompt
  }
};