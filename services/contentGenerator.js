// Content Generator Service - Transform briefs into final, ready-to-post content
const { callClaudeAPI } = require('./ai');
const { content } = require('../prompts');

// Main function to generate content from briefs
async function generateContentFromBriefs(briefs, businessContext, regenerateOptions = null) {
  try {
    console.log('🎨 Starting content generation for', briefs.length, 'briefs');
    
    // Prepare comprehensive context for content generation
    const generationContext = {
      business_context: businessContext || {},
      regenerate_options: regenerateOptions || {},
      timestamp: new Date().toISOString()
    };
    
    // Use content generation prompt
    const contentPrompt = content.contentGenerationPrompt(briefs, generationContext);
    const contentResponse = await callClaudeAPI(contentPrompt, false, null, 'Content Generation');
    
    // Parse the response
    let generatedContent;
    try {
      const jsonMatch = contentResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed generated content');
      } else {
        throw new Error('No JSON found in content generation response');
      }
    } catch (parseError) {
      console.error('Failed to parse generated content:', parseError);
      return createFallbackContentResponse(briefs, parseError.message);
    }
    
    // Validate and enhance the response
    const validatedContent = validateAndEnhanceContent(generatedContent, briefs);
    
    console.log('✅ Content generation completed successfully');
    return validatedContent;
    
  } catch (error) {
    console.error('Content generation failed:', error);
    return createFallbackContentResponse(briefs, error.message);
  }
}

// Validate and enhance generated content
function validateAndEnhanceContent(generatedContent, originalBriefs) {
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
      total_briefs_processed: originalBriefs.length,
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
function createFallbackContentResponse(briefs, errorMessage) {
  console.log('🔧 Creating fallback content response due to error:', errorMessage);
  
  const fallbackContent = {
    success: false,
    error_message: errorMessage,
    generated_content: briefs.map((brief, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      brief_id: brief.brief_id || `brief_${index}`,
      brief_angle: brief.angle || 'Unknown angle',
      content_type: brief.content_type || 'single_tweet',
      final_content: `[Content generation failed for: ${brief.angle || 'this brief'}]`,
      character_count: 0,
      within_limit: true,
      status: 'generation_failed',
      generation_timestamp: new Date().toISOString(),
      error: errorMessage
    })),
    generation_summary: {
      total_briefs_processed: briefs.length,
      total_generated: 0,
      single_tweets: 0,
      threads: 0,
      generation_failed: briefs.length,
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
                            (brief.angle || '').includes('how to') ||
                            (brief.angle || '').includes('step by step');
  
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