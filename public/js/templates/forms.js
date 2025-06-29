// Dynamic Form Template Functions
// File path: /public/js/templates/forms.js

// Template for category-specific questions
function createCategoryQuestionsTemplate(category) {
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
                    <p class="help-text">Add details that might not be clear from your website</p>
                </div>
                <div class="form-group">
                    <label for="targetCustomer">Who is your target customer?</label>
                    <input type="text" id="targetCustomer" name="targetCustomer" required>
                    <p class="help-text">Be more specific than what's on your website if needed</p>
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
    
    return questionsHTML;
}