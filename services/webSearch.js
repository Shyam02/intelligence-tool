// ===== services/webSearch.js =====
// Brave Search API service
const axios = require('axios');
const { config } = require('../config/config');

// Brave Search API function
async function searchBrave(query, count = config.brave.defaultCount) {
  try {
    console.log('🔍 Brave Search request for:', query);
    
    if (!config.braveApiKey) {
      throw new Error('Brave API key not configured');
    }

    const response = await axios.get(config.braveApiUrl, {
      params: {
        q: query,
        count: count,
        country: config.brave.country,
        spellcheck: config.brave.spellcheck,
        search_lang: config.brave.searchLang
      },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': config.braveApiKey
      }
    });

    console.log('✅ Brave Search response:', {
      status: response.status,
      hasWeb: !!response.data.web,
      webResultsCount: response.data.web?.results?.length || 0
    });

    return response.data;
    
  } catch (error) {
    console.error('Brave Search Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Brave API authentication failed. Check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Brave API rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(`Brave API request error: ${error.response?.data?.message || 'Bad request'}`);
    } else {
      throw new Error(`Brave Search Error: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Test Brave API connection
async function testBraveAPI() {
  try {
    if (!config.braveApiKey) {
      return { status: 'error', message: 'No Brave API key configured' };
    }
    
    const braveResult = await searchBrave('test search', 2);
    return { 
      status: 'success', 
      message: 'API key working', 
      results_found: braveResult.web?.results?.length || 0 
    };
    
  } catch (error) {
    return { status: 'error', message: 'Brave API test failed: ' + error.message };
  }
}

module.exports = {
  searchBrave,
  testBraveAPI
};
