// Main app initialization and clean global state

// Clean global state object - separates user input from AI-processed data
window.appState = {
    userInput: null,                    // Pure user form input
    websiteIntelligence: null,          // AI-extracted website data  
    foundationalIntelligence: null,     // Strategic business analysis
    searchResults: []                   // Search articles
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing with clean data structure...');
    
    // Initialize forms
    initializeForms();
    
    console.log('Application initialized successfully');
    console.log('Clean state structure:', Object.keys(window.appState));
});

// Global function wrappers for HTML onclick handlers
window.testAPI = testAPI;
window.crawlWebsiteAPI = crawlWebsiteAPI;
window.generateQueries = generateSearchQueries;
window.executeTestSearch = executeTestSearch;
window.generateTwitterBriefs = generateTwitterContentBriefs;
window.copyToClipboard = copyToClipboard;
window.resetForm = resetForm;
window.toggleArticleSelection = toggleArticleSelection;
window.selectAllArticles = selectAllArticles;
window.deselectAllArticles = deselectAllArticles;
window.copySelectedArticles = copySelectedArticles;
window.copyTweet = copyTweet;