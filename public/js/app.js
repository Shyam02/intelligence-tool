// Main app initialization and global variables

// Global variables
window.currentOnboardingData = null;
window.currentIntelligence = null;
window.foundArticles = []; // Store articles globally for selection

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing...');
    
    // Initialize forms
    initializeForms();
    
    console.log('Application initialized successfully');
});

// Global function wrappers for HTML onclick handlers
window.testAPI = testAPI;
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