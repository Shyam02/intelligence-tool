// services/articleContentFetcher.js
// Article content fetching service using existing website crawler infrastructure

const { fetchWebsiteHTML } = require('./websiteCrawler');
const { extractCleanText } = require('./htmlParser');

/**
 * Fetch full content for selected articles using existing crawler infrastructure
 * @param {Array} selectedArticles - Array of article objects from search results
 * @returns {Array} Articles with full content added
 */
async function fetchSelectedArticlesContent(selectedArticles) {
  console.log(`📖 Starting content fetch for ${selectedArticles.length} selected articles...`);
  
  const enrichedArticles = [];
  
  for (let i = 0; i < selectedArticles.length; i++) {
    const article = selectedArticles[i];
    console.log(`📄 Fetching content ${i + 1}/${selectedArticles.length}: ${article.title}`);
    
    try {
      // Use existing crawler infrastructure to fetch and clean content
      const rawHtml = await fetchWebsiteHTML(article.url);
      const cleanContent = extractCleanText(rawHtml);
      
      // Add full content to article while preserving all existing data
      const enrichedArticle = {
        ...article, // Keep all existing fields (id, title, url, preview, domain, etc.)
        fullContent: cleanContent,
        contentFetched: true,
        contentLength: cleanContent ? cleanContent.length : 0,
        fetchTimestamp: new Date().toISOString()
      };
      
      enrichedArticles.push(enrichedArticle);
      
      console.log(`✅ Content fetched successfully: ${enrichedArticle.contentLength} characters`);
      
    } catch (error) {
      console.error(`❌ Failed to fetch content for article: ${article.title}`, error.message);
      
      // On error, keep original article with error metadata
      const failedArticle = {
        ...article,
        fullContent: null,
        contentFetched: false,
        contentLength: 0,
        fetchError: error.message,
        fetchTimestamp: new Date().toISOString()
      };
      
      enrichedArticles.push(failedArticle);
    }
    
    // Add small delay to be respectful to servers
    if (i < selectedArticles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  const successCount = enrichedArticles.filter(a => a.contentFetched).length;
  const failureCount = enrichedArticles.length - successCount;
  
  console.log(`📊 Article content fetch complete: ${successCount} success, ${failureCount} failed`);
  
  return enrichedArticles;
}

/**
 * Fetch content for a single article (used for testing or individual fetching)
 * @param {Object} article - Single article object
 * @returns {Object} Article with full content added
 */
async function fetchSingleArticleContent(article) {
  console.log(`📖 Fetching content for: ${article.title}`);
  
  try {
    const rawHtml = await fetchWebsiteHTML(article.url);
    const cleanContent = extractCleanText(rawHtml);
    
    return {
      ...article,
      fullContent: cleanContent,
      contentFetched: true,
      contentLength: cleanContent ? cleanContent.length : 0,
      fetchTimestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Failed to fetch content for: ${article.title}`, error.message);
    
    return {
      ...article,
      fullContent: null,
      contentFetched: false,
      contentLength: 0,
      fetchError: error.message,
      fetchTimestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  fetchSelectedArticlesContent,
  fetchSingleArticleContent
};