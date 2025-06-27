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

// Display competitor intelligence section
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
    
    if (competitorIntelligence && competitorIntelligence.competitors_found > 0) {
        // Display detailed competitor intelligence
        let competitorHTML = `
            <h3>🏢 Competitor Intelligence Analysis</h3>
            <div class="competitor-summary">
                <div class="competitor-stats">
                    <span><strong>Competitors Found:</strong> ${competitorIntelligence.competitors_found}</span>
                    <span><strong>Competitors Analyzed:</strong> ${competitorIntelligence.competitors_selected}</span>
                    <span><strong>Queries Used:</strong> ${competitorIntelligence.discovery_queries_used.length}</span>
                </div>
            </div>
        `;
        
        // Display individual competitors
        if (competitorIntelligence.competitor_analysis && competitorIntelligence.competitor_analysis.length > 0) {
            competitorHTML += '<div class="competitors-grid">';
            
            competitorIntelligence.competitor_analysis.forEach((competitor, index) => {
                competitorHTML += `
                    <div class="competitor-card">
                        <div class="competitor-header">
                            <h4>${competitor.company_name}</h4>
                            <span class="relevance-badge ${competitor.relevance_score}">${competitor.relevance_score} relevance</span>
                        </div>
                        <div class="competitor-details">
                            <p class="competitor-url"><a href="${competitor.website_url}" target="_blank">${competitor.website_url}</a></p>
                            <p class="competitor-description">${competitor.business_description}</p>
                            <div class="competitor-positioning">
                                <strong>Value Proposition:</strong> ${competitor.value_proposition}
                            </div>
                            <div class="competitor-target">
                                <strong>Target Customer:</strong> ${competitor.target_customer}
                            </div>
                            ${competitor.key_features.length > 0 ? `
                                <div class="competitor-features">
                                    <strong>Key Features:</strong> ${competitor.key_features.join(', ')}
                                </div>
                            ` : ''}
                            ${competitor.pricing_approach !== 'Not found' ? `
                                <div class="competitor-pricing">
                                    <strong>Pricing:</strong> ${competitor.pricing_approach}
                                </div>
                            ` : ''}
                            <div class="competitor-stage">
                                <strong>Company Stage:</strong> ${competitor.company_stage}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            competitorHTML += '</div>';
        }
        
        // Display competitive insights
        if (competitorIntelligence.competitive_insights) {
            competitorHTML += `
                <div class="competitive-insights">
                    <h4>📊 Competitive Insights</h4>
                    <div class="insights-grid">
                        ${competitorIntelligence.competitive_insights.market_gaps.length > 0 ? `
                            <div class="insight-card">
                                <strong>Market Gaps:</strong>
                                <ul>${competitorIntelligence.competitive_insights.market_gaps.map(gap => `<li>${gap}</li>`).join('')}</ul>
                            </div>
                        ` : ''}
                        ${competitorIntelligence.competitive_insights.positioning_opportunities.length > 0 ? `
                            <div class="insight-card">
                                <strong>Positioning Opportunities:</strong>
                                <ul>${competitorIntelligence.competitive_insights.positioning_opportunities.map(opp => `<li>${opp}</li>`).join('')}</ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
        
        // Display differentiation opportunities
        if (competitorIntelligence.differentiation_opportunities && competitorIntelligence.differentiation_opportunities.length > 0) {
            competitorHTML += `
                <div class="differentiation-opportunities">
                    <h4>🎯 Differentiation Opportunities</h4>
                    <ul class="opportunities-list">
                        ${competitorIntelligence.differentiation_opportunities.map(opp => `<li>${opp}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Add copy button for raw data
        competitorHTML += `
            <div class="copy-section">
                <pre id="competitorIntelligenceOutput" style="display: none;">${JSON.stringify(competitorIntelligence, null, 2)}</pre>
                <button class="copy-btn" onclick="copyToClipboard('competitorIntelligenceOutput', this)">📋 Copy Raw Competitor Data</button>
            </div>
        `;
        
        competitorSection.innerHTML = competitorHTML;
        competitorSection.style.display = 'block';
        
    } else {
        // Display message when no competitor intelligence available
        competitorSection.innerHTML = `
            <h3>🏢 Competitor Intelligence Analysis</h3>
            <div class="no-competitor-data">
                <p>⚠️ No competitor intelligence available</p>
                <p class="explanation">
                    ${competitorIntelligence ? 
                        (competitorIntelligence.analysis_note || 'Competitor research was attempted but no relevant competitors were found.') :
                        'Competitor research was not performed for this analysis.'
                    }
                </p>
            </div>
        `;
        competitorSection.style.display = 'block';
    }
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