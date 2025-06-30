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
        settings: true,                 // Settings is always available
        calendar: false,                // Future features
        performance: false,
        config: true
    },
    // Reddit-specific state
    discoveredSubreddits: [],           // Discovered relevant subreddits
    redditQueries: []                   // Generated Reddit search queries
};

// Tab configuration for header updates
const tabConfig = {
    setup: {
        title: 'Business Profile',
        subtitle: 'Set up your business foundation and strategic intelligence'
    },
    ideaSources: {
        title: 'Content Discovery',
        subtitle: 'Generate search queries and discover content ideas'
    },
    ideaBank: {
        title: 'Idea Bank',
        subtitle: 'Collect and manage your content ideas'
    },
    contentBriefs: {
        title: 'Content Briefs',
        subtitle: 'Transform ideas into strategic content plans'
    },
    settings: {
        title: 'Content Studio',
        subtitle: 'Generate and refine your final content'
    },
    calendar: {
        title: 'Content Calendar',
        subtitle: 'Schedule and manage your content timeline'
    },
    performance: {
        title: 'Performance Analytics',
        subtitle: 'Track your content performance and insights'
    },
    config: {
        title: 'Settings',
        subtitle: 'Configure your tools and preferences'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initializing with sidebar navigation and clean data structure...');
    
    // Initialize forms
    initializeForms();
    
    // Initialize sidebar navigation
    initializeSidebar();
    
    // Initialize Reddit monitoring
    initializeRedditMonitor();
    
    console.log('Application initialized successfully');
    console.log('Clean state structure:', Object.keys(window.appState));
});

// Initialize sidebar navigation system
function initializeSidebar() {
    // Set initial tab state
    switchTab('setup');
    updateTabAvailability();
    updateHeaderContent('setup');
    
    console.log('Sidebar navigation initialized');
}

// Switch between tabs with sidebar navigation
function switchTab(tabName) {
    // Hide all tab contents
    hideAllTabs();
    
    // Remove active class from all sidebar buttons
    document.querySelectorAll('.sidebar-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    showTab(tabName);
    
    // Update current tab in state
    window.appState.currentTab = tabName;
    
    // Update sidebar button styling
    const targetButton = document.getElementById(tabName + 'Tab');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update header content
    updateHeaderContent(tabName);
    
    // Update empty states
    updateEmptyStates();
    
    console.log('Switched to tab:', tabName);
}

// Update header content based on active tab
function updateHeaderContent(tabName) {
    const config = tabConfig[tabName];
    if (!config) return;
    
    const headerTitle = document.querySelector('.header-content h1');
    const headerSubtitle = document.querySelector('.header-content p');
    
    if (headerTitle) {
        headerTitle.textContent = config.title;
    }
    
    if (headerSubtitle) {
        headerSubtitle.textContent = config.subtitle;
    }
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
    const tabs = ['setup', 'ideaSources', 'ideaBank', 'contentBriefs', 'settings', 'calendar', 'performance', 'config'];
    
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
window.updateHeaderContent = updateHeaderContent;