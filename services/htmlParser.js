// HTML Parser Service - Extract clean content and links from HTML

const { URL } = require('url');

/**
 * Extract clean, meaningful text from HTML by removing all non-content elements
 * @param {string} html - Raw HTML content
 * @returns {string} - Clean text content only
 */
function extractCleanText(html) {
  try {
    // Remove script and style elements completely
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove comments
    cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove navigation, header, footer elements (common noise)
    cleanHtml = cleanHtml.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');
    cleanHtml = cleanHtml.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '');
    cleanHtml = cleanHtml.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '');
    
    // Remove forms (usually just contact/newsletter forms)
    cleanHtml = cleanHtml.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '');
    
    // Remove SVG and other non-text elements
    cleanHtml = cleanHtml.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
    cleanHtml = cleanHtml.replace(/<canvas\b[^>]*>[\s\S]*?<\/canvas>/gi, '');
    
    // Extract text from remaining HTML tags
    let textContent = cleanHtml
      // Add spaces before block elements to separate content
      .replace(/<(div|p|h[1-6]|section|article|main|aside|li|td|th)\b[^>]*>/gi, ' ')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // If result is too short, something went wrong - return a portion of original
    if (textContent.length < 100 && html.length > 500) {
      console.log('⚠️ Clean text extraction resulted in very short content, using fallback');
      // Fallback: just remove scripts/styles and decode entities, keep some structure
      let fallbackText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
      
      return fallbackText.substring(0, 8000); // Reasonable limit
    }
    
    console.log('✅ Clean text extraction successful:', {
      originalLength: html.length,
      cleanLength: textContent.length,
      compressionRatio: Math.round((1 - textContent.length / html.length) * 100) + '%'
    });
    
    return textContent;
    
  } catch (error) {
    console.error('❌ Clean text extraction failed:', error.message);
    // Emergency fallback: just remove obvious noise
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);
  }
}

/**
 * Extract all links from HTML and convert to absolute URLs
 * @param {string} html - Raw HTML content
 * @param {string} baseUrl - Base URL for converting relative links
 * @returns {Array} - Array of {text, url, type} objects
 */
function extractAllLinks(html, baseUrl) {
  try {
    const links = [];
    const baseUrlObj = new URL(baseUrl);
    
    // Match all anchor tags with href attributes
    const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const linkText = match[2]
        .replace(/<[^>]+>/g, '') // Remove any HTML tags in link text
        .replace(/\s+/g, ' ')
        .trim();
      
      // Skip empty links or javascript links
      if (!href || href.startsWith('javascript:') || href === '#' || !linkText) {
        continue;
      }
      
      try {
        // Convert to absolute URL
        const absoluteUrl = new URL(href, baseUrlObj).href;
        
        // Filter out fragment URLs (anchor links to sections on same page)
        if (absoluteUrl.includes('#')) {
          continue;
        }
        
        // Only include links to the same domain or its subdomains
        const linkDomain = new URL(absoluteUrl).hostname;
        const baseDomain = baseUrlObj.hostname;
        
        if (linkDomain === baseDomain || linkDomain.endsWith('.' + baseDomain)) {
          links.push({
            text: linkText.substring(0, 100), // Limit text length
            url: absoluteUrl,
            type: categorizeLink(linkText, absoluteUrl)
          });
        }
      } catch (urlError) {
        // Skip invalid URLs
        continue;
      }
    }
    
    // Remove duplicates based on URL
    const uniqueLinks = links.filter((link, index, self) => 
      index === self.findIndex(l => l.url === link.url)
    );
    
    console.log('🔗 Link extraction results:', {
      totalLinksFound: links.length,
      uniqueLinks: uniqueLinks.length,
      baseUrl: baseUrl
    });
    
    return uniqueLinks;
    
  } catch (error) {
    console.error('❌ Link extraction failed:', error.message);
    return [];
  }
}

/**
 * Basic categorization of links to help AI make better decisions
 * @param {string} linkText - The text content of the link
 * @param {string} url - The URL of the link
 * @returns {string} - Category type
 */
function categorizeLink(linkText, url) {
  const text = linkText.toLowerCase();
  const urlLower = url.toLowerCase();
  
  // High priority business info pages
  if (text.includes('about') || urlLower.includes('/about')) return 'about';
  if (text.includes('service') || urlLower.includes('/service')) return 'services';
  if (text.includes('product') || urlLower.includes('/product')) return 'products';
  if (text.includes('pricing') || urlLower.includes('/pricing')) return 'pricing';
  if (text.includes('team') || urlLower.includes('/team')) return 'team';
  if (text.includes('contact') || urlLower.includes('/contact')) return 'contact';
  if (text.includes('solution') || urlLower.includes('/solution')) return 'solutions';
  if (text.includes('feature') || urlLower.includes('/feature')) return 'features';
  
  // Medium priority pages
  if (text.includes('case') || text.includes('customer') || urlLower.includes('/case')) return 'case-studies';
  if (text.includes('blog') || urlLower.includes('/blog')) return 'blog';
  if (text.includes('news') || urlLower.includes('/news')) return 'news';
  if (text.includes('career') || urlLower.includes('/career')) return 'careers';
  
  // Low priority / noise
  if (text.includes('privacy') || text.includes('terms') || text.includes('cookie')) return 'legal';
  if (text.includes('login') || text.includes('sign') || text.includes('register')) return 'auth';
  if (text.includes('download') || urlLower.includes('/download')) return 'downloads';
  
  // Default
  return 'other';
}

/**
 * Filter out obviously irrelevant links to reduce noise for AI
 * @param {Array} links - Array of link objects
 * @returns {Array} - Filtered array of relevant links
 */
function filterRelevantLinks(links) {
  return links.filter(link => {
    const type = link.type;
    const text = link.text.toLowerCase();
    const url = link.url.toLowerCase();
    
    // Always exclude these
    if (type === 'legal' || type === 'auth') return false;
    if (text.includes('cookie') || text.includes('privacy') || text.includes('terms')) return false;
    if (text.includes('logout') || text.includes('dashboard')) return false;
    if (url.includes('admin') || url.includes('wp-') || url.includes('?')) return false;
    
    // Exclude very short link text (likely navigation noise)
    if (link.text.length < 3) return false;
    
    // Exclude file downloads
    if (url.includes('.pdf') || url.includes('.zip') || url.includes('.doc')) return false;
    
    return true;
  });
}

module.exports = {
  extractCleanText,
  extractAllLinks,
  filterRelevantLinks
};