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