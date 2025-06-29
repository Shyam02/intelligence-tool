// Competitor Intelligence Template Functions
// File path: /public/js/templates/competitor.js

// Template for competitor intelligence display
function createCompetitorIntelligenceTemplate(competitorIntelligence) {
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
        
        return competitorHTML;
        
    } else {
        // Display message when no competitor intelligence available
        return `
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
    }
}