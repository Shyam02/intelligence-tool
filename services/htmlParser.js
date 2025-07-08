// Universal Content-Agnostic HTML Parser
// Principles: Use linguistic patterns, not hard-coded content assumptions

const { URL } = require('url');

/**
 * MAIN FUNCTION: Extract clean, meaningful text from HTML
 * Approach: Universal linguistic analysis, not content-specific patterns
 */
function extractCleanText(html, options = {}) {
  try {
    console.log('🧹 Starting universal content-agnostic extraction...');
    
    // Phase 1: Structure-aware preprocessing
    console.log('Phase 1: Structure-aware preprocessing...');
    const preprocessed = structureAwarePreprocessing(html, options);
    
    // Phase 2: Semantic HTML analysis
    console.log('Phase 2: Semantic HTML analysis...');
    const structured = semanticHtmlAnalysis(preprocessed);
    
    // Phase 3: Statistical content filtering
    console.log('Phase 3: Statistical content filtering...');
    const filtered = statisticalContentFiltering(structured);
    
    // Phase 4: Linguistic reconstruction
    console.log('Phase 4: Linguistic reconstruction...');
    const reconstructed = linguisticReconstruction(filtered);
    
    // Phase 5: Universal optimization
    console.log('Phase 5: Universal optimization...');
    const optimized = universalOptimization(reconstructed);
    
    console.log('✅ Universal content extraction completed:', {
      originalLength: html.length,
      finalLength: optimized.length,
      compressionRatio: Math.round((1 - optimized.length / html.length) * 100) + '%'
    });
    
    return optimized;
    
  } catch (error) {
    console.error('❌ Universal content extraction failed:', error.message);
    console.error('Error stack:', error.stack);
    return universalFallback(html);
  }
}

/**
 * PHASE 1: Structure-aware preprocessing
 * Focus: Remove non-content elements using HTML semantics, not content assumptions
 */
function structureAwarePreprocessing(html, options = {}) {
  // Remove elements that are universally non-content
  let processed = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<canvas\b[^>]*>[\s\S]*?<\/canvas>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '');
  
  // Domain-based footer/navigation filtering for same-domain pages
  if (options.skipFooterNav) {
    processed = processed
      .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');
  }
  
  // Smart entity handling - preserve linguistic structure
  processed = preserveLinguisticStructure(processed);
  
  return processed;
}

/**
 * PHASE 2: Semantic HTML analysis
 * Focus: Use HTML semantics to understand content hierarchy
 */
function semanticHtmlAnalysis(html) {
  // Map HTML semantics to universal text markers
  const semanticRoles = {
    // Content hierarchy markers
    'h1|h2|h3|h4|h5|h6': '\n\n▲ HEADING ▲\n',
    'section|article|aside|main': '\n\n▼ SECTION ▼\n',
    'nav|header|footer': '\n\n◆ NAVIGATION ◆\n',
    
    // Content structure preservers
    'p': '\n\n',
    'div': '\n',
    'li': '\n• ',
    'tr': '\n',
    'td|th': ' | ',
    'br': '\n',
    
    // Emphasis preservers (universal across languages)
    'strong|b': ' **',
    'em|i': ' *',
    'code|pre': ' `',
  };
  
  let processed = html;
  
  // Apply semantic mapping
  Object.entries(semanticRoles).forEach(([elements, marker]) => {
    const pattern = new RegExp(`<(${elements})\\b[^>]*>`, 'gi');
    processed = processed.replace(pattern, marker);
  });
  
  // Remove remaining tags while preserving content
  processed = processed.replace(/<[^>]+>/g, ' ');
  
  return processed;
}

/**
 * PHASE 3: Statistical content filtering
 * Focus: Use information theory and statistical analysis, not keyword matching
 */
function statisticalContentFiltering(text) {
  try {
    const lines = text.split('\n');
    const contentLines = [];
    
    // Analyze the entire document first to establish baselines
    const documentStats = analyzeDocumentStatistics(lines);
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length < 2) continue;
      
      try {
        const informationScore = calculateInformationScore(cleanLine, documentStats);
        
        if (informationScore > documentStats.informationThreshold) {
          contentLines.push(cleanLine);
        }
      } catch (error) {
        console.warn('Error scoring line:', cleanLine.substring(0, 30), error.message);
        contentLines.push(cleanLine); // Include if scoring fails
      }
    }
    
    console.log(`📊 Statistical filtering: kept ${contentLines.length}/${lines.length} lines based on information content`);
    return contentLines.join('\n');
    
  } catch (error) {
    console.error('Error in statisticalContentFiltering:', error.message);
    return text;
  }
}

/**
 * Analyze document statistics to establish content baselines
 * Uses information theory principles, not content assumptions
 */
function analyzeDocumentStatistics(lines) {
  const cleanLines = lines.filter(line => line.trim().length > 0);
  
  // Statistical analysis
  const wordCounts = cleanLines.map(line => line.split(/\s+/).length);
  const charCounts = cleanLines.map(line => line.length);
  const avgWordsPerLine = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
  const avgCharsPerLine = charCounts.reduce((a, b) => a + b, 0) / charCounts.length;
  
  // Calculate entropy and complexity measures
  const allWords = cleanLines.join(' ').split(/\s+/);
  const uniqueWords = new Set(allWords.map(w => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / allWords.length;
  
  // Information threshold based on document characteristics
  let informationThreshold = 0.3; // Base threshold
  
  // Adjust based on document complexity
  if (lexicalDiversity > 0.5) informationThreshold -= 0.1; // High diversity = lower threshold
  if (avgWordsPerLine > 10) informationThreshold -= 0.1;   // Longer lines = lower threshold
  if (cleanLines.length < 20) informationThreshold -= 0.1; // Short docs = lower threshold
  
  return {
    avgWordsPerLine,
    avgCharsPerLine,
    lexicalDiversity,
    informationThreshold: Math.max(0.1, informationThreshold), // Never go below 0.1
    totalLines: cleanLines.length
  };
}

/**
 * Calculate information score using universal linguistic principles
 * No content-specific assumptions
 */
function calculateInformationScore(text, documentStats) {
  if (!text || text.length < 2) return 0;
  
  let score = 0.5; // Base information score
  
  // Universal linguistic indicators
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;
  const avgWordLength = charCount / wordCount;
  
  // Information density indicators (universal across languages)
  if (wordCount >= 3) score += 0.2;                    // Substantial content
  if (wordCount >= 8) score += 0.2;                    // Rich content
  if (avgWordLength > 4) score += 0.1;                 // Complex vocabulary
  if (charCount > documentStats.avgCharsPerLine * 0.5) score += 0.1; // Above average length
  
  // Sentence structure indicators (universal)
  if (/[.!?]/.test(text)) score += 0.2;               // Contains sentence endings
  if (/[,;:]/.test(text)) score += 0.1;               // Contains clause separators
  if (/["']/.test(text)) score += 0.1;                // Contains quotes
  
  // Numeric content (universal business/data indicator)
  if (/\d/.test(text)) score += 0.1;                  // Contains numbers
  if (/[\$£€¥₹]/.test(text)) score += 0.2;           // Contains currency (universal)
  if (/\d+%/.test(text)) score += 0.1;                // Contains percentages
  
  // Universal negative indicators (low information content)
  if (text.length < 5) score -= 0.3;                  // Too short
  if (wordCount === 1) score -= 0.2;                  // Single word
  if (/^[^a-zA-Z]*$/.test(text)) score -= 0.4;       // No letters (just symbols/numbers)
  if (/^[\W\d]+$/.test(text)) score -= 0.3;          // Only special chars and numbers
  
  // Repetition penalties (statistical analysis)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const repetitionRatio = uniqueWords.size / words.length;
  if (repetitionRatio < 0.5 && words.length > 3) score -= 0.3; // High repetition
  
  // Navigation/UI pattern detection (statistical, not keyword-based)
  const isVeryShort = text.length < 10;
  const isSingleWord = words.length === 1;
  const hasNoLetters = !/[a-zA-Z]/.test(text);
  
  if (isVeryShort && (isSingleWord || hasNoLetters)) score -= 0.4;
  
  return Math.max(0, Math.min(1, score));
}

/**
 * PHASE 4: Linguistic reconstruction
 * Focus: Universal linguistic patterns, not language-specific rules
 */
function linguisticReconstruction(text) {
  try {
    // Remove structural markers
    let reconstructed = text
      .replace(/▲ HEADING ▲/g, '')
      .replace(/▼ SECTION ▼/g, '')
      .replace(/◆ NAVIGATION ◆/g, '');
    
    // Universal linguistic reconstruction
    reconstructed = universalWordBoundaryReconstruction(reconstructed);
    reconstructed = universalSentenceReconstruction(reconstructed);
    reconstructed = statisticalRepetitionRemoval(reconstructed);
    
    return reconstructed;
  } catch (error) {
    console.error('Error in linguisticReconstruction:', error.message);
    return text;
  }
}

/**
 * Universal word boundary reconstruction using statistical analysis
 */
function universalWordBoundaryReconstruction(text) {
  try {
    console.log('🔧 Applying universal word boundary analysis...');
    
    let fixed = text;
    
    // Universal patterns based on statistical analysis, not specific words
    
    // Fix HTML processing artifacts using statistical patterns
    fixed = fixed
      // Currency spacing (universal across currencies)
      .replace(/([¥₹£€$])\s*(\d)/g, '$1$2')
      
      // Percentage spacing (universal)
      .replace(/(\d)\s*%/g, '$1%')
      
      // Universal punctuation fixes
      .replace(/\s+([,.!?;:])/g, '$1')        // Remove space before punctuation
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentence endings
      
      // Universal contraction reconstruction (statistical pattern)
      .replace(/\b(\w+)\s+('[a-z]{1,3})\b/g, '$1$2') // word + 're/ll/ve/nt patterns
      
      // Universal compound word analysis using length and capitalization patterns
      .replace(/\b([a-z]{1,3})\s+([A-Z][a-z]{3,})/g, (match, short, long) => {
        // Statistical pattern: very short word + capitalized word = likely compound
        if (short.length <= 3 && long.length >= 4) {
          return short + ' ' + long; // Keep separate (likely: "AI Photos", "In Marketing")
        }
        return match;
      })
      
      // Universal preposition pattern (statistical analysis of short functional words)
      .replace(/\b([a-z]{2,4})\s*([A-Z][a-z]{4,})/g, (match, possiblePrep, word) => {
        // Common short functional words that should be separate
        const shortFunctionalWords = possiblePrep.length <= 4;
        if (shortFunctionalWords) {
          return possiblePrep + ' ' + word;
        }
        return match;
      });
    
    // Statistical analysis of word boundary issues
    const originalWordCount = text.split(/\s+/).length;
    const fixedWordCount = fixed.split(/\s+/).length;
    const boundariesAdded = fixedWordCount - originalWordCount;
    
    if (boundariesAdded > 0) {
      console.log(`🔧 Universal boundary analysis: added ${boundariesAdded} word boundaries using statistical patterns`);
    }
    
    return fixed;
    
  } catch (error) {
    console.error('Error in universalWordBoundaryReconstruction:', error.message);
    return text;
  }
}

/**
 * Universal sentence reconstruction using linguistic universals
 */
function universalSentenceReconstruction(text) {
  console.log('🔧 Applying universal sentence structure analysis...');
  
  // Universal linguistic patterns that work across languages
  let fixed = text
    // Sentence boundary normalization (universal)
    .replace(/([.!?])\s*([a-z])/g, '$1 $2')     // Space after punctuation + lowercase
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2')  // New paragraph after punctuation + uppercase
    
    // Universal numeric patterns
    .replace(/(\d)\s+([A-Za-z])/g, '$1 $2')     // Ensure space between numbers and words
    .replace(/([A-Za-z])\s+(\d)/g, '$1 $2')     // Ensure space between words and numbers
    
    // Universal capitalization patterns (proper nouns and sentence starts)
    .replace(/([a-z])([A-Z])/g, '$1 $2')        // Add space between lowercase + uppercase
    
    // Universal punctuation spacing
    .replace(/\s{2,}/g, ' ')                    // Normalize multiple spaces
    .replace(/\n\s+/g, '\n')                    // Clean line starts
    .replace(/\s+\n/g, '\n');                   // Clean line ends
  
  console.log('🔧 Universal sentence reconstruction completed');
  return fixed;
}

/**
 * Statistical repetition removal using frequency analysis
 */
function statisticalRepetitionRemoval(text) {
  try {
    console.log('🔧 Applying statistical repetition analysis...');
    
    const words = text.split(/\s+/);
    if (words.length === 0) return text;
    
    // Statistical analysis of word frequencies
    const wordFreq = new Map();
    const totalWords = words.length;
    
    words.forEach(word => {
      const normalized = word.toLowerCase().replace(/[^\w]/g, '');
      if (normalized.length > 1) {
        wordFreq.set(normalized, (wordFreq.get(normalized) || 0) + 1);
      }
    });
    
    // Calculate statistical outliers for repetition
    const frequencies = Array.from(wordFreq.values());
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const maxFrequency = Math.max(...frequencies);
    
    // Dynamic threshold based on document statistics
    const repetitionThreshold = Math.max(
      5,                                    // Minimum threshold
      Math.ceil(avgFrequency * 3),          // 3x average frequency
      Math.ceil(totalWords * 0.05)          // 5% of total words
    );
    
    console.log(`📊 Repetition analysis: avgFreq=${avgFrequency.toFixed(1)}, maxFreq=${maxFrequency}, threshold=${repetitionThreshold}`);
    
    // Track removed words to avoid duplicate logging
    const removedWords = new Map();
    
    // Filter out statistically excessive repetitions
    const filtered = words.filter(word => {
      const normalized = word.toLowerCase().replace(/[^\w]/g, '');
      if (normalized.length <= 1) return true;
      
      const count = wordFreq.get(normalized) || 0;
      const isExcessive = count > repetitionThreshold;
      
      if (isExcessive && !removedWords.has(normalized)) {
        console.log(`🧹 Removing excessive word: "${normalized}" (${count} occurrences, threshold: ${repetitionThreshold})`);
        removedWords.set(normalized, count);
      }
      
      return !isExcessive;
    });
    
    const removedCount = words.length - filtered.length;
    const uniqueWordsRemoved = removedWords.size;
    if (removedCount > 0) {
      console.log(`🧹 Statistical repetition removal: removed ${removedCount} excessive words (${uniqueWordsRemoved} unique word types)`);
    }
    
    return filtered.join(' ');
    
  } catch (error) {
    console.error('Error in statisticalRepetitionRemoval:', error.message);
    return text;
  }
}

/**
 * PHASE 5: Universal optimization
 */
function universalOptimization(text) {
  // Universal text cleanup patterns
  let optimized = text
    .replace(/\n\s*\n\s*\n+/g, '\n\n')   // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')             // Single spaces only
    .replace(/^\s+|\s+$/gm, '');         // Trim line edges
  
  // Smart truncation preserving sentence boundaries (universal)
  if (optimized.length > 15000) {
    optimized = universalTruncation(optimized, 15000);
  }
  
  return optimized.trim();
}

/**
 * Universal truncation preserving linguistic boundaries
 */
function universalTruncation(text, maxLength) {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  
  // Find last sentence boundary (universal punctuation)
  const sentenceEnds = /[.!?]/g;
  let lastSentence = -1;
  let match;
  
  while ((match = sentenceEnds.exec(truncated)) !== null) {
    lastSentence = match.index;
  }
  
  if (lastSentence > maxLength * 0.8) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // Fallback to word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace);
}

/**
 * Preserve linguistic structure in entity processing
 */
function preserveLinguisticStructure(html) {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&([a-zA-Z]+);/g, ' ')      // Unknown entities become spaces
    .replace(/&#\d+;/g, ' ');           // Numeric entities become spaces
}

/**
 * Universal fallback for critical failures
 */
function universalFallback(html) {
  console.log('⚠️ Using universal fallback extraction');
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 8000);
}

/**
 * UNIVERSAL LINK EXTRACTION
 * Focus: Only filter technical duplicates, let AI decide value
 */
function extractAllLinks(html, baseUrl) {
  try {
    const links = [];
    const baseUrlObj = new URL(baseUrl);
    
    const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const rawText = match[2];
      
      // Clean link text using universal principles
      const linkText = universalLinkTextCleaning(rawText);
      if (!linkText) continue; // Only skip completely empty content
      
      // Convert to absolute URL (handle relative URLs)
      let absoluteUrl;
      try {
        absoluteUrl = new URL(url, baseUrl).href;
      } catch {
        // If URL conversion fails, skip (genuinely malformed URLs)
        continue;
      }
      
      // UNIVERSAL: Skip ALL fragment URLs (they never provide crawlable content)
      if (absoluteUrl.includes('#')) {
        console.log('🚫 Skipping fragment URL:', absoluteUrl, '(points to page section)');
        continue;
      }
      
      const urlObj = new URL(absoluteUrl);
      const isExternal = urlObj.hostname !== baseUrlObj.hostname;
      
      links.push({
        url: absoluteUrl,
        text: linkText,
        isExternal: isExternal,
        domain: urlObj.hostname,
        type: universalLinkCategorization(linkText, absoluteUrl)
      });
    }
    
    return universalDeduplicateLinks(links);
    
  } catch (error) {
    console.error('❌ Universal link extraction failed:', error.message);
    return [];
  }
}

/**
 * Minimal link text cleaning - let AI decide value
 */
function universalLinkTextCleaning(rawText) {
  let clean = rawText
    .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
  
  // Only filter out completely empty content
  // Let AI decide if "Click here", "Email", "Call" etc. are valuable
  if (clean.length === 0) return null;
  
  return clean;
}

/**
 * Universal link categorization using semantic analysis
 */
function universalLinkCategorization(text, url) {
  const lowerText = text.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const combined = lowerText + ' ' + lowerUrl;
  
  // Universal semantic patterns (based on URL structure and universal concepts)
  if (/\/(about|team|company|story|mission)/i.test(lowerUrl)) return 'about';
  if (/\/(pricing|plans|cost|buy|purchase|subscribe)/i.test(lowerUrl)) return 'pricing';
  if (/\/(product|service|features|solutions)/i.test(lowerUrl)) return 'product';
  if (/\/(contact|support|help|faq)/i.test(lowerUrl)) return 'support';
  if (/\/(blog|news|article|post)/i.test(lowerUrl)) return 'content';
  if (/\/(privacy|terms|legal)/i.test(lowerUrl)) return 'legal';
  
  return 'other';
}

/**
 * Universal link deduplication
 */
function universalDeduplicateLinks(links) {
  const seen = new Set();
  const unique = [];
  
  for (const link of links) {
    const key = link.url.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(link);
    }
  }
  
  return unique;
}

/**
 * Pass all links to AI for decision making
 * No pre-filtering based on our assumptions about relevance
 */
function filterRelevantLinks(links) {
  // Return all links - let AI decide what's relevant
  // Only technical deduplication has already been done
  console.log(`🔗 Passing all ${links.length} extracted links to AI for intelligent selection`);
  return links;
}

module.exports = {
  extractCleanText,
  extractAllLinks,
  filterRelevantLinks
};