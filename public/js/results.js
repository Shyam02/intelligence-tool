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
    
    // Display 3: AI Foundational Intelligence (Strategic Analysis)
    document.getElementById('intelligenceOutput').textContent = JSON.stringify(foundationalIntelligence, null, 2);
    
    // Update section titles for clarity
    updateSectionTitles();
    
    // Show results container
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
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