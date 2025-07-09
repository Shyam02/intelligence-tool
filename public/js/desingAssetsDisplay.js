// public/js/designAssetsDisplay.js
// Frontend component for displaying extracted design assets

// Add to existing results.js or create new design assets display module

// Display design assets in Business Profile tab
function displayDesignAssets(designAssets, websiteIntelligence) {
    const designContainer = document.getElementById('designAssetsContainer');
    if (!designContainer) {
        console.log('Design assets container not found');
        return;
    }

    if (!designAssets || !designAssets.extraction_metadata) {
        designContainer.innerHTML = '<p class="no-data">No design assets extracted</p>';
        return;
    }

    const designHTML = createDesignAssetsTemplate(designAssets, websiteIntelligence);
    designContainer.innerHTML = designHTML;
    
    // Initialize interactive features
    initializeColorPaletteCopy();
    initializeAssetDownloads();
    
    console.log('✅ Design assets displayed successfully');
}

// Create comprehensive design assets HTML template
function createDesignAssetsTemplate(designAssets, websiteIntelligence) {
    const companyName = websiteIntelligence?.company_name || 'Company';
    
    let html = `
        <div class="design-assets-container">
            <div class="design-header">
                <h3>🎨 Brand Design Assets</h3>
                <p class="extraction-info">
                    Extracted on ${new Date(designAssets.extraction_metadata.timestamp).toLocaleDateString()}
                    via ${designAssets.extraction_metadata.extraction_method}
                </p>
            </div>`;

    // Color Palette Section
    if (designAssets.color_palette && designAssets.color_palette.primary_colors) {
        html += createColorPaletteSection(designAssets.color_palette);
    }

    // Typography Section
    if (designAssets.typography && designAssets.typography.primary_font_family !== 'Not found') {
        html += createTypographySection(designAssets.typography);
    }

    // Logo Assets Section
    if (designAssets.logo_assets && designAssets.logo_assets.main_logo) {
        html += createLogoAssetsSection(designAssets.logo_assets, companyName);
    }

    // Visual Elements Section
    if (designAssets.visual_elements && Object.keys(designAssets.visual_elements).length > 0) {
        html += createVisualElementsSection(designAssets.visual_elements);
    }

    // Content Voice Analysis Section (from websiteIntelligence)
    if (websiteIntelligence?.content_voice_analysis) {
        html += createContentVoiceSection(websiteIntelligence.content_voice_analysis);
    }

    // Usage Instructions
    html += createUsageInstructionsSection();

    html += '</div>';
    return html;
}

// Color Palette Section
function createColorPaletteSection(colorPalette) {
    let html = `
        <div class="design-section color-palette-section">
            <h4>🎨 Color Palette</h4>
            <div class="color-categories">`;

    // Primary Colors
    if (colorPalette.primary_colors && colorPalette.primary_colors.length > 0) {
        html += `
            <div class="color-category">
                <h5>Primary Colors</h5>
                <div class="color-swatches">`;
        colorPalette.primary_colors.forEach(color => {
            html += `
                <div class="color-swatch" style="background-color: ${color}" 
                     data-color="${color}" onclick="copyColorToClipboard('${color}')">
                    <span class="color-code">${color}</span>
                </div>`;
        });
        html += '</div></div>';
    }

    // Secondary Colors
    if (colorPalette.secondary_colors && colorPalette.secondary_colors.length > 0) {
        html += `
            <div class="color-category">
                <h5>Secondary Colors</h5>
                <div class="color-swatches">`;
        colorPalette.secondary_colors.forEach(color => {
            html += `
                <div class="color-swatch" style="background-color: ${color}" 
                     data-color="${color}" onclick="copyColorToClipboard('${color}')">
                    <span class="color-code">${color}</span>
                </div>`;
        });
        html += '</div></div>';
    }

    // Text Colors
    if (colorPalette.text_colors && colorPalette.text_colors.length > 0) {
        html += `
            <div class="color-category">
                <h5>Text Colors</h5>
                <div class="color-swatches">`;
        colorPalette.text_colors.forEach(color => {
            html += `
                <div class="color-swatch" style="background-color: ${color}" 
                     data-color="${color}" onclick="copyColorToClipboard('${color}')">
                    <span class="color-code">${color}</span>
                </div>`;
        });
        html += '</div></div>';
    }

    html += `
            </div>
            <div class="color-actions">
                <button onclick="copyAllColors()" class="copy-btn">📋 Copy All Colors</button>
                <button onclick="downloadColorPalette()" class="download-btn">⬇️ Download Palette</button>
            </div>
        </div>`;

    return html;
}

// Typography Section
function createTypographySection(typography) {
    let html = `
        <div class="design-section typography-section">
            <h4>📝 Typography</h4>
            <div class="typography-info">`;

    if (typography.primary_font_family !== 'Not found') {
        html += `
            <div class="font-family">
                <h5>Primary Font</h5>
                <p class="font-display" style="font-family: ${typography.primary_font_family}">
                    ${typography.primary_font_family}
                </p>
                <span class="font-code">${typography.primary_font_family}</span>
            </div>`;
    }

    if (typography.secondary_font_family !== 'Not found') {
        html += `
            <div class="font-family">
                <h5>Secondary Font</h5>
                <p class="font-display" style="font-family: ${typography.secondary_font_family}">
                    ${typography.secondary_font_family}
                </p>
                <span class="font-code">${typography.secondary_font_family}</span>
            </div>`;
    }

    // Google Fonts
    if (typography.google_fonts_used && typography.google_fonts_used.length > 0) {
        html += `
            <div class="google-fonts">
                <h5>Google Fonts Used</h5>
                <ul>`;
        typography.google_fonts_used.forEach(font => {
            html += `<li>${font}</li>`;
        });
        html += '</ul></div>';
    }

    // Font Weights
    if (typography.font_weights_used && typography.font_weights_used.length > 0) {
        html += `
            <div class="font-weights">
                <h5>Font Weights</h5>
                <div class="weight-list">`;
        typography.font_weights_used.forEach(weight => {
            html += `<span class="weight-tag">${weight}</span>`;
        });
        html += '</div></div>';
    }

    html += `
            </div>
            <div class="typography-actions">
                <button onclick="copyTypographyCSS()" class="copy-btn">📋 Copy CSS</button>
            </div>
        </div>`;

    return html;
}

// Logo Assets Section
function createLogoAssetsSection(logoAssets, companyName) {
    let html = `
        <div class="design-section logo-section">
            <h4>🏢 Brand Assets</h4>
            <div class="logo-assets">`;

    // Main Logo
    if (logoAssets.main_logo && logoAssets.main_logo.status === 'downloaded') {
        html += `
            <div class="logo-asset">
                <h5>Main Logo</h5>
                <div class="logo-preview">
                    <img src="${logoAssets.main_logo.local_path}" 
                         alt="${logoAssets.main_logo.alt_text || companyName + ' Logo'}"
                         class="logo-image">
                </div>
                <div class="logo-info">
                    <p><strong>Size:</strong> ${Math.round(logoAssets.main_logo.file_size / 1024)}KB</p>
                    <p><strong>Format:</strong> ${logoAssets.main_logo.url.split('.').pop().toUpperCase()}</p>
                </div>
                <div class="logo-actions">
                    <a href="${logoAssets.main_logo.local_path}" download class="download-btn">⬇️ Download</a>
                    <button onclick="copyImageToClipboard('${logoAssets.main_logo.local_path}')" class="copy-btn">📋 Copy</button>
                </div>
            </div>`;
    }

    // Favicon
    if (logoAssets.favicon && logoAssets.favicon.status === 'downloaded') {
        html += `
            <div class="logo-asset">
                <h5>Favicon</h5>
                <div class="logo-preview favicon-preview">
                    <img src="${logoAssets.favicon.local_path}" 
                         alt="${companyName} Favicon"
                         class="favicon-image">
                </div>
                <div class="logo-actions">
                    <a href="${logoAssets.favicon.local_path}" download class="download-btn">⬇️ Download</a>
                </div>
            </div>`;
    }

    html += '</div></div>';
    return html;
}

// Visual Elements Section
function createVisualElementsSection(visualElements) {
    let html = `
        <div class="design-section visual-elements-section">
            <h4>🎨 Visual Design Elements</h4>
            <div class="visual-info">`;

    // Border Radius Patterns
    if (visualElements.border_radius_patterns && visualElements.border_radius_patterns.length > 0) {
        html += `
            <div class="design-pattern">
                <h5>Border Radius Patterns</h5>
                <div class="pattern-examples">`;
        visualElements.border_radius_patterns.forEach(radius => {
            html += `
                <div class="radius-example" style="border-radius: ${radius}">
                    ${radius}
                </div>`;
        });
        html += '</div></div>';
    }

    // Spacing Patterns
    if (visualElements.spacing_patterns && visualElements.spacing_patterns.length > 0) {
        html += `
            <div class="design-pattern">
                <h5>Spacing Patterns</h5>
                <div class="spacing-list">`;
        visualElements.spacing_patterns.slice(0, 8).forEach(spacing => {
            html += `<span class="spacing-tag">${spacing}</span>`;
        });
        html += '</div></div>';
    }

    // Layout Information
    if (visualElements.layout_patterns) {
        html += `
            <div class="design-pattern">
                <h5>Layout Patterns</h5>
                <div class="layout-info">`;
        if (visualElements.layout_patterns.flexbox_usage) {
            html += '<span class="layout-tag">Flexbox</span>';
        }
        if (visualElements.layout_patterns.grid_usage) {
            html += '<span class="layout-tag">CSS Grid</span>';
        }
        html += '</div></div>';
    }

    html += '</div></div>';
    return html;
}

// Content Voice Section
function createContentVoiceSection(contentVoice) {
    let html = `
        <div class="design-section content-voice-section">
            <h4>🗣️ Content Voice & Brand Language</h4>
            <div class="voice-analysis">`;

    // Basic Voice Characteristics
    html += `
        <div class="voice-characteristics">
            <div class="voice-trait">
                <strong>Tone:</strong> <span class="trait-value">${contentVoice.tone || 'Not identified'}</span>
            </div>
            <div class="voice-trait">
                <strong>Writing Style:</strong> <span class="trait-value">${contentVoice.writing_style || 'Not identified'}</span>
            </div>
            <div class="voice-trait">
                <strong>Technical Level:</strong> <span class="trait-value">${contentVoice.technical_language_level || 'Not identified'}</span>
            </div>
        </div>`;

    // Personality Traits
    if (contentVoice.personality_traits && contentVoice.personality_traits.length > 0) {
        html += `
            <div class="personality-traits">
                <h5>Brand Personality</h5>
                <div class="traits-list">`;
        contentVoice.personality_traits.forEach(trait => {
            html += `<span class="personality-tag">${trait}</span>`;
        });
        html += '</div></div>';
    }

    // Voice Examples
    if (contentVoice.voice_examples && contentVoice.voice_examples.length > 0) {
        html += `
            <div class="voice-examples">
                <h5>Voice Examples</h5>
                <div class="examples-list">`;
        contentVoice.voice_examples.forEach(example => {
            html += `<blockquote class="voice-example">"${example}"</blockquote>`;
        });
        html += '</div></div>';
    }

    // Brand Language Patterns
    if (contentVoice.brand_language_patterns) {
        html += `
            <div class="brand-language">
                <h5>Brand Language Patterns</h5>`;
        
        if (contentVoice.brand_language_patterns.power_words && contentVoice.brand_language_patterns.power_words.length > 0) {
            html += `
                <div class="language-pattern">
                    <strong>Power Words:</strong>
                    <div class="words-list">`;
            contentVoice.brand_language_patterns.power_words.forEach(word => {
                html += `<span class="power-word">${word}</span>`;
            });
            html += '</div></div>';
        }
        
        html += '</div>';
    }

    html += `
            </div>
            <div class="voice-actions">
                <button onclick="copyBrandGuidelines()" class="copy-btn">📋 Copy Brand Guidelines</button>
                <button onclick="exportDesignAssets()" class="export-btn">📤 Export All Assets</button>
            </div>
        </div>`;

    return html;
}

// Usage Instructions Section
function createUsageInstructionsSection() {
    return `
        <div class="design-section usage-section">
            <h4>💡 How to Use These Assets</h4>
            <div class="usage-instructions">
                <div class="usage-item">
                    <h5>🎨 Content Generation</h5>
                    <p>Colors, fonts, and voice patterns will be automatically used in generated content to maintain brand consistency.</p>
                </div>
                <div class="usage-item">
                    <h5>📱 Social Media</h5>
                    <p>Use extracted colors and logo for consistent social media branding across all platforms.</p>
                </div>
                <div class="usage-item">
                    <h5>✍️ Writing Style</h5>
                    <p>Voice analysis ensures all generated content matches your established tone and communication style.</p>
                </div>
                <div class="usage-item">
                    <h5>🖼️ Visual Content</h5>
                    <p>Downloaded logos and color palette can be used for creating branded graphics and visual content.</p>
                </div>
            </div>
        </div>`;
}

// Interactive Functions

function copyColorToClipboard(color) {
    navigator.clipboard.writeText(color).then(() => {
        showNotification(`Color ${color} copied to clipboard!`);
    });
}

function copyAllColors() {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const colors = Array.from(colorSwatches).map(swatch => swatch.dataset.color);
    const colorText = colors.join('\n');
    
    navigator.clipboard.writeText(colorText).then(() => {
        showNotification(`All colors copied to clipboard!`);
    });
}

function copyTypographyCSS() {
    // Generate CSS from typography data
    const typography = window.appState?.websiteIntelligence?.design_assets?.typography;
    if (!typography) return;
    
    let css = `/* Brand Typography */\n`;
    if (typography.primary_font_family !== 'Not found') {
        css += `--primary-font: ${typography.primary_font_family};\n`;
    }
    if (typography.secondary_font_family !== 'Not found') {
        css += `--secondary-font: ${typography.secondary_font_family};\n`;
    }
    
    navigator.clipboard.writeText(css).then(() => {
        showNotification('Typography CSS copied to clipboard!');
    });
}

function copyBrandGuidelines() {
    const designAssets = window.appState?.websiteIntelligence?.design_assets;
    const contentVoice = window.appState?.websiteIntelligence?.content_voice_analysis;
    
    let guidelines = '# Brand Guidelines\n\n';
    
    // Add voice guidelines
    if (contentVoice) {
        guidelines += `## Voice & Tone\n`;
        guidelines += `- Tone: ${contentVoice.tone}\n`;
        guidelines += `- Style: ${contentVoice.writing_style}\n`;
        guidelines += `- Technical Level: ${contentVoice.technical_language_level}\n\n`;
    }
    
    // Add color guidelines
    if (designAssets?.color_palette) {
        guidelines += `## Brand Colors\n`;
        designAssets.color_palette.primary_colors?.forEach(color => {
            guidelines += `- Primary: ${color}\n`;
        });
        guidelines += '\n';
    }
    
    navigator.clipboard.writeText(guidelines).then(() => {
        showNotification('Brand guidelines copied to clipboard!');
    });
}

function exportDesignAssets() {
    const designAssets = window.appState?.websiteIntelligence?.design_assets;
    if (!designAssets) return;
    
    const dataStr = JSON.stringify(designAssets, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brand-design-assets.json';
    link.click();
    
    showNotification('Design assets exported successfully!');
}

function showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function initializeColorPaletteCopy() {
    // Add click handlers for color swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
        });
        swatch.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function initializeAssetDownloads() {
    // Initialize download tracking and analytics
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const assetType = this.closest('.logo-asset')?.querySelector('h5')?.textContent || 'Unknown';
            console.log(`Asset downloaded: ${assetType}`);
        });
    });
}