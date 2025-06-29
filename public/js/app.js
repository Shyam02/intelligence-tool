// Main app initialization and clean global state

// Clean global state object - separates user input from AI-processed data
window.appState = {
    userInput: null,                    // Pure user form input
    websiteIntelligence: null,          // AI-extracted website data  
    foundationalIntelligence: null,     // Strategic business analysis
    searchResults: [],                  // Search articles + Reddit posts (unified)
    currentTab: 'setup',                // Current active tab
    tabsCompleted: {                    // Track which tabs have been completed
        setup: false,
        ideaSources: false,
        ideaBank: false,
        contentBriefs: false,
        settings: true                  // Settings is always available
    },
    // Reddit-specific state
    discoveredSubreddits: [],           // Discovered relevant subreddits
    redditQueries: []                   // Generated Reddit search queries
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing with clean data structure and tab navigation...');
    
    // Initialize forms
    initializeForms();
    
    // Initialize tab system
    initializeTabs();
    
    // Initialize Reddit monitoring
    initializeRedditMonitor();
    
    console.log('Application initialized successfully');
    console.log('Clean state structure:', Object.keys(window.appState));
});

// Initialize tab system
function initializeTabs() {
    // Set initial tab state
    switchTab('setup');
    updateTabAvailability();
    
    console.log('Tab system initialized');
}

// Switch between tabs
function switchTab(tabName) {
    // Hide all tab contents
    hideAllTabs();
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    showTab(tabName);
    
    // Update current tab in state
    window.appState.currentTab = tabName;
    
    // Update tab button styling
    const targetButton = document.getElementById(tabName + 'Tab');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update empty states
    updateEmptyStates();
    
    console.log('Switched to tab:', tabName);
}

// Show specific tab content
function showTab(tabId) {
    const tabContent = document.getElementById(tabId + 'TabContent');
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// Hide all tab contents
function hideAllTabs() {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
}

// Update tab availability based on completion status
function updateTabAvailability() {
    const tabs = ['setup', 'ideaSources', 'ideaBank', 'contentBriefs', 'settings'];
    
    tabs.forEach(tabName => {
        const tabButton = document.getElementById(tabName + 'Tab');
        if (tabButton) {
            if (window.appState.tabsCompleted[tabName]) {
                tabButton.classList.add('completed');
            } else {
                tabButton.classList.remove('completed');
            }
        }
    });
}

// Mark tab as completed
function markTabCompleted(tabName) {
    window.appState.tabsCompleted[tabName] = true;
    updateTabAvailability();
    console.log('Tab marked as completed:', tabName);
}

// Update empty states for tabs
function updateEmptyStates() {
    // Idea Sources empty state
    const ideaSourcesEmpty = document.getElementById('ideaSourcesEmpty');
    const queriesContainer = document.getElementById('queriesContainer');
    if (ideaSourcesEmpty && queriesContainer) {
        if (window.appState.tabsCompleted.setup && queriesContainer.style.display === 'none') {
            ideaSourcesEmpty.style.display = 'block';
        } else {
            ideaSourcesEmpty.style.display = 'none';
        }
    }
    
    // Idea Bank empty state
    const ideaBankEmpty = document.getElementById('ideaBankEmpty');
    const searchResults = document.getElementById('searchResults');
    if (ideaBankEmpty && searchResults) {
        if (searchResults.style.display === 'none') {
            ideaBankEmpty.style.display = 'block';
        } else {
            ideaBankEmpty.style.display = 'none';
        }
    }
    
    // Content Briefs empty state
    const contentBriefsEmpty = document.getElementById('contentBriefsEmpty');
    const contentBriefs = document.getElementById('contentBriefs');
    if (contentBriefsEmpty && contentBriefs) {
        if (contentBriefs.style.display === 'none') {
            contentBriefsEmpty.style.display = 'block';
        } else {
            contentBriefsEmpty.style.display = 'none';
        }
    }
    
    // Update Reddit monitor status
    updateRedditMonitorStatus();
}

// Global function wrappers for HTML onclick handlers
window.testAPI = testAPI;
window.crawlWebsiteAPI = crawlWebsiteAPI;
// Point directly to the webSearch.js function to avoid circular calls
window.generateQueries = generateQueries;
window.executeTestSearch = executeTestSearch;
window.generateContentBriefs = generateContentBriefs;
window.copyToClipboard = copyToClipboard;
window.resetForm = resetForm;
window.toggleArticleSelection = toggleArticleSelection;
window.selectAllArticles = selectAllArticles;
window.deselectAllArticles = deselectAllArticles;
window.copySelectedArticles = copySelectedArticles;
window.copyTweet = copyTweet;

// UPDATED: Reddit function wrappers - added new functions
window.discoverSubreddits = discoverRelevantSubreddits;
window.generateRedditQueries = generateRedditQueries;
window.executeTestRedditSearch = executeTestRedditSearch;

// Tab navigation functions for global access
window.switchTab = switchTab;
window.markTabCompleted = markTabCompleted;
window.updateEmptyStates = updateEmptyStates;