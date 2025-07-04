// Business intelligence generation controller
const { callClaudeAPI } = require('../services/ai');
const { crawlWebsite } = require('../services/websiteCrawler');
const { performCompetitorResearch } = require('./competitorResearch');
const { intelligence } = require('../prompts');
const systemLogger = require('../services/systemLogger');

// ENHANCED: Generate foundational intelligence with competitor research
async function generateIntelligence(req, res) {
  const masterId = systemLogger.startOperation('Business Profile');
  try {
    const onboardingData = req.body;
    systemLogger.logStep(masterId, {
      step: 'Form submitted',
      submittedData: onboardingData,
      storage: {
        onboardingData: 'Raw form data as received in req.body',
        combinedData: 'Copy of onboardingData, later enriched with crawl results if needed'
      },
      formLogic: `// Category calculation logic from frontend\nconst launchDate = userInput.launchDate;\nconst websiteUrl = userInput.websiteUrl;\nconst today = new Date().toISOString().split('T')[0];\nconst isPreLaunch = launchDate > today;\nconst hasWebsite = websiteUrl && websiteUrl.trim() !== '';\nlet category = '';\nif (isPreLaunch && !hasWebsite) {\n    category = 'Pre-launch + No website';\n} else if (isPreLaunch && hasWebsite) {\n    category = 'Pre-launch + Has website';\n} else if (!isPreLaunch && !hasWebsite) {\n    category = 'Post-launch + No website';\n} else {\n    category = 'Post-launch + Has website';\n}`,
      usage: 'This information is used to prepare the business analysis prompt and, if a website URL is provided, to crawl the website for additional data.'
    });

    // Crawl website if needed
    let combinedData = { ...onboardingData };
    if (onboardingData.crawledData) {
      systemLogger.logStep(masterId, {
        step: 'Using provided crawled website data',
        crawledData: onboardingData.crawledData,
        logic: 'If crawledData is present in the form submission, use it directly instead of crawling again.',
        next: 'Proceed to business analysis prompt.'
      });
      combinedData.websiteCrawlResults = onboardingData.crawledData;
    } else if (onboardingData.websiteUrl && onboardingData.websiteUrl.trim()) {
      systemLogger.logStep(masterId, {
        step: 'Website crawling started',
        websiteUrl: onboardingData.websiteUrl,
        logic: 'If websiteUrl is provided and no crawledData, crawl the website to extract business information.',
        next: 'Store crawled data and proceed to business analysis prompt.'
      });
      const crawledData = await crawlWebsite(onboardingData.websiteUrl, masterId);
      systemLogger.logStep(masterId, {
        step: 'Website crawling complete',
        crawledData,
        logic: 'Crawled homepage and additional pages, extracted content, applied link selection and AI analysis.',
        next: 'Store crawled data and proceed to business analysis prompt.'
      });
      combinedData.websiteCrawlResults = crawledData;
    } else {
      systemLogger.logStep(masterId, {
        step: 'No website URL provided',
        logic: 'No crawling performed because no websiteUrl was provided.',
        next: 'Proceed to business analysis prompt.'
      });
    }

    // STEP 1: Generate initial foundational intelligence + competitor queries
    const businessPrompt = intelligence.businessAnalysisPrompt(combinedData);
    systemLogger.logStep(masterId, {
      step: 'Business analysis prompt prepared',
      prompt: businessPrompt,
      logic: 'Prompt constructed using combinedData (form + crawl results).',
      next: 'Send prompt to AI.'
    });
    const initialIntelligence = await callClaudeAPI(businessPrompt, false, masterId, 'AI: Business Analysis');
    systemLogger.logStep(masterId, {
      step: 'AI: Business Analysis result',
      aiResponse: initialIntelligence,
      logic: 'AI response received for business analysis prompt.',
      next: 'Parse AI response and extract foundational intelligence.'
    });

    // Parse initial intelligence
    let foundationalIntelligence;
    try {
      const jsonMatch = initialIntelligence.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        foundationalIntelligence = JSON.parse(jsonMatch[0]);
        systemLogger.logStep(masterId, {
          step: 'Parsed foundational intelligence',
          foundationalIntelligence,
          logic: 'Extracted JSON from AI response.',
          next: 'Proceed to competitor research.'
        });
      } else {
        throw new Error('No JSON found in initial intelligence response');
      }
    } catch (parseError) {
      systemLogger.logStep(masterId, {
        step: 'JSON parse error in initial intelligence',
        error: parseError.message,
        logic: 'Failed to extract JSON from AI response.',
        next: 'Abort and return error.'
      });
      systemLogger.endOperation(masterId, {
        request: req.body,
        response: null,
        background: null,
        tokens: null,
        cost: null,
        error: parseError.message
      });
      return res.status(500).json({ error: 'Failed to parse initial intelligence' });
    }

    // STEP 2: Competitor research (with error handling)
    let competitorIntelligence = null;
    try {
      if (foundationalIntelligence.competitor_discovery_queries && 
          foundationalIntelligence.competitor_discovery_queries.length >= 2) {
        systemLogger.logStep(masterId, {
          step: 'Competitor research started',
          queries: foundationalIntelligence.competitor_discovery_queries,
          logic: 'If competitor_discovery_queries are present, run competitor research.',
          next: 'Run performCompetitorResearch.'
        });
        competitorIntelligence = await performCompetitorResearch(
          foundationalIntelligence.competitor_discovery_queries,
          foundationalIntelligence,
          masterId
        );
        systemLogger.logStep(masterId, {
          step: 'Competitor research completed',
          competitorIntelligence,
          logic: 'Results from competitor research.',
          next: 'Combine with foundational intelligence.'
        });
      } else {
        systemLogger.logStep(masterId, {
          step: 'No competitor queries found',
          logic: 'Skipping competitor research because no queries were found.',
          next: 'Combine foundational intelligence and finish.'
        });
      }
    } catch (competitorError) {
      systemLogger.logStep(masterId, {
        step: 'Competitor research failed',
        error: competitorError.message,
        logic: 'Error during competitor research.',
        next: 'Continue without competitor data.'
      });
    }

    // STEP 3: Combine all intelligence
    const enhancedIntelligence = {
      ...foundationalIntelligence,
      competitor_intelligence: competitorIntelligence
    };
    systemLogger.logStep(masterId, {
      step: 'Final enhanced intelligence ready',
      enhancedIntelligence,
      logic: 'Combined foundational and competitor intelligence.',
      next: 'Return to user.'
    });
    systemLogger.endOperation(masterId, {
      request: req.body,
      response: enhancedIntelligence,
      background: null,
      tokens: null,
      cost: null
    });
    res.json(enhancedIntelligence);
  } catch (error) {
    systemLogger.logStep(masterId, {
      step: 'Error generating intelligence',
      error: error.message,
      logic: 'Unhandled error in business profile journey.',
      next: 'Abort and return error.'
    });
    systemLogger.endOperation(masterId, {
      request: req.body,
      response: null,
      background: null,
      tokens: null,
      cost: null,
      error: error.message
    });
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateIntelligence
};