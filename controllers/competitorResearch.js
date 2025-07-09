// ===== controllers/competitorResearch.js =====
// FIXED VERSION - Lightweight previews + AI selection

// Competitor research controller
const { callClaudeAPI } = require('../services/ai');
const { crawlHomepageOnly } = require('../services/websiteCrawler');
const { searchBrave } = require('../services/webSearch');
const { intelligence } = require('../prompts');
const systemLogger = require('../services/systemLogger');
const axios = require('axios');

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to extract base URL
function extractBaseUrl(fullUrl) {
  try {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch (error) {
    console.log(`⚠️ Invalid URL: ${fullUrl}`);
    return fullUrl; // Return original if parsing fails
  }
}

// LIGHTWEIGHT preview function (not full content extraction)
function generateLightweightPreview(htmlContent) {
  try {
    // Simple text extraction without heavy processing
    let text = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove styles
      .replace(/<[^>]+>/g, ' ')                          // Remove HTML tags
      .replace(/\s+/g, ' ')                              // Normalize whitespace
      .trim();
    
    // Get first 500 characters
    return text.substring(0, 500);
  } catch (error) {
    return 'Preview generation failed';
  }
}

// ENHANCED: Perform competitor research with three-step processing
async function performCompetitorResearch(competitorQueries, businessContext, masterId = null, businessPrompt = null, businessAiResponse = null) {
  // Initialize global debug data
  global.competitorDebugData = {
    timestamp: new Date().toISOString(),
    competitorQueries: competitorQueries,
    businessContext: businessContext,
    searchResults: [],
    competitorUrls: [],
    crawlResults: [],
    searchScope: 'Global (Country Neutral)',
    aiInteractions: [
      {
        step: 'competitor_discovery_query_generation',
        timestamp: new Date().toISOString(),
        prompt: businessPrompt || 'Prompt not available',
        response: businessAiResponse || 'AI response not available',
        parsedData: competitorQueries,
        promptSource: {
          sourceFile: 'prompts/intelligence/businessAnalysis.js',
          functionName: 'businessAnalysisPrompt()',
          description: 'AI prompt for generating foundational intelligence including competitor discovery queries'
        },
        logic: {
          description: 'AI-generated competitor discovery queries from business analysis',
          sourceFile: 'controllers/businessIntelligence.js',
          functionName: 'generateIntelligence() - business analysis',
          steps: [
            'Prepare business analysis prompt with form data and crawl results',
            'Send prompt to AI for foundational intelligence generation',
            'AI generates competitor_discovery_queries as part of response',
            'Extract queries from AI response JSON',
            'Pass queries to competitor research process'
          ],
          dataUsage: {
            competitiveInsights: [
              'Competitor Discovery Queries (used for global web search)'
            ],
            differentiationOpportunities: [
              'Query targeting for competitor analysis'
            ],
            contentStrategyInsights: [
              'Search strategy for competitor discovery'
            ]
          }
        },
        note: 'The actual AI prompt and response for query generation are now included here.'
      }
    ],
    finalResult: null
  };
  
  if (masterId) systemLogger.logStep(masterId, {
    step: 'Competitor research: started enhanced three-step processing',
    competitorQueries,
    searchScope: 'Global (Country Neutral)',
    logic: 'Begin enhanced competitor research with three-step processing: Enhanced search → Lightweight previews → AI selection → Crawl selected.',
    next: 'Execute enhanced global search with 10 results per query.'
  });

  try {
    // =============================================================================
    // STEP 1: Enhanced search with 10 results per query (was 3)
    // =============================================================================
    console.log('🔍 STEP 1: Enhanced search with 10 results per query...');
    const searchResults = [];
    
    for (let i = 0; i < competitorQueries.length; i++) {
      const query = competitorQueries[i];
      try {
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: enhanced global search',
          query,
          searchCount: 10, // Enhanced from 3 to 10
          searchScope: 'Global (Country Neutral)',
          logic: 'Execute global search with increased result count for better competitor discovery.',
          next: 'Process search results.'
        });
        
        console.log(`🌐 Enhanced Global Search ${i + 1}/${competitorQueries.length}: "${query}" (10 results)`);
        const searchResult = await searchBrave(query, 10); // Enhanced: was 3, now 10
        searchResults.push(searchResult);
        
        console.log(`✅ Enhanced search ${i + 1} completed: ${searchResult.web?.results?.length || 0} results found`);
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: enhanced search result',
          query,
          resultsFound: searchResult.web?.results?.length || 0,
          searchScope: 'Global',
          logic: 'Enhanced search completed with increased result count.',
          next: 'Continue to next query or process URLs.'
        });
        
        // Add delay between requests (1.1 seconds to be safe with 1 req/sec limit)
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request...');
          await delay(1100);
        }
        
      } catch (searchError) {
        console.error(`❌ Enhanced Global search ${i + 1} failed:`, searchError.message);
        // Add empty result for failed search
        searchResults.push({ web: { results: [] } });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: enhanced search failed',
          query,
          error: searchError.message,
          searchScope: 'Global',
          logic: 'Enhanced search failed, storing empty result.',
          next: 'Continue to next query.'
        });
        
        // Still wait before next request to respect rate limits
        if (i < competitorQueries.length - 1) {
          console.log('⏱️ Waiting 1.1 seconds before next request (after error)...');
          await delay(1100);
        }
      }
    }

    // =============================================================================
    // STEP 2: Lightweight URL processing with base URL extraction and quick previews
    // =============================================================================
    console.log('🔄 STEP 2: Processing competitor URLs with LIGHTWEIGHT logic...');

    // Step 2a: Extract all URLs and convert to base URLs
    const rawCompetitorCandidates = [];
    searchResults.forEach((result, queryIndex) => {
      if (result.web && result.web.results) {
        result.web.results.forEach((webResult, resultIndex) => {
          const baseUrl = extractBaseUrl(webResult.url);
          rawCompetitorCandidates.push({
            baseUrl: baseUrl,
            originalUrl: webResult.url,
            title: webResult.title,
            description: webResult.description,
            query_source: `Query ${queryIndex + 1}`,
            rank: resultIndex + 1,
            search_scope: 'Global'
          });
        });
      }
    });

    console.log(`📊 Raw candidates from search: ${rawCompetitorCandidates.length} URLs`);

    // Step 2b: Deduplicate by base URL (keep first occurrence)
    const uniqueCompetitors = [];
    const seenBaseUrls = new Set();

    rawCompetitorCandidates.forEach(candidate => {
      if (!seenBaseUrls.has(candidate.baseUrl)) {
        seenBaseUrls.add(candidate.baseUrl);
        uniqueCompetitors.push(candidate);
      }
    });

    console.log(`🔄 After deduplication: ${uniqueCompetitors.length} unique URLs`);

    // Step 2c: LIGHTWEIGHT preview generation (quick fetch only)
    const candidatesWithPreviews = [];

    for (const candidate of uniqueCompetitors) {
      try {
        console.log(`🔍 Quick preview generation: ${candidate.baseUrl}`);
        
        // LIGHTWEIGHT fetch (no full content extraction)
        const response = await axios.get(candidate.baseUrl, {
          timeout: 5000, // Shorter timeout for quick preview
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // LIGHTWEIGHT preview generation (not full content extraction)
        const preview = generateLightweightPreview(response.data);
        
        // Only keep if we got meaningful content
        if (preview.length > 50) {
          candidatesWithPreviews.push({
            url: candidate.baseUrl,
            title: candidate.title,
            description: candidate.description,
            query_source: candidate.query_source,
            rank: candidate.rank,
            search_scope: candidate.search_scope,
            preview: preview,
            originalUrl: candidate.originalUrl
          });
          console.log(`✅ Preview generated: ${candidate.baseUrl} (${preview.length} chars)`);
        } else {
          console.log(`❌ Insufficient content: ${candidate.baseUrl}`);
        }
        
      } catch (error) {
        console.log(`❌ Preview failed: ${candidate.baseUrl} - ${error.message}`);
        // Skip this URL completely
      }
    }

    console.log(`📊 Candidates with previews: ${candidatesWithPreviews.length}/${uniqueCompetitors.length}`);

    // =============================================================================
    // STEP 3: AI selection of best candidates (max 5 for crawling)
    // =============================================================================
    console.log('🤖 STEP 3: AI selection of best competitors...');

    let selectedCompetitors = candidatesWithPreviews;

    if (candidatesWithPreviews.length > 0) {
      try {
        const competitorSelectionPrompt = `You are analyzing potential competitors for this business:

BUSINESS CONTEXT:
${JSON.stringify(businessContext, null, 2)}

CANDIDATE COMPETITORS (with previews):
${JSON.stringify(candidatesWithPreviews.map(comp => ({
  baseUrl: comp.url,
  title: comp.title,
  description: comp.description,
  preview: comp.preview,
  querySource: comp.query_source
})), null, 2)}

Your task:
1. Identify which candidates are actual DIRECT competitors (exclude review sites, blogs, unrelated companies)
2. Rank them from most relevant to least relevant  
3. Return MAXIMUM 5 competitors in order of decreasing relevance
4. Only exclude if clearly NOT a competitor

RESPOND WITH JSON ONLY:
{
  "selected_competitors": [
    {
      "baseUrl": "https://competitor.com",
      "relevanceScore": 95,
      "relevanceReason": "Direct competitor in same category",
      "isDirectCompetitor": true
    }
  ],
  "total_selected": 3
}`;

        console.log('🔄 Requesting AI competitor selection...');
        const aiSelectionResponse = await callClaudeAPI(competitorSelectionPrompt, false, masterId, 'AI: Competitor Selection');
        
        // Parse AI response
        let selectionData;
        try {
          const jsonMatch = aiSelectionResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            selectionData = JSON.parse(jsonMatch[0]);
            
            // Map AI results back to our URL format
            selectedCompetitors = selectionData.selected_competitors.map(aiComp => {
              const originalComp = candidatesWithPreviews.find(comp => comp.url === aiComp.baseUrl);
              return {
                ...originalComp,
                relevanceScore: aiComp.relevanceScore,
                relevanceReason: aiComp.relevanceReason,
                aiSelected: true
              };
            }).slice(0, 5); // Ensure max 5
            
            console.log(`🎯 AI selected: ${candidatesWithPreviews.length} → ${selectedCompetitors.length} competitors for crawling`);
            
            // Store AI selection in debug data
            global.competitorDebugData.aiSelection = {
              step: 'ai_competitor_selection',
              timestamp: new Date().toISOString(),
              inputCandidates: candidatesWithPreviews.length,
              outputSelected: selectedCompetitors.length,
              prompt: competitorSelectionPrompt,
              response: aiSelectionResponse,
              logic: {
                description: 'AI selection of best competitors for full crawling',
                sourceFile: 'controllers/competitorResearch.js',
                functionName: 'performCompetitorResearch() - AI selection',
                steps: [
                  'Send candidates with lightweight previews to AI',
                  'AI identifies direct competitors vs review sites/blogs',
                  'AI ranks competitors by relevance to business',
                  'Return maximum 5 competitors for full crawling',
                  'Map AI results back to original URL format'
                ]
              }
            };
            
            if (masterId) systemLogger.logStep(masterId, {
              step: 'Competitor research: AI selection complete',
              inputCount: candidatesWithPreviews.length,
              outputCount: selectedCompetitors.length,
              logic: 'AI successfully selected best competitors for crawling.',
              next: 'Proceed to crawl selected competitors.'
            });
            
          } else {
            throw new Error('No JSON found in AI selection response');
          }
        } catch (parseError) {
          console.log('⚠️ AI selection parse failed, using top candidates');
          selectedCompetitors = candidatesWithPreviews.slice(0, 5); // Just take first 5
        }
        
      } catch (aiError) {
        console.log('⚠️ AI selection failed, using top candidates:', aiError.message);
        selectedCompetitors = candidatesWithPreviews.slice(0, 5); // Just take first 5
      }
    } else {
      console.log('⚠️ No candidates available for AI selection');
    }

    // Enhanced debug data
    global.competitorDebugData.competitorUrls = selectedCompetitors;
    global.competitorDebugData.urlExtraction = {
      step: 'enhanced_three_step_processing',
      timestamp: new Date().toISOString(),
      step1_enhanced_search: {
        resultsPerQuery: 10,
        totalRawUrls: rawCompetitorCandidates.length,
        searchScope: 'Global (Country Neutral)'
      },
      step2_lightweight_processing: {
        uniqueUrls: uniqueCompetitors.length,
        previewsGenerated: candidatesWithPreviews.length,
        method: 'lightweight_preview_generation'
      },
      step3_ai_selection: {
        inputCandidates: candidatesWithPreviews.length,
        selectedForCrawling: selectedCompetitors.length,
        maxAllowed: 5,
        selectionMethod: 'AI relevance ranking'
      },
      urlsByQuery: searchResults.map((result, index) => ({
        queryIndex: index,
        urlsFound: result.web?.results?.length || 0
      })),
      logic: {
        description: 'Three-step enhanced competitor discovery: Enhanced search → Lightweight previews → AI selection → Full crawl',
        sourceFile: 'controllers/competitorResearch.js',
        functionName: 'performCompetitorResearch() - three-step processing',
        steps: [
          'STEP 1: Enhanced search with 10 results per query',
          'STEP 2: Extract base URLs, deduplicate, generate lightweight previews',
          'STEP 3: AI selection of best 5 competitors for full crawling',
          'STEP 4: Full crawl only the AI-selected competitors'
        ]
      }
    };

    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: three-step processing complete',
      step1_rawUrls: rawCompetitorCandidates.length,
      step2_previewsGenerated: candidatesWithPreviews.length,
      step3_selectedForCrawling: selectedCompetitors.length,
      searchScope: 'Global',
      logic: 'Three-step enhanced competitor discovery completed: Enhanced search → Lightweight previews → AI selection.',
      next: 'Proceed to full crawl of AI-selected competitors.'
    });

    // Continue with existing logic from here - but use selectedCompetitors
    if (selectedCompetitors.length === 0) {
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: no competitors selected',
        searchScope: 'Global',
        logic: 'No relevant competitors selected after three-step processing.',
        next: 'Return empty competitor intelligence.'
      });
      return {
        discovery_queries_used: competitorQueries,
        competitors_found: 0,
        competitors_selected: 0,
        search_scope: 'Global (Country Neutral)',
        competitor_analysis: [],
        competitive_insights: {
          market_gaps: [],
          common_features: [],
          pricing_landscape: "No relevant competitor data available",
          positioning_opportunities: []
        },
        differentiation_opportunities: [],
        content_strategy_insights: {
          competitor_content_themes: [],
          content_gaps_to_exploit: [],
          messaging_opportunities: []
        },
        analysis_note: "No relevant competitors selected after enhanced three-step processing"
      };
    }
    
    // =============================================================================
    // STEP 4: Full crawl of ONLY the AI-selected competitors
    // =============================================================================
    console.log(`🏠 STEP 4: Full crawl of ${selectedCompetitors.length} AI-selected competitors...`);
    const competitorCrawlResults = [];
    const crawledUrls = new Set(); // Track crawled URLs to prevent duplicates
    
    for (const competitor of selectedCompetitors) {
      // Skip if URL already crawled (prevent duplicates)
      if (crawledUrls.has(competitor.url)) {
        console.log(`⏭️ Skipping duplicate URL: ${competitor.url}`);
        continue;
      }
      crawledUrls.add(competitor.url);
      
      try {
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawling selected competitor',
          competitor,
          logic: 'Full crawl of AI-selected competitor homepage.',
          next: 'Extract and store crawl data.'
        });
        console.log(`🏠 Full crawling competitor: ${competitor.title} (${competitor.url})`);
        const crawledData = await crawlHomepageOnly(competitor.url);
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: crawledData
        });
        console.log(`✅ Successfully crawled: ${crawledData.company_name || competitor.title}`);
        
        // Store crawl result in debug data
        global.competitorDebugData.crawlResults.push({
          step: 'selected_competitor_full_crawl',
          timestamp: new Date().toISOString(),
          websiteUrl: competitor.url,
          companyName: crawledData.company_name || competitor.title,
          searchScope: 'Global',
          aiSelected: true,
          relevanceScore: competitor.relevanceScore,
          rawData: {
            originalHtmlLength: crawledData.original_html?.length || 0,
            cleanTextLength: crawledData.clean_text?.length || 0,
            compressionRatio: crawledData.original_html && crawledData.clean_text ?
              ((crawledData.clean_text.length / crawledData.original_html.length) * 100).toFixed(1) + '%' : 'N/A'
          },
          processedData: crawledData,
          aiInteraction: crawledData.aiInteraction || null,
          logic: {
            description: 'Full crawl of AI-selected competitor homepage',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlHomepageOnly()',
            steps: [
              'Fetch homepage HTML content',
              'Extract and clean text content (full process)',
              'Identify company name and business description',
              'Store structured business data'
            ],
            crawlingMethod: 'Full homepage crawl with complete content extraction',
            contentProcessing: 'Full text cleaning, company identification, business data extraction'
          }
        });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawl success',
          competitor,
          crawledData,
          logic: 'Successfully crawled AI-selected competitor.',
          next: 'Continue to next selected competitor.'
        });
        
        // Add small delay between crawls to be respectful to competitor sites
        await delay(500);
        
      } catch (crawlError) {
        console.log(`⚠️ Failed to crawl ${competitor.url}: ${crawlError.message}`);
        // Continue with other competitors - don't fail entire process
        competitorCrawlResults.push({
          search_info: competitor,
          crawled_data: null,
          error: crawlError.message
        });
        
        // Store failed crawl in debug data
        global.competitorDebugData.crawlResults.push({
          step: 'selected_competitor_full_crawl',
          timestamp: new Date().toISOString(),
          websiteUrl: competitor.url,
          companyName: competitor.title,
          searchScope: 'Global',
          aiSelected: true,
          error: crawlError.message,
          logic: {
            description: 'Full crawl of AI-selected competitor homepage',
            sourceFile: 'services/websiteCrawler.js',
            functionName: 'crawlHomepageOnly()',
            steps: [
              'Fetch homepage HTML content',
              'Extract and clean text content',
              'Identify company name and business description',
              'Store structured business data'
            ],
            crawlingMethod: 'Full homepage crawl with complete content extraction',
            contentProcessing: 'Full text cleaning, company identification, business data extraction'
          }
        });
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: crawl failed',
          competitor,
          error: crawlError.message,
          logic: 'Failed to crawl AI-selected competitor.',
          next: 'Continue to next selected competitor.'
        });
      }
    }
    
    // =============================================================================
    // STEP 5: AI analysis of competitor data (EXISTING LOGIC - NO CHANGES)
    // =============================================================================
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: analyzing competitor data with AI',
      competitorCrawlResults,
      searchScope: 'Global',
      logic: 'Prepare prompt and send to AI for competitor analysis.',
      next: 'Parse AI response.'
    });
    console.log('🤖 Analyzing competitor data with AI...');
    const competitorAnalysisPrompt = intelligence.competitorAnalysisPrompt(businessContext, competitorCrawlResults);
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: AI prompt',
      competitorAnalysisPrompt,
      logic: 'Prompt constructed for AI competitor analysis.',
      next: 'Send prompt to AI.'
    });
    const competitorAnalysisResponse = await callClaudeAPI(competitorAnalysisPrompt, false, masterId, 'AI: Competitor Analysis');
    
    // Store final AI interaction in debug data
    global.competitorDebugData.aiInteractions.push({
      step: 'final_competitor_analysis',
      timestamp: new Date().toISOString(),
      prompt: competitorAnalysisPrompt,
      response: competitorAnalysisResponse,
      searchScope: 'Global',
      promptSource: {
        sourceFile: 'prompts/intelligence/competitorAnalysis.js',
        functionName: 'competitorAnalysisPrompt()',
        description: 'AI prompt for comprehensive competitor intelligence analysis'
      },
      logic: {
        description: 'Final AI analysis of all competitor data from AI-selected competitors',
        sourceFile: 'controllers/competitorResearch.js',
        functionName: 'performCompetitorResearch() - final analysis',
        steps: [
          'Combine all crawled competitor data from AI-selected competitors',
          'Create comprehensive analysis prompt',
          'Send to AI for competitor intelligence generation',
          'Parse AI response to extract structured insights',
          'Generate market gaps, positioning opportunities, and content strategy insights'
        ],
        dataUsage: {
          competitiveInsights: [
            'Market Gaps',
            'Common Features',
            'Pricing Landscape',
            'Positioning Opportunities'
          ],
          differentiationOpportunities: [
            'Unique Value Propositions',
            'Competitive Advantages',
            'Market Positioning'
          ],
          contentStrategyInsights: [
            'Competitor Content Themes',
            'Content Gaps to Exploit',
            'Messaging Opportunities'
          ]
        }
      }
    });
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: AI response',
      competitorAnalysisResponse,
      logic: 'AI response received for competitor analysis.',
      next: 'Parse AI response.'
    });
    
    // Parse competitor analysis (EXISTING LOGIC - NO CHANGES)
    let competitorAnalysis;
    try {
      const jsonMatch = competitorAnalysisResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        competitorAnalysis = JSON.parse(jsonMatch[0]);
        competitorAnalysis.discovery_queries_used = competitorQueries;
        competitorAnalysis.competitors_found = selectedCompetitors.length;
        competitorAnalysis.search_scope = 'Global (Country Neutral)';
        
        if (masterId) systemLogger.logStep(masterId, {
          step: 'Competitor research: parsed AI analysis',
          competitorAnalysis,
          logic: 'Extracted JSON from AI competitor analysis response.',
          next: 'Return competitor intelligence.'
        });
      } else {
        throw new Error('No JSON found in competitor analysis response');
      }
    } catch (parseError) {
      console.error('Failed to parse competitor analysis:', parseError);
      // Return basic structure if parsing fails
      if (masterId) systemLogger.logStep(masterId, {
        step: 'Competitor research: AI parse error',
        error: parseError.message,
        logic: 'Failed to extract JSON from AI competitor analysis response.',
        next: 'Return fallback competitor intelligence.'
      });
      return {
        discovery_queries_used: competitorQueries,
        competitors_found: selectedCompetitors.length,
        competitors_selected: 0,
        search_scope: 'Global (Country Neutral)',
        competitor_analysis: [],
        competitive_insights: {
          market_gaps: [],
          common_features: [],
          pricing_landscape: "Analysis failed",
          positioning_opportunities: []
        },
        differentiation_opportunities: [],
        content_strategy_insights: {
          competitor_content_themes: [],
          content_gaps_to_exploit: [],
          messaging_opportunities: []
        },
        analysis_note: "Competitor analysis parsing failed: " + parseError.message
      };
    }
    
    // Store final result in debug data
    global.competitorDebugData.finalResult = competitorAnalysis;
    global.competitorDebugData.summary = {
      queriesExecuted: competitorQueries.length,
      candidatesFound: rawCompetitorCandidates.length,
      uniqueUrls: uniqueCompetitors.length,
      previewsGenerated: candidatesWithPreviews.length,
      competitorsSelected: selectedCompetitors.length,
      competitorsCrawled: competitorCrawlResults.length,
      successfulCrawls: competitorCrawlResults.filter(c => !c.error).length,
      failedCrawls: competitorCrawlResults.filter(c => c.error).length,
      aiInteractions: global.competitorDebugData.aiInteractions.length,
      totalSearchResults: searchResults.length,
      searchScope: 'Global (Country Neutral)',
      analysisMethod: 'enhanced_four_step_processing_with_ai_selection'
    };
    
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: complete',
      competitorAnalysis,
      searchScope: 'Global',
      logic: 'Final competitor intelligence ready from enhanced four-step processing with AI selection.',
      next: 'Return to business profile flow.'
    });
    
    return competitorAnalysis;
  } catch (error) {
    console.error('Competitor research failed:', error);
    if (masterId) systemLogger.logStep(masterId, {
      step: 'Competitor research: error',
      error: error.message,
      searchScope: 'Global',
      logic: 'Unhandled error during competitor research.',
      next: 'Return fallback competitor intelligence.'
    });
    throw error;
  }
}

module.exports = {
  performCompetitorResearch
};