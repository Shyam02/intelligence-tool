// Website crawling controller
const { crawlWebsite } = require('../services/websiteCrawler');
const systemLogger = require('../services/systemLogger');

// NEW FUNCTION: Crawl website and extract business information
async function crawlWebsiteController(req, res) {
  const debugId = systemLogger.startOperation('Website Crawling');
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl || !websiteUrl.trim()) {
      return res.status(400).json({ error: 'Website URL is required' });
    }
    
    console.log('🌐 Website crawling request for:', websiteUrl);
    
    const crawledData = await crawlWebsite(websiteUrl);
    
    console.log('✅ Website crawling completed for:', crawledData.company_name || 'Unknown');
    
    res.json({
      success: true,
      website_url: websiteUrl,
      crawled_data: crawledData,
      timestamp: new Date().toISOString()
    });
    
    systemLogger.endOperation(debugId, {
      request: req.body,
      response: { crawledData },
      background: null,
      tokens: null,
      cost: null
    });
  } catch (error) {
    console.error('Website crawling controller error:', error);
    systemLogger.endOperation(debugId, {
      request: req.body,
      response: null,
      background: null,
      tokens: null,
      cost: null,
      error: error.message
    });
    res.status(500).json({ 
      error: 'Website crawling failed: ' + error.message,
      website_url: req.body.websiteUrl || 'unknown',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  crawlWebsiteController
};