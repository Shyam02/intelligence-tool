// Results display management with clean data organization

// Display intelligence generation results with clear data separation
function displayIntelligenceResults(userInput, websiteIntelligence, foundationalIntelligence) {
    // Display 1: Pure User Input
    document.getElementById('onboardingDataOutput').textContent = JSON.stringify(userInput, null, 2);
    
    // Display 2: AI-Extracted Website Intelligence  
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
                <div class="copy-section">
                    <pre id="websiteIntelligenceOutput"></pre>
                    <button class="copy-btn" onclick="copyToClipboard('websiteIntelligenceOutput', this)">📋 Copy Website Intelligence</button>
                </div>
            `;
            
            // Insert after the first section
            const firstSection = document.querySelector('.result-section');
            firstSection.parentNode.insertBefore(websiteSection, firstSection.nextSibling);
        }
        
        document.getElementById('websiteIntelligenceOutput').textContent = JSON.stringify(websiteIntelligence, null, 2);
        websiteSection.style.display = 'block';
    } else {
        // Hide website intelligence section if no data
        const websiteSection = document.getElementById('websiteIntelligenceSection');
        if (websiteSection) {
            websiteSection.style.display = 'none';
        }
    }
    
    // Display 3: AI Foundational Intelligence (Strategic Analysis) - WITHOUT competitor data
    const foundationalWithoutCompetitor = { ...foundationalIntelligence };
    delete foundationalWithoutCompetitor.competitor_intelligence; // Remove competitor data for separate display
    document.getElementById('intelligenceOutput').textContent = JSON.stringify(foundationalWithoutCompetitor, null, 2);
    
    // Display 4: Competitor Intelligence Analysis
    displayCompetitorIntelligence(foundationalIntelligence.competitor_intelligence);
    
    // Update section titles for clarity
    updateSectionTitles();
    
    // NOTE: Results container visibility is now handled by the calling function
    // to support tab navigation - no longer auto-scroll here
    console.log('✅ Intelligence results displayed in setup tab');
}

// UPDATED: Display competitor intelligence section - NOW USES TEMPLATE
function displayCompetitorIntelligence(competitorIntelligence) {
    // Create or update competitor intelligence section
    let competitorSection = document.getElementById('competitorIntelligenceSection');
    
    if (!competitorSection) {
        // Create the new section
        competitorSection = document.createElement('div');
        competitorSection.className = 'result-section';
        competitorSection.id = 'competitorIntelligenceSection';
        
        // Insert after foundational intelligence section, before action buttons
        const intelligenceSection = document.querySelector('#intelligenceOutput').closest('.result-section');
        intelligenceSection.parentNode.insertBefore(competitorSection, intelligenceSection.nextSibling);
    }
    
    // Use template function instead of inline HTML construction
    const competitorHTML = createCompetitorIntelligenceTemplate(competitorIntelligence);
    
    competitorSection.innerHTML = competitorHTML;
    competitorSection.style.display = 'block';
}

// Update section titles to be more descriptive
function updateSectionTitles() {
    // Update first section title
    const firstSectionTitle = document.querySelector('.result-section h3');
    if (firstSectionTitle && firstSectionTitle.textContent === 'Raw Onboarding Data') {
        firstSectionTitle.textContent = 'Raw User Input';
    }
    
    // Update third section title
    const intelligenceSection = document.querySelector('#intelligenceOutput').closest('.result-section');
    const intelligenceTitle = intelligenceSection.querySelector('h3');
    if (intelligenceTitle) {
        intelligenceTitle.textContent = 'AI Foundational Intelligence (Strategic Analysis)';
    }
}