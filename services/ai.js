// AI service - Pure AI communication functionality
const axios = require('axios');
const { config } = require('../config/config');
const systemLogger = require('./systemLogger');

// Helper function to call Claude API
async function callClaudeAPI(prompt, useWebSearch = false, masterId = null, stepLabel = 'AI Call') {
  if (masterId) systemLogger.logStep(masterId, {
    step: `${stepLabel}: request`,
    prompt,
    useWebSearch,
    logic: 'Send prompt to Claude AI API.',
    next: 'Await AI response.'
  });
  try {
    const tools = useWebSearch ? [
      {
        "name": "web_search",
        "description": "Search the web",
        "input_schema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            }
          },
          "required": ["query"]
        }
      },
      {
        "name": "web_fetch",
        "description": "Fetch the contents of a web page at a given URL",
        "input_schema": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "URL to fetch"
            }
          },
          "required": ["url"]
        }
      }
    ] : [];

    let messages = [
      {
        role: "user",
        content: prompt
      }
    ];

    console.log('Making Claude API request:', {
      useWebSearch,
      toolsCount: tools.length,
      promptLength: prompt.length
    });

    // First API call
    let requestBody = {
      model: config.claude.model,
      max_tokens: config.claude.maxTokens,
      messages: messages
    };

    if (useWebSearch) {
      requestBody.tools = tools;
    }

    let response = await axios.post(config.claudeApiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': config.claude.anthropicVersion
      }
    });
    if (masterId) systemLogger.logStep(masterId, {
      step: `${stepLabel}: response`,
      status: response.status,
      contentLength: response.data.content?.length,
      contentTypes: response.data.content?.map(c => c.type),
      stopReason: response.data.stop_reason,
      logic: 'Received response from Claude AI API.',
      next: 'Extract result.'
    });

    // Handle tool use if Claude wants to use web search
    if (useWebSearch && response.data.content) {
      let finalResult = '';
      let currentMessages = [...messages];
      
      // Add Claude's response to conversation
      currentMessages.push({
        role: "assistant",
        content: response.data.content
      });

      // Check if Claude used any tools
      for (const content of response.data.content) {
        if (content.type === 'tool_use') {
          console.log('Claude requested tool use:', content.name, content.input);
          
          if (content.name === 'web_search') {
            // Claude wants to search - we need to let it handle this
            // Add tool result message
            currentMessages.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: content.id,
                  content: "Search completed. Please provide the results you found."
                }
              ]
            });

            // Make follow-up request
            const followUpResponse = await axios.post(config.claudeApiUrl, {
              model: config.claude.model,
              max_tokens: config.claude.maxTokens,
              messages: currentMessages,
              tools: tools
            }, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.claudeApiKey,
                'anthropic-version': config.claude.anthropicVersion
              }
            });

            console.log('Follow-up response received');
            
            // Extract text from follow-up response
            if (followUpResponse.data.content) {
              for (const followUpContent of followUpResponse.data.content) {
                if (followUpContent.type === 'text') {
                  finalResult += followUpContent.text + '\n';
                }
              }
            }
          }
        } else if (content.type === 'text') {
          finalResult += content.text + '\n';
        }
      }

      if (!finalResult.trim()) {
        console.log('No final result from tool use. Raw response:', JSON.stringify(response.data, null, 2));
        throw new Error('No usable content from Claude after tool use');
      }

      return finalResult.trim();
    }

    // Extract final result for non-tool requests
    let result = '';
    
    if (response.data.content && response.data.content.length > 0) {
      for (const content of response.data.content) {
        if (content.type === 'text') {
          result += content.text + '\n';
        }
      }
    }

    if (!result.trim()) {
      console.log('Empty result! Full response:', JSON.stringify(response.data, null, 2));
      throw new Error('No usable content in Claude response');
    }

    console.log('Final result length:', result.length);
    if (masterId) systemLogger.logStep(masterId, {
      step: `${stepLabel}: result`,
      result,
      logic: 'Final result extracted from Claude AI response.',
      next: 'Return result to caller.'
    });
    return result.trim();
    
  } catch (error) {
    console.error('Claude API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      throw new Error('Claude API authentication failed. Check your API key.');
    } else if (error.response?.status === 400) {
      throw new Error(`Claude API request error: ${error.response.data?.error?.message || 'Bad request'}`);
    } else if (error.response?.status === 429) {
      throw new Error('Claude API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`Claude API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    if (masterId) systemLogger.logStep(masterId, {
      step: `${stepLabel}: error`,
      error: error.message,
      logic: 'Error during Claude AI API call.',
      next: 'Throw error to caller.'
    });
  }
}

// Test Claude API connection
async function testClaudeAPI() {
  try {
    if (!config.claudeApiKey) {
      return { status: 'error', message: 'No Claude API key configured' };
    }
    
    if (!config.claudeApiKey.startsWith('sk-ant-')) {
      return { status: 'error', message: 'Invalid Claude API key format' };
    }
    
    const testPrompt = 'Say "Claude API test successful" and nothing else.';
    const result = await callClaudeAPI(testPrompt, false);
    return { status: 'success', message: 'API key working', response: result };
    
  } catch (error) {
    return { status: 'error', message: 'Claude API test failed: ' + error.message };
  }
}

module.exports = {
  callClaudeAPI,
  testClaudeAPI
};