// Data Display Template Functions - Human-readable formatting for all data types with sub-tab support
// File path: /public/js/templates/dataDisplay.js

// Template for Raw User Input display
function createUserInputDisplayTemplate(userInput) {
    if (!userInput) {
        return '<div class="no-data">No user input data available</div>';
    }

    return `
        <div class="formatted-data-display">
            <div class="data-section">
                <h4>📋 Business Information</h4>
                <div class="data-grid">
                    <div class="data-item">
                        <label>Launch Date:</label>
                        <span>${userInput.launchDate || 'Not specified'}</span>
                    </div>
                    <div class="data-item">
                        <label>Target Market:</label>
                        <span>${userInput.targetGeography || 'Not specified'}</span>
                    </div>
                    <div class="data-item">
                        <label>Website URL:</label>
                        <span>${userInput.websiteUrl ? `<a href="${userInput.websiteUrl}" target="_blank">${userInput.websiteUrl}</a>` : 'Not provided'}</span>
                    </div>
                    <div class="data-item">
                        <label>Business Category:</label>
                        <span>${userInput.category || 'Not specified'}</span>
                    </div>
                </div>
            </div>

            ${userInput.businessDescription ? `
                <div class="data-section">
                    <h4>💼 Business Description</h4>
                    <div class="description-text">${userInput.businessDescription}</div>
                </div>
            ` : ''}

            ${userInput.targetCustomer ? `
                <div class="data-section">
                    <h4>🎯 Target Customer</h4>
                    <div class="description-text">${userInput.targetCustomer}</div>
                </div>
            ` : ''}

            ${userInput.businessSpecifics ? `
                <div class="data-section">
                    <h4>📝 Additional Details</h4>
                    <div class="description-text">${userInput.businessSpecifics}</div>
                </div>
            ` : ''}

            ${userInput.customerAcquisition ? `
                <div class="data-section">
                    <h4>📈 Customer Acquisition</h4>
                    <div class="description-text">${userInput.customerAcquisition}</div>
                </div>
            ` : ''}

            ${userInput.additionalInfo ? `
                <div class="data-section">
                    <h4>ℹ️ Additional Information</h4>
                    <div class="description-text">${userInput.additionalInfo}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// Template for Website Intelligence display
function createWebsiteIntelligenceTemplate(websiteData) {
    if (!websiteData) {
        return '<div class="no-data">No website intelligence data available</div>';
    }

    return `
        <div class="formatted-data-display">
            <div class="data-section">
                <h4>🏢 Company Overview</h4>
                <div class="data-grid">
                    <div class="data-item">
                        <label>Company Name:</label>
                        <span>${websiteData.company_name || 'Not found'}</span>
                    </div>
                    <div class="data-item">
                        <label>Industry:</label>
                        <span>${websiteData.industry_category || 'Not found'}</span>
                    </div>
                    <div class="data-item">
                        <label>Business Stage:</label>
                        <span>${websiteData.business_stage || 'Not found'}</span>
                    </div>
                    <div class="data-item">
                        <label>Team Size:</label>
                        <span>${websiteData.team_size || 'Not found'}</span>
                    </div>
                </div>
            </div>

            ${websiteData.business_description && websiteData.business_description !== 'Not found' ? `
                <div class="data-section">
                    <h4>📋 Business Description</h4>
                    <div class="description-text">${websiteData.business_description}</div>
                </div>
            ` : ''}

            ${websiteData.value_proposition && websiteData.value_proposition !== 'Not found' ? `
                <div class="data-section">
                    <h4>💎 Value Proposition</h4>
                    <div class="description-text">${websiteData.value_proposition}</div>
                </div>
            ` : ''}

            ${websiteData.target_customer && websiteData.target_customer !== 'Not found' ? `
                <div class="data-section">
                    <h4>🎯 Target Customer</h4>
                    <div class="description-text">${websiteData.target_customer}</div>
                </div>
            ` : ''}

            ${websiteData.main_product_service && websiteData.main_product_service !== 'Not found' ? `
                <div class="data-section">
                    <h4>🛠️ Main Product/Service</h4>
                    <div class="description-text">${websiteData.main_product_service}</div>
                </div>
            ` : ''}

            ${websiteData.key_features && Array.isArray(websiteData.key_features) && websiteData.key_features.length > 0 ? `
                <div class="data-section">
                    <h4>⭐ Key Features</h4>
                    <ul class="feature-list">
                        ${websiteData.key_features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${websiteData.unique_selling_points && Array.isArray(websiteData.unique_selling_points) && websiteData.unique_selling_points.length > 0 ? `
                <div class="data-section">
                    <h4>🚀 Unique Selling Points</h4>
                    <ul class="feature-list">
                        ${websiteData.unique_selling_points.map(usp => `<li>${usp}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${websiteData.pricing_info && websiteData.pricing_info !== 'Not found' ? `
                <div class="data-section">
                    <h4>💰 Pricing Information</h4>
                    <div class="description-text">${websiteData.pricing_info}</div>
                </div>
            ` : ''}

            ${websiteData.social_media && (
                websiteData.social_media.twitter || 
                websiteData.social_media.linkedin || 
                websiteData.social_media.instagram || 
                websiteData.social_media.facebook || 
                websiteData.social_media.youtube || 
                websiteData.social_media.tiktok || 
                websiteData.social_media.pinterest || 
                websiteData.social_media.reddit || 
                websiteData.social_media.discord || 
                websiteData.social_media.other?.length > 0
            ) ? `
                <div class="data-section">
                    <h4>🌐 Social Media</h4>
                    <div class="social-links">
                        ${websiteData.social_media.twitter ? `<div class="social-item">Twitter: <a href="${websiteData.social_media.twitter}" target="_blank">${websiteData.social_media.twitter}</a></div>` : ''}
                        ${websiteData.social_media.linkedin ? `<div class="social-item">LinkedIn: <a href="${websiteData.social_media.linkedin}" target="_blank">${websiteData.social_media.linkedin}</a></div>` : ''}
                        ${websiteData.social_media.instagram ? `<div class="social-item">Instagram: <a href="${websiteData.social_media.instagram}" target="_blank">${websiteData.social_media.instagram}</a></div>` : ''}
                        ${websiteData.social_media.facebook ? `<div class="social-item">Facebook: <a href="${websiteData.social_media.facebook}" target="_blank">${websiteData.social_media.facebook}</a></div>` : ''}
                        ${websiteData.social_media.youtube ? `<div class="social-item">YouTube: <a href="${websiteData.social_media.youtube}" target="_blank">${websiteData.social_media.youtube}</a></div>` : ''}
                        ${websiteData.social_media.tiktok ? `<div class="social-item">TikTok: <a href="${websiteData.social_media.tiktok}" target="_blank">${websiteData.social_media.tiktok}</a></div>` : ''}
                        ${websiteData.social_media.pinterest ? `<div class="social-item">Pinterest: <a href="${websiteData.social_media.pinterest}" target="_blank">${websiteData.social_media.pinterest}</a></div>` : ''}
                        ${websiteData.social_media.reddit ? `<div class="social-item">Reddit: <a href="${websiteData.social_media.reddit}" target="_blank">${websiteData.social_media.reddit}</a></div>` : ''}
                        ${websiteData.social_media.discord ? `<div class="social-item">Discord: <a href="${websiteData.social_media.discord}" target="_blank">${websiteData.social_media.discord}</a></div>` : ''}
                        ${websiteData.social_media.other && websiteData.social_media.other.length > 0 ? websiteData.social_media.other.map(link => `<div class="social-item">Other: <a href="${link}" target="_blank">${link}</a></div>`).join('') : ''}
                    </div>
                </div>
            ` : ''}

            <div class="data-section">
                <h4>📊 Extraction Details</h4>
                <div class="extraction-details">
                    <div class="detail-item">Method: ${websiteData.extraction_method || 'Standard'}</div>
                    <div class="detail-item">Pages Analyzed: ${websiteData.pages_analyzed || 1}</div>
                    <div class="detail-item">Content Length: ${websiteData.total_content_length || 0} characters</div>
                    <div class="detail-item">Timestamp: ${websiteData.extraction_timestamp ? new Date(websiteData.extraction_timestamp).toLocaleString() : 'Unknown'}</div>
                </div>
            </div>
        </div>
    `;
}

// Template for Foundational Intelligence display
function createFoundationalIntelligenceTemplate(intelligence) {
    if (!intelligence) {
        return '<div class="no-data">No foundational intelligence data available</div>';
    }

    return `
        <div class="formatted-data-display">
            ${intelligence.industry_classification ? `
                <div class="data-section">
                    <h4>🏭 Industry Classification</h4>
                    <div class="data-grid">
                        <div class="data-item">
                            <label>Primary Industry:</label>
                            <span>${intelligence.industry_classification.primary_industry || 'Not specified'}</span>
                        </div>
                        <div class="data-item">
                            <label>Business Model:</label>
                            <span>${intelligence.industry_classification.business_model || 'Not specified'}</span>
                        </div>
                        <div class="data-item">
                            <label>Market Type:</label>
                            <span>${intelligence.industry_classification.market_type || 'Not specified'}</span>
                        </div>
                    </div>
                    ${intelligence.industry_classification.sub_categories && intelligence.industry_classification.sub_categories.length > 0 ? `
                        <div class="subcategories">
                            <label>Sub-categories:</label>
                            <ul class="inline-list">
                                ${intelligence.industry_classification.sub_categories.map(cat => `<li>${cat}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${intelligence.product_classification ? `
                <div class="data-section">
                    <h4>📦 Product Classification</h4>
                    <div class="data-grid">
                        <div class="data-item">
                            <label>Product Category:</label>
                            <span>${intelligence.product_classification.product_category || 'Not specified'}</span>
                        </div>
                        <div class="data-item">
                            <label>Solution Category:</label>
                            <span>${intelligence.product_classification.solution_category || 'Not specified'}</span>
                        </div>
                    </div>
                    ${intelligence.product_classification.business_function_keywords && intelligence.product_classification.business_function_keywords.length > 0 ? `
                        <div class="keywords-section">
                            <label>Business Functions:</label>
                            <div class="keyword-tags">
                                ${intelligence.product_classification.business_function_keywords.map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${intelligence.core_keywords ? `
                <div class="data-section">
                    <h4>🔑 Core Keywords</h4>
                    <div class="keywords-grid">
                        ${intelligence.core_keywords.product_keywords && intelligence.core_keywords.product_keywords.length > 0 ? `
                            <div class="keyword-group">
                                <label>Product Keywords:</label>
                                <div class="keyword-tags">
                                    ${intelligence.core_keywords.product_keywords.map(keyword => `<span class="keyword-tag product">${keyword}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${intelligence.core_keywords.solution_keywords && intelligence.core_keywords.solution_keywords.length > 0 ? `
                            <div class="keyword-group">
                                <label>Solution Keywords:</label>
                                <div class="keyword-tags">
                                    ${intelligence.core_keywords.solution_keywords.map(keyword => `<span class="keyword-tag solution">${keyword}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${intelligence.core_keywords.industry_keywords && intelligence.core_keywords.industry_keywords.length > 0 ? `
                            <div class="keyword-group">
                                <label>Industry Keywords:</label>
                                <div class="keyword-tags">
                                    ${intelligence.core_keywords.industry_keywords.map(keyword => `<span class="keyword-tag industry">${keyword}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                        ${intelligence.core_keywords.target_keywords && intelligence.core_keywords.target_keywords.length > 0 ? `
                            <div class="keyword-group">
                                <label>Target Keywords:</label>
                                <div class="keyword-tags">
                                    ${intelligence.core_keywords.target_keywords.map(keyword => `<span class="keyword-tag target">${keyword}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${intelligence.pain_points ? `
                <div class="data-section">
                    <h4>🎯 Pain Points & Solutions</h4>
                    ${intelligence.pain_points.primary_problem ? `
                        <div class="pain-point-item">
                            <label>Primary Problem:</label>
                            <div class="description-text">${intelligence.pain_points.primary_problem}</div>
                        </div>
                    ` : ''}
                    ${intelligence.pain_points.secondary_problems && intelligence.pain_points.secondary_problems.length > 0 ? `
                        <div class="pain-point-item">
                            <label>Secondary Problems:</label>
                            <ul class="problem-list">
                                ${intelligence.pain_points.secondary_problems.map(problem => `<li>${problem}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${intelligence.pain_points.solution_approach ? `
                        <div class="pain-point-item">
                            <label>Solution Approach:</label>
                            <div class="description-text">${intelligence.pain_points.solution_approach}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            ${intelligence.target_market ? `
                <div class="data-section">
                    <h4>🎯 Target Market</h4>
                    <div class="data-grid">
                        <div class="data-item">
                            <label>Market Segment:</label>
                            <span>${intelligence.target_market.market_segment || 'Not specified'}</span>
                        </div>
                    </div>
                    ${intelligence.target_market.demographics && intelligence.target_market.demographics.length > 0 ? `
                        <div class="demographics">
                            <label>Demographics:</label>
                            <ul class="inline-list">
                                ${intelligence.target_market.demographics.map(demo => `<li>${demo}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Template for Search Queries display (Competitor, Keyword, Content)
function createSearchQueriesTemplate(queries, queryType) {
    if (!queries) {
        return '<div class="no-data">No search queries available</div>';
    }

    const typeConfig = {
        competitor: { icon: '🏆', title: 'Competitor Discovery Queries' },
        keyword: { icon: '🔑', title: 'Keyword Intelligence Queries' },
        content: { icon: '📄', title: 'Content Discovery Queries' }
    };

    const config = typeConfig[queryType] || { icon: '🔍', title: 'Search Queries' };

    return `
        <div class="formatted-data-display">
            <div class="queries-header">
                <h4>${config.icon} ${config.title}</h4>
                <p class="queries-description">Use these strategic queries to discover ${queryType} opportunities and insights</p>
            </div>

            ${Object.entries(queries).map(([category, queryList]) => {
                if (!Array.isArray(queryList) || queryList.length === 0) return '';
                
                return `
                    <div class="query-category">
                        <h5>${formatCategoryName(category)}</h5>
                        <div class="query-list">
                            ${queryList.map((query, index) => `
                                <div class="query-item">
                                    <div class="query-number">${index + 1}</div>
                                    <div class="query-text">${query}</div>
                                    <button class="copy-query-btn" onclick="copyQueryToClipboard('${query.replace(/'/g, "\\'")}', this)">
                                        📋 Copy
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}

            <div class="queries-usage">
                <div class="usage-tip">
                    <strong>💡 Usage Tip:</strong> Copy individual queries and test them in the search section to validate their effectiveness before using them at scale.
                </div>
            </div>
        </div>
    `;
}

// Template for Reddit Queries display
function createRedditQueriesTemplate(queries) {
    if (!queries || !Array.isArray(queries) || queries.length === 0) {
        return '<div class="no-data">No Reddit queries available</div>';
    }

    return `
        <div class="formatted-data-display">
            <div class="queries-header">
                <h4>💬 Reddit Discussion Queries</h4>
                <p class="queries-description">Strategic queries to find customer conversations and community discussions on Reddit</p>
            </div>

            <div class="reddit-queries-section">
                <div class="query-list">
                    ${queries.map((query, index) => `
                        <div class="query-item reddit-query">
                            <div class="query-number">${index + 1}</div>
                            <div class="query-text">${query}</div>
                            <button class="copy-query-btn" onclick="copyQueryToClipboard('${query.replace(/'/g, "\\'")}', this)">
                                📋 Copy
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="queries-usage">
                <div class="usage-tip">
                    <strong>💡 Usage Tip:</strong> Use these queries to find authentic customer discussions, pain points, and feedback in relevant Reddit communities.
                </div>
            </div>
        </div>
    `;
}

// NEW: Template for sub-tab empty states (reusable across all sub-tabs)
function createSubTabEmptyStateTemplate(subTabName, dependencies) {
    const emptyStateConfig = {
        businessSetup: {
            icon: '📋',
            title: 'Business Setup',
            description: 'Start by completing your business information to unlock other features.',
            nextStep: 'Fill out the form above to begin'
        },
        competitors: {
            icon: '🏆',
            title: 'Competitor Analysis Awaiting',
            description: 'Complete Business Setup first to discover and analyze your competitors automatically.',
            nextStep: 'Go to Business Setup to begin'
        },
        strategicIntelligence: {
            icon: '🧠',
            title: 'Strategic Intelligence Awaiting',
            description: 'Complete Business Setup first to generate your strategic market analysis and intelligence.',
            nextStep: 'Go to Business Setup to begin'
        },
        contentStrategy: {
            icon: '📋',
            title: 'Content Strategy Awaiting',
            description: 'Complete Business Setup first to generate your comprehensive content strategy.',
            nextStep: 'Go to Business Setup to begin'
        },
        searchIntelligence: {
            icon: '🔍',
            title: 'Search Intelligence Awaiting',
            description: 'Complete Business Profile setup to generate strategic search queries and discover content opportunities.',
            nextStep: 'Complete Business Profile first'
        },
        redditIntelligence: {
            icon: '💬',
            title: 'Reddit Intelligence Awaiting',
            description: 'Complete Business Profile setup to discover Reddit communities and generate discussion queries.',
            nextStep: 'Complete Business Profile first'
        },
        twitter: {
            icon: '🐦',
            title: 'Twitter Content Awaiting',
            description: 'Generate content briefs first to create Twitter content.',
            nextStep: 'Complete previous steps to unlock Twitter content generation'
        }
    };

    const config = emptyStateConfig[subTabName] || {
        icon: '⏳',
        title: 'Content Awaiting',
        description: 'Complete previous steps to unlock this feature.',
        nextStep: 'Check previous tabs'
    };

    return `
        <div class="sub-tab-empty-state">
            <div class="empty-state-icon">${config.icon}</div>
            <h3>${config.title}</h3>
            <p>${config.description}</p>
            <div class="arrow">←</div>
            <p class="next-step">${config.nextStep}</p>
        </div>
    `;
}

// Helper function to format category names
function formatCategoryName(category) {
    return category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/Queries$/, '')
        .trim();
}

// Helper function to copy individual queries
function copyQueryToClipboard(queryText, button) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(queryText).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(queryText, button);
        });
    } else {
        fallbackCopyToClipboard(queryText, button);
    }
}

// Export functions for global access
window.copyQueryToClipboard = copyQueryToClipboard;
window.createSubTabEmptyStateTemplate = createSubTabEmptyStateTemplate;