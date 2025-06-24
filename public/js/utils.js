// Utility functions: Copy, reset, helpers

// Copy to clipboard functionality
function copyToClipboard(elementId, button) {
    const element = document.getElementById(elementId);
    const text = element.textContent;
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.log('Clipboard API failed, trying fallback:', err);
            fallbackCopyToClipboard(text, button);
        });
    } else {
        // Fallback for older browsers or non-HTTPS
        fallbackCopyToClipboard(text, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.top = '0';
        textarea.style.left = '0';
        document.body.appendChild(textarea);
        
        // Select and copy the text
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyError(button);
    }
}

function showCopySuccess(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = '✅ Copied!';
    button.style.background = '#48bb78';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground || '#4299e1';
    }, 2000);
}

function showCopyError(button) {
    const originalText = button.textContent;
    const originalBackground = button.style.background;
    
    button.textContent = '❌ Copy Failed';
    button.style.background = '#f56565';
    
    // Also show alert with manual copy instruction
    alert('Copy failed. Please manually select and copy the text from the box above.');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBackground || '#4299e1';
    }, 3000);
}

// Copy individual tweet
function copyTweet(tweetText, button) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(tweetText).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.log('Clipboard API failed:', err);
            fallbackCopyToClipboard(tweetText, button);
        });
    } else {
        fallbackCopyToClipboard(tweetText, button);
    }
}

// Reset form and application state with clean data structure
function resetForm() {
    // Reset all form data
    const form = document.getElementById('onboardingForm');
    form.reset();
    
    // Reset clean global state structure
    window.appState = {
        userInput: null,
        websiteIntelligence: null,
        foundationalIntelligence: null,
        searchResults: []
    };
    
    // Hide all result containers
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('queriesContainer').style.display = 'none';
    document.getElementById('categorySpecificSection').style.display = 'none';
    document.getElementById('searchResults').style.display = 'none';
    
    // Hide website intelligence section if it exists
    const websiteSection = document.getElementById('websiteIntelligenceSection');
    if (websiteSection) {
        websiteSection.style.display = 'none';
    }
    
    // Hide Twitter briefs if they exist
    const twitterBriefs = document.getElementById('twitterBriefs');
    if (twitterBriefs) {
        twitterBriefs.style.display = 'none';
    }
    
    // Hide crawled data display
    const crawledDataDisplay = document.getElementById('crawledDataDisplay');
    if (crawledDataDisplay) {
        crawledDataDisplay.style.display = 'none';
    }
    
    // Show form container
    document.querySelector('.form-container').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('✅ Application state reset with clean data structure');
}