// HTML Parser Service - Minimal filtering, let AI decide what's valuable
// File path: /services/htmlParser.js

const { URL } = require('url');

/**
 * Extract clean, meaningful text from HTML by removing ONLY non-business elements
 * ENHANCED: Preserves headers, footers, navigation, forms - ALL business content
 * @param {string} html - Raw HTML content
 * @returns {string} - Clean text content with ALL business information
 */
function extractCleanText(html) {
  try {
    // Remove ONLY script and style elements (non-business content)
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove comments
    cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, '');
    
    // REMOVED: No longer removing nav, header, footer, forms - they contain business info!
    // ENHANCEMENT: Keep ALL content that might contain business intelligence
    
    // Remove SVG and other non-text elements (keep alt text though)
    cleanHtml = cleanHtml.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
    cleanHtml = cleanHtml.replace(/<canvas\b[^>]*>[\s\S]*?<\/canvas>/gi, '');
    
    // Extract alt text from images before removing them
    const altTextMatches = cleanHtml.match(/alt\s*=\s*["'][^"']*["']/gi);
    let altTexts = '';
    if (altTextMatches) {
      altTexts = altTextMatches.map(alt => 
        alt.replace(/alt\s*=\s*["']/, '').replace(/["']$/, '')
      ).join(' ');
    }
    
    // Extract placeholder text from inputs
    const placeholderMatches = cleanHtml.match(/placeholder\s*=\s*["'][^"']*["']/gi);
    let placeholderTexts = '';
    if (placeholderMatches) {
      placeholderTexts = placeholderMatches.map(placeholder => 
        placeholder.replace(/placeholder\s*=\s*["']/, '').replace(/["']$/, '')
      ).join(' ');
    }
    
    // Extract text from remaining HTML tags
    let textContent = cleanHtml
      // Add spaces before block elements to separate content
      .replace(/<(div|p|h[1-6]|section|article|main|aside|li|td|th|header|footer|nav|form)\b[^>]*>/gi, ' ')
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
    
    // Add extracted alt texts and placeholders
    if (altTexts) textContent += ' ' + altTexts;
    if (placeholderTexts) textContent += ' ' + placeholderTexts;
    
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
    
    console.log('✅ Enhanced clean text extraction successful:', {
      originalLength: html.length,
      cleanLength: textContent.length,
      compressionRatio: Math.round((1 - textContent.length / html.length) * 100) + '%',
      altTextsFound: altTextMatches ? altTextMatches.length : 0,
      placeholdersFound: placeholderMatches ? placeholderMatches.length : 0
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
 * Extract ALL links from HTML including external domains
 * MINIMAL FILTERING: Only exclude invalid links and fragments, let AI decide everything else
 * @param {string} html - Raw HTML content
 * @param {string} baseUrl - Base URL for converting relative links
 * @returns {Array} - Array of {text, url, type} objects from ALL domains
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
      
      // MINIMAL FILTERING: Only skip truly invalid links
      if (!href || href.startsWith('javascript:') || href === '#' || !linkText) {
        continue;
      }
      
      try {
        // Convert to absolute URL
        const absoluteUrl = new URL(href, baseUrlObj).href;
        
        // MINIMAL FILTERING: Only exclude fragment URLs (same page sections)
        if (absoluteUrl.includes('#')) {
          continue;
        }
        
        // Include ALL domains - no restrictions whatsoever
        links.push({
          text: linkText.substring(0, 100), // Limit text length
          url: absoluteUrl,
          type: categorizeLink(linkText, absoluteUrl),
          domain: new URL(absoluteUrl).hostname,
          isExternal: new URL(absoluteUrl).hostname !== baseUrlObj.hostname
        });
        
      } catch (urlError) {
        // Skip invalid URLs
        continue;
      }
    }
    
    // Remove duplicates based on URL
    const uniqueLinks = links.filter((link, index, self) => 
      index === self.findIndex(l => l.url === link.url)
    );
    
    // ENHANCED LOGGING: Show all found links
    console.log('🔗 Enhanced link extraction results:', {
      totalLinksFound: links.length,
      uniqueLinks: uniqueLinks.length,
      externalDomains: uniqueLinks.filter(l => l.isExternal).length,
      internalPages: uniqueLinks.filter(l => !l.isExternal).length,
      baseUrl: baseUrl
    });
    
    // LOG ALL FOUND LINKS
    console.log('📋 ALL LINKS FOUND:');
    uniqueLinks.forEach((link, index) => {
      console.log(`  ${index + 1}. "${link.text}" → ${link.url} [${link.type}] ${link.isExternal ? '(EXTERNAL)' : '(INTERNAL)'}`);
    });
    
    return uniqueLinks;
    
  } catch (error) {
    console.error('❌ Link extraction failed:', error.message);
    return [];
  }
}

/**
 * Basic categorization of links for AI information (no filtering decisions)
 * @param {string} linkText - The text content of the link
 * @param {string} url - The URL of the link
 * @returns {string} - Category type (for AI information only)
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
  
  // External platform links
  if (urlLower.includes('app.apple.com') || urlLower.includes('play.google.com')) return 'app-store';
  if (urlLower.includes('twitter.com') || urlLower.includes('linkedin.com') || 
      urlLower.includes('facebook.com') || urlLower.includes('instagram.com')) return 'social-media';
  if (urlLower.includes('medium.com') || urlLower.includes('substack.com')) return 'blog-external';
  
  // Medium priority pages
  if (text.includes('case') || text.includes('customer') || urlLower.includes('/case')) return 'case-studies';
  if (text.includes('blog') || urlLower.includes('/blog')) return 'blog';
  if (text.includes('news') || urlLower.includes('/news')) return 'news';
  if (text.includes('career') || urlLower.includes('/career')) return 'careers';
  if (text.includes('help') || text.includes('support') || urlLower.includes('/help')) return 'support';
  if (text.includes('docs') || text.includes('documentation') || urlLower.includes('/docs')) return 'documentation';
  
  // Legal and auth pages (but AI will decide if they're valuable)
  if (text.includes('privacy') || text.includes('terms') || text.includes('cookie')) return 'legal';
  if (text.includes('login') || text.includes('sign in') || text.includes('register')) return 'auth';
  
  // Default
  return 'other';
}

/**
 * NO FILTERING - Pass all links to AI for decision making
 * AI will decide what's valuable, not hard-coded logic
 * @param {Array} links - Array of link objects
 * @returns {Array} - All links (no filtering)
 */
function filterRelevantLinks(links) {
  // NO FILTERING - Let AI decide what's valuable
  console.log('📊 LINK FILTERING RESULTS:');
  console.log(`  ✅ PASSED TO AI: ${links.length} links (NO HARD-CODED FILTERING)`);
  links.forEach((link, index) => {
    console.log(`    ${index + 1}. "${link.text}" → ${link.url} [${link.type}] ${link.isExternal ? '(EXTERNAL)' : '(INTERNAL)'}`);
  });
  
  console.log('🤖 AI will decide which links are valuable for business intelligence');
  
  return links; // Return ALL links, let AI decide
}

module.exports = {
  extractCleanText,
  extractAllLinks,
  filterRelevantLinks
};