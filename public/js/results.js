// Results display management

// Display intelligence generation results
function displayIntelligenceResults(onboardingData, intelligence) {
    // Display onboarding data
    document.getElementById('onboardingDataOutput').textContent = JSON.stringify(onboardingData, null, 2);
    
    // Display intelligence data
    document.getElementById('intelligenceOutput').textContent = JSON.stringify(intelligence, null, 2);
    
    // Show results container
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}