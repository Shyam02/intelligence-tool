// Central prompts export file
// Import all prompts from their respective files
// File path: /prompts/index.js

const { businessAnalysisPrompt } = require('./intelligence/businessAnalysis');
const { mainCrawlPrompt, fallbackCrawlPrompt, multiPageAnalysisPrompt } = require('./intelligence/websiteCrawling');
const { linkSelectionPrompt } = require('./intelligence/linkSelection');
const { competitorAnalysisPrompt } = require('./intelligence/competitorAnalysis');
const { contentBriefsPrompt } = require('./content/contentBriefs');
const { contentGenerationPrompt } = require('./content/contentGeneration');
const { generateRedditSearchQueries } = require('./reddit/queryGeneration');

// Export all prompts for easy importing
module.exports = {
  // Intelligence prompts
  intelligence: {
    businessAnalysisPrompt,
    mainCrawlPrompt,
    fallbackCrawlPrompt,
    linkSelectionPrompt,
    multiPageAnalysisPrompt,
    competitorAnalysisPrompt
  },
  
  // Content prompts
  content: {
    contentBriefsPrompt,
    contentGenerationPrompt
  },
  
  // Reddit prompts
  reddit: {
    generateRedditSearchQueries
  }
};