// Configuration management
require('dotenv').config();

const config = {
    // Server configuration
    port: process.env.PORT || 3000,
    
    // API Keys
    claudeApiKey: process.env.CLAUDE_API_KEY,
    braveApiKey: process.env.BRAVE_API_KEY,
    
    // API URLs
    claudeApiUrl: 'https://api.anthropic.com/v1/messages',
    braveApiUrl: 'https://api.search.brave.com/res/v1/web/search',
    
    // API Configuration
    claude: {
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000,
        anthropicVersion: '2023-06-01'
    },
    
    brave: {
        defaultCount: 8,
        country: 'us',
        spellcheck: 1,
        searchLang: 'en'
    }
};

// Validation
function validateConfig() {
    const errors = [];
    
    if (!config.claudeApiKey) {
        errors.push('CLAUDE_API_KEY environment variable is required');
    } else if (!config.claudeApiKey.startsWith('sk-ant-')) {
        errors.push('CLAUDE_API_KEY appears to be invalid (should start with sk-ant-)');
    }
    
    if (!config.braveApiKey) {
        errors.push('BRAVE_API_KEY environment variable is required');
    }
    
    if (errors.length > 0) {
        console.error('Configuration errors:');
        errors.forEach(error => console.error(`  - ${error}`));
        return false;
    }
    
    return true;
}

module.exports = {
    config,
    validateConfig
};