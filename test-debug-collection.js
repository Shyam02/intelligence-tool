const { crawlWebsite } = require('./services/websiteCrawler');

async function testDebugCollection() {
  console.log('🧪 Testing debug data collection...');
  
  try {
    // Test with a simple website
    const result = await crawlWebsite('https://example.com');
    
    console.log('\n📊 Debug Data Collected:');
    console.log('========================');
    
    if (global.crawlDebugData) {
      console.log('✅ Debug data found!');
      console.log('Website URL:', global.crawlDebugData.websiteUrl);
      console.log('Timestamp:', global.crawlDebugData.timestamp);
      console.log('Steps count:', global.crawlDebugData.steps?.length || 0);
      console.log('AI interactions count:', global.crawlDebugData.aiInteractions?.length || 0);
      console.log('Raw data available:', !!global.crawlDebugData.rawData);
      console.log('Final result available:', !!global.crawlDebugData.finalResult);
      
      console.log('\n📋 Steps:');
      global.crawlDebugData.steps?.forEach((step, index) => {
        console.log(`${index + 1}. ${step.step} - ${step.timestamp}`);
      });
      
      console.log('\n🤖 AI Interactions:');
      global.crawlDebugData.aiInteractions?.forEach((interaction, index) => {
        console.log(`${index + 1}. ${interaction.step} - ${interaction.timestamp}`);
        console.log(`   Prompt length: ${interaction.prompt?.length || 0} chars`);
        console.log(`   Response length: ${interaction.response?.length || 0} chars`);
        console.log(`   Has parsed data: ${!!interaction.parsedData}`);
      });
      
      console.log('\n📄 Raw Data Summary:');
      if (global.crawlDebugData.rawData) {
        console.log('Homepage content length:', global.crawlDebugData.rawData.homepageContent?.length || 0);
        console.log('Additional pages count:', global.crawlDebugData.rawData.additionalPages?.length || 0);
        console.log('Analysis method:', global.crawlDebugData.rawData.analysisMethod);
      }
      
    } else {
      console.log('❌ No debug data found!');
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDebugCollection(); 