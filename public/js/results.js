// Results display management with formatted data display and sub-tab distribution

// Display intelligence generation results with sub-tab distribution
function displayIntelligenceResults(userInput, websiteIntelligence, foundationalIntelligence) {
    // Display 1: User Input in Business Setup sub-tab
    displayBusinessSetupResults(userInput, websiteIntelligence);
    
    // Display 2: Competitor Intelligence in Competitors sub-tab
    if (foundationalIntelligence.competitor_intelligence) {
        displayCompetitorResults(foundationalIntelligence.competitor_intelligence);
        markSubTabCompleted('setup', 'competitors');
    }
    
    // Display 3: Foundational Intelligence in Strategic Intelligence sub-tab
    const foundationalWithoutCompetitor = { ...foundationalIntelligence };
    delete foundationalWithoutCompetitor.competitor_intelligence;
    displayStrategicIntelligenceResults(foundationalWithoutCompetitor);
    markSubTabCompleted('setup', 'strategicIntelligence');
    
    console.log('✅ Intelligence results distributed across sub-tabs');
}

// Display business setup results in Business Setup sub-tab
function displayBusinessSetupResults(userInput, websiteIntelligence) {
    // Display user input
    const userInputDisplay = document.getElementById('userInputDisplay');
    if (userInputDisplay) {
        userInputDisplay.innerHTML = createUserInputDisplayTemplate(userInput);
    }
    
    // Keep raw data for copy functionality (hidden)
    document.getElementById('onboardingDataOutput').textContent = JSON.stringify(userInput, null, 2);
    
    // Display website intelligence if available (in Business Setup)
    if (websiteIntelligence) {
        // Create or update website intelligence section in Business Setup
        let websiteSection = document.getElementById('websiteIntelligenceSection');
        if (!websiteSection) {
            // Create the new section in Business Setup
            websiteSection = document.createElement('div');
            websiteSection.className = 'result-section';
            websiteSection.id = 'websiteIntelligenceSection';
            websiteSection.innerHTML = `
                <h3>AI-Extracted Website Intelligence</h3>
                <div class="formatted-content" id="websiteIntelligenceDisplay"></div>
                <div class="copy-section">
                    <pre id="websiteIntelligenceOutput" style="display: none;"></pre>
                    <button class="copy-btn" onclick="copyToClipboard('websiteIntelligenceOutput', this)">📋 Copy Raw Data</button>
                </div>
            `;
            
            // Insert after the user input section in Business Setup
            const resultsContainer = document.getElementById('resultsContainer');
            const firstSection = resultsContainer.querySelector('.result-section');
            firstSection.parentNode.insertBefore(websiteSection, firstSection.nextSibling);
        }
        
        // Display formatted website intelligence
        const websiteDisplay = document.getElementById('websiteIntelligenceDisplay');
        if (websiteDisplay) {
            websiteDisplay.innerHTML = createWebsiteIntelligenceTemplate(websiteIntelligence);
        }
        
        // Keep raw data for copy functionality (hidden)
        document.getElementById('websiteIntelligenceOutput').textContent = JSON.stringify(websiteIntelligence, null, 2);
        websiteSection.style.display = 'block';
    }

    // Display design assets if available
    if (websiteIntelligence && websiteIntelligence.design_assets) {
        displayDesignAssetsSimple(websiteIntelligence);
    }
    
    console.log('✅ Business setup results displayed');
}

// Display competitor intelligence in Competitors sub-tab
function displayCompetitorResults(competitorIntelligence) {
    const competitorContainer = document.getElementById('competitorIntelligenceContainer');
    if (!competitorContainer) return;
    
    // Use existing competitor template function
    const competitorHTML = `
        <div class="results-container">
            <h2>🏢 Competitor Intelligence Analysis</h2>
            ${createCompetitorIntelligenceTemplate(competitorIntelligence)}
        </div>
    `;
    
    competitorContainer.innerHTML = competitorHTML;
    
    // Hide empty state
    const emptyState = document.getElementById('competitorsEmptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    console.log('✅ Competitor results displayed in Competitors sub-tab');
}

// Display strategic intelligence in Strategic Intelligence sub-tab
function displayStrategicIntelligenceResults(foundationalIntelligence) {
    const strategicContainer = document.getElementById('strategicIntelligenceContainer');
    if (!strategicContainer) return;
    
    // Create strategic intelligence display
    const strategicHTML = `
        <div class="results-container">
            <h2>🧠 Strategic Intelligence Analysis</h2>
            <div class="result-section">
                <h3>Foundational Business Intelligence</h3>
                <div class="formatted-content" id="strategicIntelligenceDisplay"></div>
                <div class="copy-section">
                    <pre id="strategicIntelligenceOutput" style="display: none;"></pre>
                    <button class="copy-btn" onclick="copyToClipboard('strategicIntelligenceOutput', this)">📋 Copy Raw Data</button>
                </div>
            </div>
        </div>
    `;
    
    strategicContainer.innerHTML = strategicHTML;
    
    // Display formatted foundational intelligence
    const strategicDisplay = document.getElementById('strategicIntelligenceDisplay');
    if (strategicDisplay) {
        strategicDisplay.innerHTML = createFoundationalIntelligenceTemplate(foundationalIntelligence);
    }
    
    // Keep raw data for copy functionality (hidden)
    document.getElementById('strategicIntelligenceOutput').textContent = JSON.stringify(foundationalIntelligence, null, 2);
    
    // Hide empty state
    const emptyState = document.getElementById('strategicIntelligenceEmptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    console.log('✅ Strategic intelligence results displayed in Strategic Intelligence sub-tab');
}

// Legacy function for backward compatibility
function displayCompetitorIntelligence(competitorIntelligence) {
    // This function is called from other parts of the codebase
    // Redirect to the new sub-tab function
    displayCompetitorResults(competitorIntelligence);
}

// Simple function to display design assets - add this to your existing results.js

function displayDesignAssetsSimple(websiteIntelligence) {
    const designAssets = websiteIntelligence?.design_assets;
    if (!designAssets) {
        console.log('No design assets found');
        return;
    }
    
    console.log('🎨 Design Assets Found:', designAssets);
    
    // Create a simple display container
    let html = '<div class="design-assets-simple" style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">';
    html += '<h3 style="margin-top: 0;">🎨 Brand Design Assets</h3>';
    
    // Display colors
    if (designAssets.color_palette?.primary_colors?.length > 0) {
        html += '<div><strong>Primary Colors:</strong></div>';
        html += '<div style="display: flex; gap: 10px; margin: 10px 0;">';
        designAssets.color_palette.primary_colors.forEach(color => {
            // Clean up malformed colors
            const cleanColor = color.includes('rgb(') ? '#666666' : color; // Fallback for complex RGB values
            html += `<div style="width: 40px; height: 40px; background-color: ${cleanColor}; border: 1px solid #ccc; border-radius: 4px;" title="${color}"></div>`;
        });
        html += '</div>';
    }
    
    // Display fonts
    if (designAssets.typography?.font_families_found?.length > 0) {
        html += '<div><strong>Fonts Found:</strong></div>';
        html += '<ul>';
        designAssets.typography.font_families_found.forEach(font => {
            html += `<li style="font-family: ${font}">${font}</li>`;
        });
        html += '</ul>';
    } else if (designAssets.typography?.primary_font_family && designAssets.typography.primary_font_family !== 'Not found') {
        html += `<div><strong>Primary Font:</strong> <span style="font-family: ${designAssets.typography.primary_font_family}">${designAssets.typography.primary_font_family}</span></div>`;
    }
    
    // Display Google Fonts
    if (designAssets.typography?.google_fonts_used?.length > 0) {
        html += '<div><strong>Google Fonts:</strong></div>';
        html += '<ul>';
        designAssets.typography.google_fonts_used.forEach(font => {
            html += `<li>${font}</li>`;
        });
        html += '</ul>';
    }
    
    // Display logos
    if (designAssets.logo_assets?.main_logo?.status === 'downloaded') {
        html += '<div><strong>Main Logo:</strong></div>';
        html += `<img src="${designAssets.logo_assets.main_logo.local_path}" alt="Company Logo" style="max-width: 200px; max-height: 100px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">`;
        html += `<div><small>Size: ${Math.round(designAssets.logo_assets.main_logo.file_size / 1024)}KB</small></div>`;
    }
    
    if (designAssets.logo_assets?.favicon?.status === 'downloaded') {
        html += '<div style="margin-top: 15px;"><strong>Favicon:</strong></div>';
        html += `<img src="${designAssets.logo_assets.favicon.local_path}" alt="Favicon" style="width: 32px; height: 32px; margin: 10px 0;">`;
    }
    
    // Show extraction info
    html += `<div style="margin-top: 20px; font-size: 12px; color: #666;">`;
    html += `Extracted: ${designAssets.extraction_metadata?.timestamp ? new Date(designAssets.extraction_metadata.timestamp).toLocaleString() : 'Unknown'}`;
    html += `</div>`;
    
    html += '</div>';
    
    // Insert into page (you can customize where this goes)
    const targetContainer = document.getElementById('websiteIntelligenceSection') || document.body;
    const designContainer = document.createElement('div');
    designContainer.innerHTML = html;
    targetContainer.appendChild(designContainer);
    
    console.log('✅ Design assets displayed successfully');
}

// Call this function in your existing displayBusinessSetupResults function
// Add this line wherever you display website intelligence:
// if (websiteIntelligence) { displayDesignAssetsSimple(websiteIntelligence); }