// Form handling and dynamic questions

// Initialize form event listeners
function initializeForms() {
    const form = document.getElementById('onboardingForm');
    const launchDateInput = document.getElementById('launchDate');
    const websiteUrlInput = document.getElementById('websiteUrl');
    
    // Add event listeners
    launchDateInput.addEventListener('change', updateCategoryQuestions);
    websiteUrlInput.addEventListener('input', updateCategoryQuestions);
    form.addEventListener('submit', handleFormSubmission);
}

// Update category-specific questions based on form inputs
function updateCategoryQuestions() {
    const launchDate = document.getElementById('launchDate').value;
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    const categorySpecificSection = document.getElementById('categorySpecificSection');
    
    if (!launchDate) {
        categorySpecificSection.style.display = 'none';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl !== '';
    
    let category = '';
    if (isPreLaunch && !hasWebsite) {
        category = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        category = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        category = 'Post-launch + No website';
    } else {
        category = 'Post-launch + Has website';
    }
    
    generateCategoryQuestions(category);
    categorySpecificSection.style.display = 'block';
}

// Generate dynamic questions based on business category
function generateCategoryQuestions(category) {
    const categoryQuestions = document.getElementById('categoryQuestions');
    let questionsHTML = `<p class="category-indicator"><strong>Category: ${category}</strong></p>`;
    
    switch(category) {
        case 'Pre-launch + No website':
            questionsHTML += `
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Pre-launch + Has website':
            questionsHTML += `
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Post-launch + No website':
            questionsHTML += `
                <div class="form-group">
                    <label for="customerAcquisition">How do customers currently find/buy from you?</label>
                    <input type="text" id="customerAcquisition" name="customerAcquisition" placeholder="e.g., App store, marketplace, direct contact" required>
                </div>
                <div class="form-group">
                    <label for="businessDescription">Describe your business in 1-2 sentences</label>
                    <textarea id="businessDescription" name="businessDescription" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                </div>
            `;
            break;
            
        case 'Post-launch + Has website':
            questionsHTML += `
                <div class="form-group">
                    <label for="additionalInfo">Anything specific about your business we should know that might not be on your website?</label>
                    <textarea id="additionalInfo" name="additionalInfo" rows="3"></textarea>
                    <p class="help-text">Help us understand details that might not be public yet, such as: Recent changes in strategy or focus, New features or updates not yet on the website, Behind-the-scenes challenges or wins, Target customer insights you've learned, Competitors you're most concerned about, Revenue milestones or growth metrics, Team updates or hiring plans, Upcoming launches or announcements</p>
                </div>
            `;
            break;
    }
    
    categoryQuestions.innerHTML = questionsHTML;
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const onboardingData = {};
    
    for (let [key, value] of formData.entries()) {
        onboardingData[key] = value;
    }
    
    // Add calculated category
    const launchDate = onboardingData.launchDate;
    const websiteUrl = onboardingData.websiteUrl;
    const today = new Date().toISOString().split('T')[0];
    const isPreLaunch = launchDate > today;
    const hasWebsite = websiteUrl && websiteUrl.trim() !== '';
    
    if (isPreLaunch && !hasWebsite) {
        onboardingData.category = 'Pre-launch + No website';
    } else if (isPreLaunch && hasWebsite) {
        onboardingData.category = 'Pre-launch + Has website';
    } else if (!isPreLaunch && !hasWebsite) {
        onboardingData.category = 'Post-launch + No website';
    } else {
        onboardingData.category = 'Post-launch + Has website';
    }
    
    // Store data globally
    window.currentOnboardingData = onboardingData;
    
    // Show loading
    document.querySelector('.form-container').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    try {
        // Generate intelligence using API
        const intelligence = await generateIntelligence(onboardingData);
        window.currentIntelligence = intelligence;
        
        // Hide loading and show results
        document.getElementById('loading').style.display = 'none';
        displayIntelligenceResults(onboardingData, intelligence);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Error generating intelligence: ' + error.message);
        document.querySelector('.form-container').style.display = 'block';
    }
}