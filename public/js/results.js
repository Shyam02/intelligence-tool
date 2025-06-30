// Results display management with formatted data display

// Display intelligence generation results with formatted displays
function displayIntelligenceResults(userInput, websiteIntelligence, foundationalIntelligence) {
    // Display 1: Formatted User Input Display
    const userInputDisplay = document.getElementById('userInputDisplay');
    if (userInputDisplay) {
        userInputDisplay.innerHTML = createUserInputDisplayTemplate(userInput);
    }
    
    // Keep raw data for copy functionality (hidden)
    document.getElementById('onboardingDataOutput').textContent = JSON.stringify(userInput, null, 2);
    
    // Display 2: AI-Extracted Website Intelligence (if available)
    if (websiteIntelligence) {
        // Create or update website intelligence section
        let websiteSection = document.getElementById('websiteIntelligenceSection');
        if (!websiteSection) {
            // Create the new section
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
            
            // Insert after the first section
            const firstSection = document.querySelector('.result-section');
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
    } else {
        // Hide website intelligence section if no data
        const websiteSection = document.getElementById('websiteIntelligenceSection');
        if (websiteSection) {
            websiteSection.style.display = 'none';
        }
    }
    
    // Display 3: Formatted Foundational Intelligence (WITHOUT competitor data)
    const foundationalWithoutCompetitor = { ...foundationalIntelligence };
    delete foundationalWithoutCompetitor.competitor_intelligence; // Remove competitor data for separate display
    
    const intelligenceDisplay = document.getElementById('intelligenceDisplay');
    if (intelligenceDisplay) {
        intelligenceDisplay.innerHTML = createFoundationalIntelligenceTemplate(foundationalWithoutCompetitor);
    }
    
    // Keep raw data for copy functionality (hidden)
    document.getElementById('intelligenceOutput').textContent = JSON.stringify(foundationalWithoutCompetitor, null, 2);
    
    // Display 4: Competitor Intelligence Analysis (if available)
    if (foundationalIntelligence.competitor_intelligence) {
        displayCompetitorIntelligence(foundationalIntelligence.competitor_intelligence);
    }
    
    console.log('✅ Intelligence results displayed with formatted templates');
}

// Display competitor intelligence section (keep existing template)
function displayCompetitorIntelligence(competitorIntelligence) {
    // Create or update competitor intelligence section
    let competitorSection = document.getElementById('competitorIntelligenceSection');
    
    if (!competitorSection) {
        // Create the new section
        competitorSection = document.createElement('div');
        competitorSection.className = 'result-section';
        competitorSection.id = 'competitorIntelligenceSection';
        
        // Insert after foundational intelligence section, before action buttons
        const intelligenceSection = document.querySelector('#intelligenceDisplay').closest('.result-section');
        intelligenceSection.parentNode.insertBefore(competitorSection, intelligenceSection.nextSibling);
    }
    
    // Use existing competitor template function
    const competitorHTML = createCompetitorIntelligenceTemplate(competitorIntelligence);
    
    competitorSection.innerHTML = competitorHTML;
    competitorSection.style.display = 'block';
}