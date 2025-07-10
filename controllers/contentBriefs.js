// Content briefs controller - UPDATED to fetch full article content
const { callClaudeAPI } = require('../services/ai');
const { content } = require('../prompts');
const { fetchSelectedArticlesContent } = require('../services/articleContentFetcher'); // NEW IMPORT

// Generate content briefs from search results - ENHANCED with full content fetching
async function generateContentBriefs(req, res) {
  try {
    const { articles, businessContext } = req.body;
    
    // Initialize debug data
    global.contentBriefsDebugData = {
      timestamp: new Date().toISOString(),
      input: { articles, businessContext },
      steps: [],
      error: null,
      summary: null
    };
    
    global.contentBriefsDebugData.steps.push({
      step: 'input_received',
      timestamp: new Date().toISOString(),
      articlesCount: articles ? articles.length : 0,
      businessContextPresent: !!businessContext,
      logic: {
        description: 'Receive articles and business context for content briefs generation',
        sourceFile: 'controllers/contentBriefs.js',
        functionName: 'generateContentBriefs()'
      }
    });
    
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      global.contentBriefsDebugData.error = 'Articles array is required';
      return res.status(400).json({ error: 'Articles array is required' });
    }

    // NEW STEP: Fetch full content for all selected articles
    console.log(`📖 Fetching full content for ${articles.length} articles before generating briefs...`);
    
    global.contentBriefsDebugData.steps.push({
      step: 'content_fetching_started',
      timestamp: new Date().toISOString(),
      articlesToFetch: articles.length,
      logic: {
        description: 'Fetch full content for selected articles using existing website crawler',
        sourceFile: 'services/articleContentFetcher.js',
        functionName: 'fetchSelectedArticlesContent()'
      }
    });

    let enrichedArticles;
    try {
      enrichedArticles = await fetchSelectedArticlesContent(articles);
      
      const successCount = enrichedArticles.filter(a => a.contentFetched).length;
      const failureCount = enrichedArticles.length - successCount;
      
      global.contentBriefsDebugData.steps.push({
        step: 'content_fetching_complete',
        timestamp: new Date().toISOString(),
        totalArticles: enrichedArticles.length,
        successfulFetches: successCount,
        failedFetches: failureCount,
        enrichedArticles: enrichedArticles.map(a => ({
          title: a.title,
          url: a.url,
          contentFetched: a.contentFetched,
          contentLength: a.contentLength,
          fetchError: a.fetchError || null
        })),
        logic: {
          description: 'Full article content fetched using existing website crawler infrastructure',
          sourceFile: 'services/articleContentFetcher.js',
          functionName: 'fetchSelectedArticlesContent()',
          crawlerFunctions: [
            'fetchWebsiteHTML() - uses existing crawler to get raw HTML',
            'extractCleanText() - uses existing parser to clean content'
          ]
        }
      });
      
      console.log(`✅ Content fetching complete: ${successCount} success, ${failureCount} failed`);
      
    } catch (fetchError) {
      console.error('❌ Article content fetching failed:', fetchError);
      
      global.contentBriefsDebugData.steps.push({
        step: 'content_fetching_failed',
        timestamp: new Date().toISOString(),
        error: fetchError.message,
        logic: {
          description: 'Article content fetching failed, falling back to original articles',
          sourceFile: 'controllers/contentBriefs.js',
          functionName: 'generateContentBriefs()'
        }
      });
      
      // Fallback to original articles if fetching fails
      enrichedArticles = articles.map(article => ({
        ...article,
        fullContent: null,
        contentFetched: false,
        contentLength: 0,
        fetchError: 'Content fetching service failed'
      }));
    }
    
    // Use enhanced prompt with full content (existing prompt will be updated)
    const briefingPrompt = content.contentBriefsPrompt(enrichedArticles, businessContext);
    
    global.contentBriefsDebugData.steps.push({
      step: 'prompt_created',
      timestamp: new Date().toISOString(),
      prompt: briefingPrompt,
      logic: {
        description: 'Create content briefs prompt with full article content',
        sourceFile: 'prompts/content/contentBriefs.js',
        functionName: 'contentBriefsPrompt()',
        enhancement: 'Now includes full article content instead of just preview'
      }
    });
    
    const briefsResponse = await callClaudeAPI(briefingPrompt, false, null, 'AI: Content Briefs');
    
    global.contentBriefsDebugData.steps.push({
      step: 'ai_response',
      timestamp: new Date().toISOString(),
      response: briefsResponse,
      logic: {
        description: 'Call Claude API for content briefs with full article content',
        sourceFile: 'services/ai.js',
        functionName: 'callClaudeAPI()'
      }
    });
    
    // Parse the strategic briefs response (unchanged)
    let strategicBriefs;
    try {
      const jsonMatch = briefsResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        strategicBriefs = JSON.parse(jsonMatch[0]);
        
        // Validate strategic brief structure
        const isValidStructure = validateStrategicBriefsStructure(strategicBriefs);
        if (!isValidStructure) {
          throw new Error('Invalid strategic briefs structure received from AI');
        }
        
        global.contentBriefsDebugData.steps.push({
          step: 'parse_success',
          timestamp: new Date().toISOString(),
          parsedBriefs: strategicBriefs,
          logic: {
            description: 'Parse AI response for strategic content briefs',
            sourceFile: 'controllers/contentBriefs.js',
            functionName: 'generateContentBriefs()'
          }
        });
        
        global.contentBriefsDebugData.summary = {
          viableCount: strategicBriefs.viable_count,
          totalBriefs: strategicBriefs.total_briefs,
          evaluatedCount: strategicBriefs.evaluated_count
        };
        
        console.log(`✅ Generated strategic briefs: ${strategicBriefs.viable_count} viable articles, ${strategicBriefs.total_briefs} total strategic briefs`);
        
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      global.contentBriefsDebugData.error = 'Failed to parse strategic content briefs';
      global.contentBriefsDebugData.steps.push({
        step: 'parse_error',
        timestamp: new Date().toISOString(),
        error: parseError.message,
        logic: {
          description: 'Error parsing AI response for strategic briefs',
          sourceFile: 'controllers/contentBriefs.js',
          functionName: 'generateContentBriefs()'
        }
      });
      
      console.error('Failed to parse strategic briefs:', parseError);
      return res.status(500).json({ error: 'Failed to parse strategic content briefs' });
    }

    res.json(strategicBriefs);
    
  } catch (error) {
    global.contentBriefsDebugData.error = error.message;
    global.contentBriefsDebugData.steps.push({
      step: 'controller_error',
      timestamp: new Date().toISOString(),
      error: error.message,
      logic: {
        description: 'Unexpected error in content briefs controller',
        sourceFile: 'controllers/contentBriefs.js',
        functionName: 'generateContentBriefs()'
      }
    });
    
    console.error('Content briefs generation error:', error);
    res.status(500).json({ error: 'Content briefs generation failed: ' + error.message });
  }
}

// Validate strategic briefs structure (unchanged)
function validateStrategicBriefsStructure(briefs) {
  if (!briefs || typeof briefs !== 'object') return false;
  if (typeof briefs.evaluated_count !== 'number') return false;
  if (typeof briefs.viable_count !== 'number') return false;
  if (typeof briefs.total_briefs !== 'number') return false;
  if (!Array.isArray(briefs.results)) return false;
  
  return true;
}

module.exports = {
  generateContentBriefs
};