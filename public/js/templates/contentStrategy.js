// Content Strategy Template Functions
// File path: /public/js/templates/contentStrategy.js

// Main content strategy template
function createContentStrategyTemplate(strategy) {
  if (!strategy || !strategy.content_strategy) {
    return '<div class="no-data">No content strategy data available</div>';
  }

  const { data_completeness, strategy_overview, channels, writing_style, resource_allocation } = strategy.content_strategy;

  return `
    <div class="content-strategy-container">
      ${createDataCompletenessAlert(data_completeness)}
      
      <div class="strategy-section">
        <h3>📊 Strategy Overview</h3>
        ${createStrategyOverviewTemplate(strategy_overview)}
      </div>

      <div class="strategy-section">
        <h3>📱 Channel Analysis & Recommendations</h3>
        ${createChannelAnalysisTemplate(channels)}
      </div>

      <div class="strategy-section">
        <h3>✍️ Writing Style & Voice Guidelines</h3>
        ${createWritingStyleTemplate(writing_style)}
      </div>

      <div class="strategy-section">
        <h3>🎯 Resource Allocation Framework</h3>
        ${createResourceAllocationTemplate(resource_allocation)}
      </div>
    </div>
  `;
}

// Data completeness alert template
function createDataCompletenessAlert(dataCompleteness) {
  if (dataCompleteness.score >= 80) {
    return '';
  }

  return `
    <div class="data-completeness-alert">
      <div class="alert-header">
        <span class="alert-icon">⚠️</span>
        <span class="alert-title">Strategy Based on Limited Data</span>
        <span class="completeness-score">${dataCompleteness.score}% Complete</span>
      </div>
      <div class="alert-content">
        <p>Your content strategy is based on ${dataCompleteness.score}% of available data. Consider completing the following for better recommendations:</p>
        <ul class="recommendations-list">
          ${dataCompleteness.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

// Strategy overview template
function createStrategyOverviewTemplate(overview) {
  return `
    <div class="strategy-overview">
      <div class="overview-grid">
        <div class="overview-item">
          <h4>✅ Recommended Channels</h4>
          <div class="channel-list">
            ${overview.recommended_channels.map(channel => `<span class="channel-tag primary">${formatChannelName(channel)}</span>`).join('')}
          </div>
        </div>
        
        <div class="overview-item">
          <h4>🔄 Secondary Channels</h4>
          <div class="channel-list">
            ${overview.secondary_channels.map(channel => `<span class="channel-tag secondary">${formatChannelName(channel)}</span>`).join('')}
          </div>
        </div>
        
        <div class="overview-item">
          <h4>❌ Avoid Channels</h4>
          <div class="channel-list">
            ${overview.avoid_channels.map(channel => `<span class="channel-tag avoid">${formatChannelName(channel)}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="reasoning-section">
        <h4>📝 Strategy Reasoning</h4>
        <p>${overview.reasoning}</p>
      </div>
    </div>
  `;
}

// Channel analysis template
function createChannelAnalysisTemplate(channels) {
  return Object.entries(channels).map(([channelName, channelData]) => `
    <div class="channel-card" data-channel="${channelName}">
      <div class="channel-header">
        <div class="channel-info">
          <h4>${formatChannelName(channelName)}</h4>
          <div class="suitability-score">
            <span class="score-number">${channelData.suitability_score}</span>
            <span class="score-label">/10</span>
          </div>
        </div>
        <div class="channel-reasoning">
          <p>${channelData.reasoning}</p>
        </div>
      </div>
      
      <div class="channel-content">
        <div class="channel-details">
          <div class="detail-item">
            <label>Target Audience:</label>
            <span>${channelData.target_audience}</span>
          </div>
          <div class="detail-item">
            <label>Content Types:</label>
            <span>${channelData.content_types.join(', ')}</span>
          </div>
          <div class="detail-item">
            <label>Posting Frequency:</label>
            <span>${channelData.posting_frequency}</span>
          </div>
          <div class="detail-item">
            <label>Best Times:</label>
            <span>${channelData.best_times.join(', ')}</span>
          </div>
          <div class="detail-item">
            <label>Key Metrics:</label>
            <span>${channelData.key_metrics.join(', ')}</span>
          </div>
        </div>
        
        <div class="hashtag-section">
          <h5>🏷️ Hashtag Strategy</h5>
          ${createHashtagPoolsTemplate(channelData.hashtag_pools)}
        </div>
        
        <div class="mention-section">
          <h5>👥 Mention Opportunities</h5>
          ${createMentionOpportunitiesTemplate(channelData.mention_opportunities)}
        </div>
      </div>
    </div>
  `).join('');
}

// Hashtag pools template
function createHashtagPoolsTemplate(hashtagPools) {
  return `
    <div class="hashtag-pools">
      ${Object.entries(hashtagPools).map(([category, hashtags]) => `
        <div class="hashtag-category">
          <h6>${formatCategoryName(category)}</h6>
          <div class="hashtag-list">
            ${hashtags.map(hashtag => `<span class="hashtag-tag">${hashtag}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Mention opportunities template
function createMentionOpportunitiesTemplate(mentionOpportunities) {
  return `
    <div class="mention-opportunities">
      ${Object.entries(mentionOpportunities).map(([category, mentions]) => `
        <div class="mention-category">
          <h6>${formatCategoryName(category)}</h6>
          <div class="mention-list">
            ${mentions.map(mention => `<span class="mention-tag">${mention}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Writing style template
function createWritingStyleTemplate(writingStyle) {
  return `
    <div class="writing-style">
      <div class="style-overview">
        <div class="style-item">
          <label>Brand Voice:</label>
          <span class="voice-tag">${formatCategoryName(writingStyle.brand_voice)}</span>
        </div>
        
        <div class="style-item">
          <label>Language Style:</label>
          <span>${formatCategoryName(writingStyle.language_style)}</span>
        </div>
      </div>
      
      <div class="personality-traits">
        <h5>🎭 Personality Traits</h5>
        <div class="traits-list">
          ${writingStyle.personality_traits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
        </div>
      </div>
      
      <div class="tone-preferences">
        <h5>🎵 Tone Preferences</h5>
        <div class="tone-grid">
          ${Object.entries(writingStyle.tone_preferences).map(([aspect, preference]) => `
            <div class="tone-item">
              <label>${formatCategoryName(aspect)}:</label>
              <span>${formatCategoryName(preference)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="key-phrases">
        <h5>💬 Key Phrases</h5>
        <div class="phrases-list">
          ${writingStyle.key_phrases.map(phrase => `<span class="phrase-tag">"${phrase}"</span>`).join('')}
        </div>
      </div>
      
      <div class="content-principles">
        <h5>📋 Content Principles</h5>
        <ul class="principles-list">
          ${writingStyle.content_principles.map(principle => `<li>${principle}</li>`).join('')}
        </ul>
      </div>
      
      <div class="dos-donts">
        <div class="dos-section">
          <h5>✅ Do's</h5>
          <ul class="dos-list">
            ${writingStyle.dos_and_donts.dos.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        
        <div class="donts-section">
          <h5>❌ Don'ts</h5>
          <ul class="donts-list">
            ${writingStyle.dos_and_donts.donts.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Resource allocation template
function createResourceAllocationTemplate(resourceAllocation) {
  return `
    <div class="resource-allocation">
      <div class="priority-ranking">
        <h5>📊 Channel Priority Ranking</h5>
        <div class="priority-list">
          ${resourceAllocation.priority_ranking.map((item, index) => `
            <div class="priority-item" data-priority="${item.priority}">
              <div class="priority-number">${item.priority}</div>
              <div class="priority-details">
                <div class="channel-name">${formatChannelName(item.channel)}</div>
                <div class="priority-status">
                  <span class="status-badge ${item.status}">${item.status}</span>
                  <span class="focus-level">${item.focus_level} focus</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Helper function to format channel names
function formatChannelName(channel) {
  return channel
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Helper function to format category names
function formatCategoryName(category) {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

// Export functions for global access
window.createContentStrategyTemplate = createContentStrategyTemplate;
