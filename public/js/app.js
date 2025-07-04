// Main app initialization and clean global state with sub-tab management

// Clean global state object - separates user input from AI-processed data
window.appState = {
    userInput: null,                    // Pure user form input
    websiteIntelligence: null,          // AI-extracted website data  
    foundationalIntelligence: null,     // Strategic business analysis
    searchResults: [],                  // Search articles + Reddit posts (unified)
    currentTab: 'setup',                // Current active tab
    currentSubTabs: {                   // Current active sub-tabs for each main tab
        setup: 'businessSetup',
        ideaSources: 'searchIntelligence',
        settings: 'twitter',
        config: 'apiConfig'
    },
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
            subTabsCompleted: {                 // Track which sub-tabs have been completed
            setup: {
                businessSetup: false,
                competitors: false,
                strategicIntelligence: false,
                contentStrategy: false
            },
        ideaSources: {
            searchIntelligence: false,
            redditIntelligence: false
        },
        settings: {
            twitter: false
        },
        config: {
            apiConfig: false,
            systemDebug: false
        }
    },
    // Reddit-specific state
    discoveredSubreddits: [],           // Discovered relevant subreddits
    redditQueries: [],                   // Generated Reddit search queries
    debugLogs: []
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
    console.log('Application initializing with sidebar navigation and sub-tab management...');
    
    // Initialize forms
    initializeForms();
    
    // Initialize sidebar navigation
    initializeSidebar();
    
    // Initialize sub-tab navigation
    initializeSubTabs();
    
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

// Initialize sub-tab system
function initializeSubTabs() {
    // Initialize default sub-tabs for each main tab
    switchSubTab('setup', 'businessSetup');
    switchSubTab('ideaSources', 'searchIntelligence');
    switchSubTab('settings', 'twitter');
    switchSubTab('config', 'apiConfig');
    
    // Update sub-tab availability based on current state
    updateSubTabAvailability();
    
    console.log('Sub-tab navigation initialized');
}

// Switch between main tabs with sidebar navigation
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
    
    // Switch to the current sub-tab for this main tab
    if (window.appState.currentSubTabs[tabName]) {
        switchSubTab(tabName, window.appState.currentSubTabs[tabName]);
    }
    
    // Update empty states
    updateEmptyStates();
    
    console.log('Switched to tab:', tabName);
}

// NEW: Switch between sub-tabs within a main tab
function switchSubTab(parentTab, subTab) {
    // Hide all sub-tab contents for this parent tab
    hideAllSubTabs(parentTab);
    
    // Remove active class from all sub-nav buttons for this parent tab
    const parentTabContent = document.getElementById(parentTab + 'TabContent');
    if (parentTabContent) {
        parentTabContent.querySelectorAll('.sub-nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Show selected sub-tab content
    showSubTab(parentTab, subTab);
    
    // Update current sub-tab in state
    window.appState.currentSubTabs[parentTab] = subTab;
    
    // Update sub-nav button styling
    const targetButton = document.getElementById(subTab + 'SubTab');
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Update sub-tab empty states
    updateSubTabEmptyStates(parentTab, subTab);
    
    console.log('Switched to sub-tab:', parentTab, '->', subTab);
    
    // Add this logic to the switchSubTab function, after showing the sub-tab content:
    if (parentTab === 'setup' && subTab === 'contentStrategy') {
        if (window.appState.contentStrategy) {
            displayContentStrategy(window.appState.contentStrategy);
        } else if (typeof showContentStrategyEmptyState === 'function') {
            showContentStrategyEmptyState();
        }
    }
    
    if (parentTab === 'config' && subTab === 'systemDebug') {
        fetchDebugLogs();
    }
}

// Hide all sub-tab contents for a parent tab
function hideAllSubTabs(parentTab) {
    const parentTabContent = document.getElementById(parentTab + 'TabContent');
    if (parentTabContent) {
        parentTabContent.querySelectorAll('.sub-tab-content').forEach(content => {
            content.classList.remove('active');
        });
    }
}

// Show specific sub-tab content
function showSubTab(parentTab, subTab) {
    const subTabContent = document.getElementById(subTab + 'SubTabContent');
    if (subTabContent) {
        subTabContent.classList.add('active');
    }
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

// NEW: Update sub-tab availability based on dependencies
function updateSubTabAvailability() {
    const businessSetupCompleted = window.appState.tabsCompleted.setup;
    const ideaSourcesCompleted = window.appState.tabsCompleted.ideaSources;
    const ideaBankCompleted = window.appState.tabsCompleted.ideaBank;
    const contentBriefsCompleted = window.appState.tabsCompleted.contentBriefs;
    
    // Business Profile sub-tabs
    updateSubTabButton('competitorsSubTab', businessSetupCompleted);
    updateSubTabButton('strategicIntelligenceSubTab', businessSetupCompleted);
    updateSubTabButton('contentStrategySubTab', businessSetupCompleted);
    
    // Content Discovery sub-tabs (both depend on business setup)
    updateSubTabButton('searchIntelligenceSubTab', businessSetupCompleted);
    updateSubTabButton('redditIntelligenceSubTab', businessSetupCompleted);
    
    // Content Studio sub-tabs
    updateSubTabButton('twitterSubTab', contentBriefsCompleted);
}

// Helper function to update sub-tab button state
function updateSubTabButton(buttonId, isEnabled) {
    const button = document.getElementById(buttonId);
    if (button) {
        if (isEnabled) {
            button.classList.remove('sub-tab-disabled');
            button.disabled = false;
        } else {
            button.classList.add('sub-tab-disabled');
            button.disabled = true;
        }
    }
}

// NEW: Update empty states for sub-tabs
function updateSubTabEmptyStates(parentTab, subTab) {
    const businessSetupCompleted = window.appState.tabsCompleted.setup;
    const ideaSourcesCompleted = window.appState.tabsCompleted.ideaSources;
    const ideaBankCompleted = window.appState.tabsCompleted.ideaBank;
    const contentBriefsCompleted = window.appState.tabsCompleted.contentBriefs;
    
    // Hide all empty states for this parent tab first
    const parentTabContent = document.getElementById(parentTab + 'TabContent');
    if (parentTabContent) {
        parentTabContent.querySelectorAll('.sub-tab-empty-state').forEach(emptyState => {
            emptyState.style.display = 'none';
        });
    }
    
    // Show appropriate empty state based on dependencies
    let showEmptyState = false;
    let emptyStateId = '';
    
    switch (parentTab + '.' + subTab) {
        case 'setup.competitors':
            showEmptyState = !businessSetupCompleted;
            emptyStateId = 'competitorsEmptyState';
            break;
        case 'setup.strategicIntelligence':
            showEmptyState = !businessSetupCompleted;
            emptyStateId = 'strategicIntelligenceEmptyState';
            break;
        case 'setup.contentStrategy':
            showEmptyState = !businessSetupCompleted;
            emptyStateId = 'contentStrategyEmptyState';
            break;
        case 'ideaSources.searchIntelligence':
            showEmptyState = !businessSetupCompleted;
            emptyStateId = 'searchIntelligenceEmptyState';
            break;
        case 'ideaSources.redditIntelligence':
            showEmptyState = !businessSetupCompleted;
            emptyStateId = 'redditIntelligenceEmptyState';
            break;
        case 'settings.twitter':
            showEmptyState = !contentBriefsCompleted;
            emptyStateId = 'twitterEmptyState';
            break;
    }
    
    // Show/hide the appropriate empty state
    if (showEmptyState && emptyStateId) {
        const emptyState = document.getElementById(emptyStateId);
        if (emptyState) {
            emptyState.style.display = 'block';
        }
    }
}

// Mark tab as completed
function markTabCompleted(tabName) {
    window.appState.tabsCompleted[tabName] = true;
    updateTabAvailability();
    updateSubTabAvailability();
    console.log('Tab marked as completed:', tabName);
}

// NEW: Mark sub-tab as completed
function markSubTabCompleted(parentTab, subTab) {
    if (window.appState.subTabsCompleted[parentTab]) {
        window.appState.subTabsCompleted[parentTab][subTab] = true;
    }
    updateSubTabAvailability();
    console.log('Sub-tab marked as completed:', parentTab + '.' + subTab);
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
    
    // Update sub-tab empty states for current tab
    const currentTab = window.appState.currentTab;
    const currentSubTab = window.appState.currentSubTabs[currentTab];
    if (currentSubTab) {
        updateSubTabEmptyStates(currentTab, currentSubTab);
    }
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
window.switchSubTab = switchSubTab;
window.markTabCompleted = markTabCompleted;
window.markSubTabCompleted = markSubTabCompleted;
window.updateEmptyStates = updateEmptyStates;
window.updateSubTabAvailability = updateSubTabAvailability;
window.updateHeaderContent = updateHeaderContent;

// At the end of forms.js (or wherever displayContentStrategy and showContentStrategyEmptyState are defined):
window.displayContentStrategy = displayContentStrategy;
window.showContentStrategyEmptyState = showContentStrategyEmptyState;