// Main app initialization and global state

// Global state object - replaces scattered global variables
window.appState = {
    onboarding: null,
    intelligence: null,
    crawledData: null,
    searchResults: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    // Initialize forms
    initializeForms();
    
    console.log('Application initialized successfully');
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