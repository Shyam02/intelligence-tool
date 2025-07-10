// Content Generator Service - Transform briefs into final, ready-to-post content
const { callClaudeAPI } = require('./ai');
const { content } = require('../prompts');

// Main function to generate content from strategic briefs
async function generateContentFromBriefs(strategicBriefs, businessContext, regenerateOptions = null) {
  try {
    console.log('🎨 Starting content generation for', strategicBriefs.length, 'strategic briefs');
    
    // Prepare comprehensive context for content generation
    const generationContext = {
      business_context: businessContext || {},
      regenerate_options: regenerateOptions || {},
      timestamp: new Date().toISOString()
    };
    
    // Use content generation prompt with strategic briefs
    const contentPrompt = content.contentGenerationPrompt(strategicBriefs, generationContext);
    const contentResponse = await callClaudeAPI(contentPrompt, false, null, 'Content Generation');
    
    // Parse the response with better error handling
let generatedContent;
try {
  // First, try to find and clean the JSON
  const jsonMatch = contentResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    let jsonString = jsonMatch[0];
    
    // Clean common JSON issues
    jsonString = jsonString
      .replace(/\r\n/g, '\\n')  // Replace actual newlines with escaped newlines
      .replace(/\n/g, '\\n')    // Replace \n with \\n
      .replace(/\r/g, '\\r')    // Replace \r with \\r
      .replace(/\t/g, '\\t')    // Replace \t with \\t
      .replace(/\f/g, '\\f')    // Replace \f with \\f
      .replace(/\b/g, '\\b');   // Replace \b with \\b
    
    console.log('🧹 Cleaned JSON string for parsing');
    generatedContent = JSON.parse(jsonString);
    console.log('✅ Successfully parsed generated content');
  } else {
    throw new Error('No JSON found in content generation response');
  }
} catch (parseError) {
  console.error('❌ JSON parsing failed:', parseError.message);
  console.log('📄 Raw response sample:', contentResponse.substring(0, 500));
  
  // Try a more aggressive cleanup
  try {
    console.log('🔄 Attempting aggressive JSON cleanup...');
    let cleanResponse = contentResponse
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
      .replace(/\\/g, '\\\\')          // Escape backslashes
      .replace(/"/g, '\\"')            // Escape quotes
      .replace(/\n/g, '\\n')           // Escape newlines
      .replace(/\r/g, '\\r')           // Escape carriage returns
      .replace(/\t/g, '\\t');          // Escape tabs
    
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      generatedContent = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed with aggressive cleanup');
    } else {
      throw new Error('No valid JSON found after cleanup');
    }
  } catch (secondParseError) {
    console.error('❌ Aggressive cleanup also failed:', secondParseError.message);
    return createFallbackContentResponse(strategicBriefs, `JSON parsing failed: ${parseError.message}`);
  }
}
    
    // Validate and enhance the response
    // Validate and enhance the response
    const validatedContent = validateAndEnhanceContent(generatedContent, strategicBriefs);
    
    console.log('✅ Content generation completed successfully');
    return validatedContent;
    
  } catch (error) {
    console.error('Content generation failed:', error);
    return createFallbackContentResponse(strategicBriefs, error.message);
  }
}

// Validate and enhance generated content
function validateAndEnhanceContent(generatedContent, originalStrategicBriefs) {
  try {
    // Ensure required structure exists
    if (!generatedContent.generated_content) {
      generatedContent.generated_content = [];
    }
    
    // Add metadata to each generated piece
    generatedContent.generated_content.forEach((contentPiece, index) => {
      if (!contentPiece.id) {
        contentPiece.id = `generated_${Date.now()}_${index}`;
      }
      
      if (!contentPiece.generation_timestamp) {
        contentPiece.generation_timestamp = new Date().toISOString();
      }
      
      if (!contentPiece.status) {
        contentPiece.status = 'generated';
      }
      
      // Validate content format
      if (contentPiece.content_type === 'single_tweet') {
        contentPiece.character_count = contentPiece.final_content ? contentPiece.final_content.length : 0;
        contentPiece.within_limit = contentPiece.character_count <= 280;
      } else if (contentPiece.content_type === 'thread') {
        if (contentPiece.thread_tweets && Array.isArray(contentPiece.thread_tweets)) {
          contentPiece.thread_length = contentPiece.thread_tweets.length;
          contentPiece.thread_tweets.forEach((tweet, tweetIndex) => {
            tweet.character_count = tweet.length;
            tweet.within_limit = tweet.length <= 280;
            tweet.thread_position = tweetIndex + 1;
          });
        }
      }
    });
    
    // Add generation summary
    generatedContent.generation_summary = {
      total_briefs_processed: originalStrategicBriefs.length,
      total_generated: generatedContent.generated_content.length,
      single_tweets: generatedContent.generated_content.filter(c => c.content_type === 'single_tweet').length,
      threads: generatedContent.generated_content.filter(c => c.content_type === 'thread').length,
      generation_timestamp: new Date().toISOString()
    };
    
    console.log('📊 Content validation completed:', generatedContent.generation_summary);
    return generatedContent;
    
  } catch (error) {
    console.error('Content validation failed:', error);
    return generatedContent; // Return as-is if validation fails
  }
}

// Create fallback response when generation fails
function createFallbackContentResponse(strategicBriefs, errorMessage) {
  console.log('🔧 Creating fallback content response due to error:', errorMessage);
  
  const fallbackContent = {
    success: false,
    error_message: errorMessage,
    generated_content: strategicBriefs.map((brief, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      brief_id: brief.brief_id || `brief_${index}`,
      brief_angle: brief.content_angle || 'Unknown angle',
      content_type: brief.content_type || 'single_tweet',
      final_content: `[Content generation failed for: ${brief.content_angle || 'this brief'}]`,
      character_count: 0,
      within_limit: true,
      status: 'generation_failed',
      generation_timestamp: new Date().toISOString(),
      error: errorMessage
    })),
    generation_summary: {
      total_briefs_processed: strategicBriefs.length,
      total_generated: 0,
      single_tweets: 0,
      threads: 0,
      generation_failed: strategicBriefs.length,
      generation_timestamp: new Date().toISOString(),
      error: errorMessage
    }
  };
  
  return fallbackContent;
}

// Helper function to estimate thread requirements
function shouldCreateThread(brief) {
  // Determine if content should be a thread based on brief complexity
  const contentLength = (brief.content || '').length;
  const hasMultiplePoints = (brief.content || '').split('.').length > 3;
  const isExplainerContent = (brief.engagement_strategy || '').includes('explanation') || 
  (brief.content_angle || '').includes('how to') ||
  (brief.content_angle || '').includes('step by step');
  
  return contentLength > 200 || hasMultiplePoints || isExplainerContent;
}

// Helper function to count characters accurately
function getAccurateCharacterCount(text) {
  // Account for Twitter's character counting (URLs, mentions, etc.)
  return text.length; // Simplified for now, can be enhanced later
}

module.exports = {
  generateContentFromBriefs,
  validateAndEnhanceContent,
  createFallbackContentResponse,
  shouldCreateThread,
  getAccurateCharacterCount
};