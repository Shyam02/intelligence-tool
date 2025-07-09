// services/designExtractor.js
// Design asset extraction service for website crawling - UPDATED VERSION

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

// Main function to extract all design assets from website
async function extractDesignAssets(websiteUrl, htmlContent) {
  try {
    console.log('🎨 Starting design asset extraction for:', websiteUrl);
    
    const designAssets = {
      color_palette: await extractColorPalette(htmlContent, websiteUrl),
      typography: await extractTypography(htmlContent, websiteUrl),
      logo_assets: await extractLogos(htmlContent, websiteUrl),
      visual_elements: await extractVisualElements(htmlContent),
      extraction_metadata: {
        timestamp: new Date().toISOString(),
        extraction_method: 'enhanced_css_and_image_analysis',
        source_url: websiteUrl
      }
    };
    
    console.log('✅ Design asset extraction completed');
    
    // Enhanced debug logging
    console.log('🎨 Design extraction results:', {
      colorCount: designAssets.color_palette?.all_extracted_colors?.length || 0,
      primaryColors: designAssets.color_palette?.primary_colors || [],
      fontFamiliesFound: designAssets.typography?.font_families_found?.length || 0,
      primaryFont: designAssets.typography?.primary_font_family || 'Not found',
      googleFonts: designAssets.typography?.google_fonts_used?.length || 0,
      logoFound: designAssets.logo_assets?.main_logo?.status || 'not_found',
      faviconFound: designAssets.logo_assets?.favicon?.status || 'not_found',
      visualElements: Object.keys(designAssets.visual_elements || {}).length
    });
    
    return designAssets;
    
  } catch (error) {
    console.error('❌ Design asset extraction failed:', error.message);
    return {
      color_palette: {},
      typography: {},
      logo_assets: {},
      visual_elements: {},
      extraction_metadata: {
        timestamp: new Date().toISOString(),
        extraction_method: 'failed',
        error: error.message
      }
    };
  }
}

// ENHANCED: Extract color palette from CSS and inline styles with modern CSS support
async function extractColorPalette(htmlContent, websiteUrl) {
  try {
    const colors = {
      primary_colors: [],
      secondary_colors: [],
      text_colors: [],
      background_colors: [],
      accent_colors: [],
      extraction_method: 'enhanced_css_analysis'
    };
    
    // Extract colors from inline styles
    const inlineStyleColors = extractColorsFromInlineStyles(htmlContent);
    
    // Extract colors from CSS links
    const cssColors = await extractColorsFromCSSFiles(htmlContent, websiteUrl);
    
    // Extract Tailwind CSS colors
    const tailwindColors = extractTailwindColors(htmlContent);
    
    // Extract CSS variables and computed colors
    const variableColors = extractCSSVariableColors(htmlContent);
    
    // Combine all color sources
    const allColors = [...inlineStyleColors, ...cssColors, ...tailwindColors, ...variableColors];
    
    // Clean and normalize colors
    const cleanedColors = cleanAndNormalizeColors(allColors);
    
    // Categorize colors
    const categorizedColors = categorizeColors(cleanedColors);
    
    return {
      ...colors,
      ...categorizedColors,
      all_extracted_colors: cleanedColors.slice(0, 20), // Limit to top 20 colors
      color_count: cleanedColors.length
    };
    
  } catch (error) {
    console.error('Color extraction failed:', error.message);
    return { extraction_method: 'failed', error: error.message };
  }
}

// ENHANCED: Extract typography information with modern CSS support
async function extractTypography(htmlContent, websiteUrl) {
  try {
    const typography = {
      primary_font_family: 'Not found',
      secondary_font_family: 'Not found',
      heading_fonts: [],
      body_font: 'Not found',
      font_weights_used: [],
      font_sizes: {},
      google_fonts_used: [],
      font_families_found: [],
      extraction_method: 'enhanced_css_and_html_analysis'
    };
    
    // Extract font families from CSS and inline styles
    const fontFamilies = extractFontFamilies(htmlContent);
    
    // Extract Google Fonts links
    const googleFonts = extractGoogleFonts(htmlContent);
    
    // Extract CSS variable fonts
    const cssVariableFonts = extractCSSVariableFonts(htmlContent);
    
    // Extract font sizes and weights
    const fontSizes = extractFontSizes(htmlContent);
    const fontWeights = extractFontWeights(htmlContent);
    
    // Combine all font sources
    const allFonts = [...fontFamilies, ...cssVariableFonts];
    const uniqueFonts = [...new Set(allFonts)].filter(font => font && font.length > 0);
    
    return {
      ...typography,
      primary_font_family: uniqueFonts[0] || 'Not found',
      secondary_font_family: uniqueFonts[1] || 'Not found',
      font_families_found: uniqueFonts,
      google_fonts_used: googleFonts,
      font_weights_used: fontWeights,
      font_sizes: fontSizes
    };
    
  } catch (error) {
    console.error('Typography extraction failed:', error.message);
    return { extraction_method: 'failed', error: error.message };
  }
}

// ENHANCED: Extract and download logo assets with better detection
async function extractLogos(htmlContent, websiteUrl) {
  try {
    const logoAssets = {
      main_logo: null,
      favicon: null,
      extraction_method: 'enhanced_logo_extraction'
    };
    
    // Extract main logo (look for common logo patterns)
    const mainLogo = await extractMainLogo(htmlContent, websiteUrl);
    if (mainLogo) {
      logoAssets.main_logo = await downloadAndStoreAsset(mainLogo, websiteUrl, 'logo');
    }
    
    // Extract favicon
    const favicon = extractFavicon(htmlContent, websiteUrl);
    if (favicon) {
      logoAssets.favicon = await downloadAndStoreAsset(favicon, websiteUrl, 'favicon');
    }
    
    return logoAssets;
    
  } catch (error) {
    console.error('Logo extraction failed:', error.message);
    return { 
      extraction_method: 'failed', 
      error: error.message 
    };
  }
}

// Extract visual design elements
async function extractVisualElements(htmlContent) {
  try {
    const visualElements = {
      button_styles: extractButtonStyles(htmlContent),
      border_radius_patterns: extractBorderRadiusPatterns(htmlContent),
      shadow_patterns: extractShadowPatterns(htmlContent),
      spacing_patterns: extractSpacingPatterns(htmlContent),
      layout_patterns: extractLayoutPatterns(htmlContent),
      extraction_method: 'css_pattern_analysis'
    };
    
    return visualElements;
    
  } catch (error) {
    console.error('Visual elements extraction failed:', error.message);
    return { extraction_method: 'failed', error: error.message };
  }
}

// === ENHANCED HELPER FUNCTIONS ===

// FIXED: Extract colors from inline styles with modern CSS support
function extractColorsFromInlineStyles(htmlContent) {
  const colors = [];
  
  // Enhanced regex patterns for modern CSS colors
  const colorPatterns = [
    // Traditional hex colors
    /(color|background-color|border-color|background):\s*(#[0-9a-fA-F]{3,8})/gi,
    // RGB/RGBA (traditional and modern syntax)
    /(color|background-color|border-color|background):\s*(rgba?\([^)]+\))/gi,
    // HSL/HSLA colors
    /(color|background-color|border-color|background):\s*(hsla?\([^)]+\))/gi,
    // CSS variables
    /(color|background-color|border-color|background):\s*(var\([^)]+\))/gi
  ];
  
  colorPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      const colorValue = match[2].trim();
      if (isValidColor(colorValue)) {
        colors.push({
          value: colorValue,
          property: match[1],
          source: 'inline_style'
        });
      }
    }
  });
  
  return colors;
}

// ENHANCED: Extract colors from CSS files
async function extractColorsFromCSSFiles(htmlContent, websiteUrl) {
  const colors = [];
  
  try {
    // Find CSS file links
    const cssLinkRegex = /<link[^>]*href\s*=\s*["']([^"']*\.css[^"']*)["'][^>]*>/gi;
    let match;
    
    const cssPromises = [];
    
    while ((match = cssLinkRegex.exec(htmlContent)) !== null) {
      const cssUrl = new URL(match[1], websiteUrl).href;
      cssPromises.push(fetchAndExtractCSSColors(cssUrl));
    }
    
    // Process all CSS files in parallel
    const cssResults = await Promise.allSettled(cssPromises);
    cssResults.forEach(result => {
      if (result.status === 'fulfilled') {
        colors.push(...result.value);
      }
    });
    
  } catch (error) {
    console.error('CSS file extraction failed:', error.message);
  }
  
  return colors;
}

// Helper function to fetch and extract colors from a single CSS file
async function fetchAndExtractCSSColors(cssUrl) {
  try {
    const cssResponse = await axios.get(cssUrl, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesignExtractor/1.0)'
      }
    });
    return extractColorsFromCSS(cssResponse.data);
  } catch (error) {
    console.log(`Failed to fetch CSS file: ${cssUrl}`);
    return [];
  }
}

// FIXED: Extract colors from CSS content with enhanced patterns
function extractColorsFromCSS(cssContent) {
  const colors = [];
  
  // Enhanced regex patterns for all color types
  const colorPatterns = [
    // Hex colors (3, 4, 6, 8 digits)
    /(color|background-color|border-color|background|fill|stroke):\s*(#[0-9a-fA-F]{3,8})/gi,
    // RGB/RGBA (both syntaxes)
    /(color|background-color|border-color|background|fill|stroke):\s*(rgba?\([^)]+\))/gi,
    // HSL/HSLA colors
    /(color|background-color|border-color|background|fill|stroke):\s*(hsla?\([^)]+\))/gi,
    // CSS custom properties
    /(--[^:]+):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi
  ];
  
  colorPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(cssContent)) !== null) {
      const colorValue = match[2].trim();
      if (isValidColor(colorValue)) {
        colors.push({
          value: colorValue,
          property: match[1],
          source: 'css_file'
        });
      }
    }
  });
  
  return colors;
}

// NEW: Extract Tailwind CSS colors
function extractTailwindColors(htmlContent) {
  const colors = [];
  const tailwindColorMap = {
    // Basic colors
    'red': '#ef4444', 'blue': '#3b82f6', 'green': '#22c55e', 'yellow': '#eab308',
    'purple': '#a855f7', 'pink': '#ec4899', 'indigo': '#6366f1', 'orange': '#f97316',
    'gray': '#6b7280', 'slate': '#64748b', 'zinc': '#71717a', 'neutral': '#737373',
    'stone': '#78716c', 'emerald': '#10b981', 'teal': '#14b8a6', 'cyan': '#06b6d4',
    'sky': '#0ea5e9', 'violet': '#8b5cf6', 'fuchsia': '#d946ef', 'rose': '#f43f5e',
    'lime': '#84cc16', 'amber': '#f59e0b'
  };
  
  // Find Tailwind color classes
  const tailwindRegex = /class\s*=\s*["'][^"']*(?:bg|text|border)-([a-z]+)-(\d+)[^"']*/gi;
  let match;
  
  while ((match = tailwindRegex.exec(htmlContent)) !== null) {
    const colorName = match[1];
    const colorShade = match[2];
    
    if (tailwindColorMap[colorName]) {
      colors.push({
        value: tailwindColorMap[colorName],
        property: 'tailwind-color',
        source: 'tailwind_css',
        originalClass: match[0]
      });
    }
  }
  
  return colors;
}

// NEW: Extract CSS variable colors
function extractCSSVariableColors(htmlContent) {
  const colors = [];
  
  // Find CSS variable definitions
  const cssVarRegex = /(--[^:]+):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/gi;
  let match;
  
  while ((match = cssVarRegex.exec(htmlContent)) !== null) {
    const colorValue = match[2].trim();
    if (isValidColor(colorValue)) {
      colors.push({
        value: colorValue,
        property: match[1],
        source: 'css_variable'
      });
    }
  }
  
  return colors;
}

// NEW: Clean and normalize colors
function cleanAndNormalizeColors(allColors) {
  const cleanedColors = [];
  const seenColors = new Set();
  
  allColors.forEach(colorObj => {
    let normalizedColor = normalizeColor(colorObj.value);
    
    // Skip invalid or duplicate colors
    if (normalizedColor && !seenColors.has(normalizedColor)) {
      seenColors.add(normalizedColor);
      cleanedColors.push(normalizedColor);
    }
  });
  
  return cleanedColors;
}

// FIXED: Normalize color values
function normalizeColor(colorValue) {
  if (!colorValue || typeof colorValue !== 'string') return null;
  
  // Clean up the color value
  let normalized = colorValue.trim().toLowerCase();
  
  // Handle malformed RGB values like "rgb(255255255/var(--tw-text-opacity)"
  if (normalized.startsWith('rgb(') && !normalized.endsWith(')')) {
    // Try to extract just the RGB part
    const rgbMatch = normalized.match(/rgb\((\d+)[,\s]*(\d+)[,\s]*(\d+)/);
    if (rgbMatch) {
      normalized = `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
    } else {
      return null; // Invalid color
    }
  }
  
  // Handle CSS variables - we can't resolve them without full CSS context
  if (normalized.startsWith('var(')) {
    return null; // Skip CSS variables for now
  }
  
  // Convert 3-digit hex to 6-digit
  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    normalized = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3];
  }
  
  // Validate the normalized color
  if (isValidColor(normalized)) {
    return normalized;
  }
  
  return null;
}

// NEW: Validate color values
function isValidColor(color) {
  if (!color || typeof color !== 'string') return false;
  
  const colorValue = color.trim().toLowerCase();
  
  // Valid patterns
  const validPatterns = [
    /^#[0-9a-f]{3,8}$/i,              // Hex colors
    /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*[\d.]+)?\s*\)$/i, // RGB/RGBA
    /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*[\d.]+)?\s*\)$/i // HSL/HSLA
  ];
  
  return validPatterns.some(pattern => pattern.test(colorValue));
}

// ENHANCED: Categorize colors with better logic
function categorizeColors(allColors) {
  const categorized = {
    primary_colors: [],
    secondary_colors: [],
    text_colors: [],
    background_colors: [],
    accent_colors: []
  };
  
  const colorCounts = {};
  
  // Count color frequency
  allColors.forEach(color => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });
  
  // Sort by frequency
  const sortedColors = Object.entries(colorCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([color]) => color);
  
  // Categorize based on frequency and color properties
  sortedColors.slice(0, 10).forEach((color, index) => {
    if (index < 2) {
      categorized.primary_colors.push(color);
    } else if (index < 4) {
      categorized.secondary_colors.push(color);
    } else if (isTextColor(color)) {
      categorized.text_colors.push(color);
    } else if (isBackgroundColor(color)) {
      categorized.background_colors.push(color);
    } else {
      categorized.accent_colors.push(color);
    }
  });
  
  return categorized;
}

// NEW: Check if color is likely a text color
function isTextColor(color) {
  const textColors = ['#000', '#000000', '#333', '#333333', '#666', '#666666', 
                     '#999', '#999999', '#555', '#555555', '#222', '#222222'];
  return textColors.includes(color.toLowerCase()) || 
         color.toLowerCase().includes('rgb(0,') || 
         color.toLowerCase().includes('rgb(33,') ||
         color.toLowerCase().includes('rgb(51,');
}

// NEW: Check if color is likely a background color
function isBackgroundColor(color) {
  const bgColors = ['#fff', '#ffffff', '#f5f5f5', '#fafafa', '#f0f0f0', '#eeeeee'];
  return bgColors.includes(color.toLowerCase()) || 
         color.toLowerCase().includes('rgb(255,') ||
         color.toLowerCase().includes('rgb(245,') ||
         color.toLowerCase().includes('rgb(250,');
}

// ENHANCED: Extract font families with modern CSS support
function extractFontFamilies(htmlContent) {
  const fonts = [];
  
  // Enhanced patterns to catch different font declarations
  const fontPatterns = [
    // Traditional font-family
    /font-family:\s*([^;}]+)/gi,
    // CSS custom properties for fonts
    /--font-[^:]*:\s*([^;}]+)/gi,
    // React/JS inline styles
    /"fontFamily":\s*"([^"]+)"/gi,
    // Shorthand font property
    /font:\s*[^;]*?([^,;]+(?:,\s*[^,;]+)*)\s*[;}]/gi,
    // Utility classes (rough detection)
    /font-([a-z]+)/gi
  ];
  
  fontPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      let fontFamily = match[1]
        .replace(/['"]/g, '') // Remove quotes
        .replace(/!important/g, '') // Remove !important
        .replace(/var\([^)]+\)/g, '') // Remove CSS variables
        .trim();
      
      // Clean up and split multiple fonts
      const fontList = fontFamily.split(',').map(f => f.trim()).filter(f => f.length > 0);
      
      fontList.forEach(font => {
        // Only add real font names (not generic fallbacks alone)
        if (font && 
            font !== 'sans-serif' && 
            font !== 'serif' && 
            font !== 'monospace' && 
            font !== 'cursive' && 
            font !== 'fantasy' &&
            font.length > 1 &&
            !fonts.includes(font)) {
          fonts.push(font);
        }
      });
    }
  });
  
  return fonts.slice(0, 10); // Top 10 font families
}

// ENHANCED: Extract Google Fonts with better detection
function extractGoogleFonts(htmlContent) {
  const googleFonts = [];
  
  // Enhanced patterns for Google Fonts
  const patterns = [
    // Google Fonts CSS links
    /fonts\.googleapis\.com\/css[^"']*family=([^"'&]+)/gi,
    // Google Fonts static links
    /fonts\.gstatic\.com\/[^"']*family=([^"'&]+)/gi,
    // CSS imports
    /@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com\/css[^)]*family=([^&)'"]+)/gi,
    // Preconnect hints
    /<link[^>]*href\s*=\s*["']https:\/\/fonts\.googleapis\.com[^"']*family=([^"'&]+)["']/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      let fontName = decodeURIComponent(match[1])
        .replace(/\+/g, ' ') // Replace + with spaces
        .replace(/:\d+.*$/, '') // Remove weights like ":400,700"
        .replace(/&.*$/, '') // Remove additional parameters
        .replace(/\|.*$/, '') // Remove multiple fonts separator
        .trim();
      
      if (fontName && fontName.length > 1 && !googleFonts.includes(fontName)) {
        googleFonts.push(fontName);
      }
    }
  });
  
  return googleFonts;
}

// NEW: Extract CSS variable fonts
function extractCSSVariableFonts(htmlContent) {
  const fonts = [];
  
  // Look for font-related CSS variables
  const patterns = [
    /--font-family[^:]*:\s*([^;}]+)/gi,
    /--primary-font[^:]*:\s*([^;}]+)/gi,
    /--heading-font[^:]*:\s*([^;}]+)/gi,
    /--body-font[^:]*:\s*([^;}]+)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(htmlContent)) !== null) {
      let fontValue = match[1]
        .replace(/['"]/g, '')
        .replace(/var\([^)]+\)/g, '')
        .trim();
      
      if (fontValue && fontValue !== 'inherit' && fontValue !== 'initial') {
        const fontList = fontValue.split(',').map(f => f.trim());
        fontList.forEach(font => {
          if (font && 
              font !== 'sans-serif' && 
              font !== 'serif' && 
              font !== 'monospace' &&
              !fonts.includes(font)) {
            fonts.push(font);
          }
        });
      }
    }
  });
  
  return fonts;
}

// ENHANCED: Extract main logo with better patterns
async function extractMainLogo(htmlContent, websiteUrl) {
  // Enhanced logo patterns
  const logoPatterns = [
    // Logo by class name
    /<img[^>]*class\s*=\s*["'][^"']*logo[^"']*["'][^>]*src\s*=\s*["']([^"']+)["']/i,
    // Logo by src path
    /<img[^>]*src\s*=\s*["']([^"']*logo[^"']*)["']/i,
    // Logo by alt text
    /<img[^>]*alt\s*=\s*["'][^"']*logo[^"']*["'][^>]*src\s*=\s*["']([^"']+)["']/i,
    // SVG logos
    /<svg[^>]*class\s*=\s*["'][^"']*logo[^"']*["']/i,
    // Header logo patterns
    /<header[^>]*>[\s\S]*?<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*[\s\S]*?<\/header>/i,
    // Navigation logo patterns
    /<nav[^>]*>[\s\S]*?<img[^>]*src\s*=\s*["']([^"']+)["'][^>]*[\s\S]*?<\/nav>/i
  ];
  
  for (const pattern of logoPatterns) {
    const match = htmlContent.match(pattern);
    if (match && match[1]) {
      try {
        const logoUrl = new URL(match[1], websiteUrl).href;
        return {
          url: logoUrl,
          type: 'main_logo',
          alt_text: extractAltText(htmlContent, match[1]) || 'Company Logo'
        };
      } catch (urlError) {
        continue; // Try next pattern
      }
    }
  }
  
  return null;
}

// Extract favicon with multiple patterns
function extractFavicon(htmlContent, websiteUrl) {
  const faviconPatterns = [
    /<link[^>]*rel\s*=\s*["'](?:shortcut\s+)?icon["'][^>]*href\s*=\s*["']([^"']+)["']/i,
    /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["'](?:shortcut\s+)?icon["']/i,
    /<link[^>]*rel\s*=\s*["']apple-touch-icon["'][^>]*href\s*=\s*["']([^"']+)["']/i
  ];
  
  for (const pattern of faviconPatterns) {
    const match = htmlContent.match(pattern);
    if (match && match[1]) {
      try {
        const faviconUrl = new URL(match[1], websiteUrl).href;
        return {
          url: faviconUrl,
          type: 'favicon',
          alt_text: 'Favicon'
        };
      } catch (urlError) {
        continue;
      }
    }
  }
  
  // Fallback to standard favicon.ico
  try {
    return {
      url: new URL('/favicon.ico', websiteUrl).href,
      type: 'favicon',
      alt_text: 'Favicon'
    };
  } catch (urlError) {
    return null;
  }
}

// ENHANCED: Download and store assets with better error handling
async function downloadAndStoreAsset(asset, websiteUrl, assetType) {
  try {
    const companyIdentifier = getCompanyIdentifier(websiteUrl);
    const assetsDir = path.join(__dirname, '..', 'public', 'assets', companyIdentifier);
    
    // Ensure assets directory exists
    await fs.mkdir(assetsDir, { recursive: true });
    
    // Download the asset
    const response = await axios.get(asset.url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesignExtractor/1.0)'
      }
    });
    
    // Determine file extension
    const contentType = response.headers['content-type'] || '';
    let extension = path.extname(new URL(asset.url).pathname);
    
    if (!extension) {
      if (contentType.includes('png')) extension = '.png';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = '.jpg';
      else if (contentType.includes('svg')) extension = '.svg';
      else if (contentType.includes('gif')) extension = '.gif';
      else if (contentType.includes('webp')) extension = '.webp';
      else if (contentType.includes('ico')) extension = '.ico';
      else extension = '.png'; // Default fallback
    }
    
    // Create filename
    const filename = `${assetType}_${Date.now()}${extension}`;
    const filepath = path.join(assetsDir, filename);
    const publicPath = `/assets/${companyIdentifier}/${filename}`;
    
    // Save the file
    await fs.writeFile(filepath, response.data);
    
    console.log(`✅ Downloaded ${assetType}: ${asset.url} -> ${publicPath}`);
    
    return {
      status: 'downloaded',
      original_url: asset.url,
      local_path: publicPath,
      file_size: response.data.length,
      content_type: contentType,
      alt_text: asset.alt_text
    };
    
  } catch (error) {
    console.error(`❌ Failed to download ${assetType}:`, error.message);
    return {
      status: 'failed',
      original_url: asset.url,
      error: error.message,
      alt_text: asset.alt_text
    };
  }
}

// Helper function to get company identifier from URL
function getCompanyIdentifier(websiteUrl) {
  try {
    const url = new URL(websiteUrl);
    return url.hostname.replace(/^www\./, '').replace(/\./g, '_');
  } catch (error) {
    return 'unknown_company';
  }
}

// Clean up old assets for a company
async function cleanupDesignAssets(companyIdentifier) {
  try {
    const assetsDir = path.join(__dirname, '..', 'public', 'assets', companyIdentifier);
    
    // Check if directory exists
    try {
      await fs.access(assetsDir);
    } catch (error) {
      // Directory doesn't exist, nothing to clean
      return;
    }
    
    // Read and delete old files
    const files = await fs.readdir(assetsDir);
    const deletePromises = files.map(file => 
      fs.unlink(path.join(assetsDir, file)).catch(() => {})
    );
    
    await Promise.all(deletePromises);
    console.log(`🧹 Cleaned up ${files.length} old assets for ${companyIdentifier}`);
    
  } catch (error) {
    console.error('Failed to cleanup old assets:', error.message);
  }
}

// Extract alt text for an image
function extractAltText(htmlContent, imageSrc) {
  const escapedSrc = imageSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const altRegex = new RegExp(`src\\s*=\\s*["']${escapedSrc}["'][^>]*alt\\s*=\\s*["']([^"']+)["']`, 'i');
  const match = htmlContent.match(altRegex);
  return match ? match[1] : null;
}

// ENHANCED: Extract font sizes
function extractFontSizes(htmlContent) {
  const sizes = new Set();
  const sizeRegex = /font-size:\s*([^;}]+)/gi;
  let match;
  
  while ((match = sizeRegex.exec(htmlContent)) !== null) {
    const size = match[1].trim();
    if (size && !size.includes('var(')) {
      sizes.add(size);
    }
  }
  
  return Array.from(sizes).slice(0, 10);
}

// ENHANCED: Extract font weights
function extractFontWeights(htmlContent) {
  const weights = new Set();
  const weightRegex = /font-weight:\s*([^;}]+)/gi;
  let match;
  
  while ((match = weightRegex.exec(htmlContent)) !== null) {
    const weight = match[1].trim();
    if (weight && !weight.includes('var(')) {
      weights.add(weight);
    }
  }
  
  return Array.from(weights).slice(0, 10);
}

// Extract button styles
function extractButtonStyles(htmlContent) {
  const buttonStyles = {};
  
  // Look for button elements and their classes
  const buttonRegex = /<button[^>]*class\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  
  const buttonClasses = new Set();
  
  while ((match = buttonRegex.exec(htmlContent)) !== null) {
    const classes = match[1].split(/\s+/);
    classes.forEach(cls => {
      if (cls && cls.length > 0) {
        buttonClasses.add(cls);
      }
    });
  }
  
  buttonStyles.button_classes = Array.from(buttonClasses).slice(0, 10);
  return buttonStyles;
}

// Extract border radius patterns
function extractBorderRadiusPatterns(htmlContent) {
  const patterns = new Set();
  const borderRadiusRegex = /border-radius:\s*([^;}]+)/gi;
  let match;
  
  while ((match = borderRadiusRegex.exec(htmlContent)) !== null) {
    const value = match[1].trim();
    if (value && !value.includes('var(')) {
      patterns.add(value);
    }
  }
  
  return Array.from(patterns).slice(0, 5);
}

// Extract shadow patterns
function extractShadowPatterns(htmlContent) {
  const patterns = new Set();
  const shadowRegex = /box-shadow:\s*([^;}]+)/gi;
  let match;
  
  while ((match = shadowRegex.exec(htmlContent)) !== null) {
    const value = match[1].trim();
    if (value && value !== 'none' && !value.includes('var(')) {
      patterns.add(value);
    }
  }
  
  return Array.from(patterns).slice(0, 5);
}

// Extract spacing patterns
function extractSpacingPatterns(htmlContent) {
  const patterns = new Set();
  const spacingRegex = /(margin|padding):\s*([^;}]+)/gi;
  let match;
  
  while ((match = spacingRegex.exec(htmlContent)) !== null) {
    const values = match[2].split(/\s+/);
    values.forEach(value => {
      if (value && value !== '0' && !value.includes('var(')) {
        patterns.add(value.trim());
      }
    });
  }
  
  return Array.from(patterns).slice(0, 10);
}

// Extract layout patterns
function extractLayoutPatterns(htmlContent) {
  const patterns = {
    flexbox_usage: htmlContent.includes('display: flex') || htmlContent.includes('display:flex'),
    grid_usage: htmlContent.includes('display: grid') || htmlContent.includes('display:grid'),
    position_patterns: [],
    display_patterns: []
  };
  
  // Extract position values
  const positionRegex = /position:\s*([^;}]+)/gi;
  let match;
  const positions = new Set();
  
  while ((match = positionRegex.exec(htmlContent)) !== null) {
    positions.add(match[1].trim());
  }
  patterns.position_patterns = Array.from(positions);
  
  // Extract display values
  const displayRegex = /display:\s*([^;}]+)/gi;
  const displays = new Set();
  
  while ((match = displayRegex.exec(htmlContent)) !== null) {
    displays.add(match[1].trim());
  }
  patterns.display_patterns = Array.from(displays);
  
  return patterns;
}

module.exports = {
  extractDesignAssets,
  cleanupDesignAssets,
  getCompanyIdentifier
};