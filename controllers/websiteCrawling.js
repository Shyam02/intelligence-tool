// Website crawling controller
const { crawlWebsite } = require('../services/websiteCrawler');
// systemLogger removed for simplified approach

// NEW FUNCTION: Crawl website and extract business information
async function crawlWebsiteController(req, res) {
  // Debug logging removed for simplified approach
  try {
    const { websiteUrl } = req.body;
    
    if (!websiteUrl || !websiteUrl.trim()) {
      return res.status(400).json({ error: 'Website URL is required' });
    }
    
    console.log('🌐 Website crawling request for:', websiteUrl);
    
    const crawledData = await crawlWebsite(websiteUrl);
    
    console.log('✅ Website crawling completed for:', crawledData.company_name || 'Unknown');
    
    // Get debug data from global storage
    const debugData = global.crawlDebugData || null;
    
    res.json({
      success: true,
      website_url: websiteUrl,
      crawled_data: crawledData,
      debug_data: debugData,
      timestamp: new Date().toISOString()
    });
    
    // Debug logging removed for simplified approach
  } catch (error) {
    console.error('Website crawling controller error:', error);
    // Error logging removed for simplified approach
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