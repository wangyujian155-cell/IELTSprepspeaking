import { GoogleGenerativeAI } from '@google/generative-ai';

// Netlify serverless function handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { prompt, model = 'gemini-2.0-flash' } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing prompt parameter' }),
      };
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'API key not configured on server',
          code: 'NO_API_KEY',
        }),
      };
    }

    console.log(`Calling Gemini API with model: ${model}`);
    
    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    // Generate content
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Empty response from Gemini',
          code: 'EMPTY_RESPONSE',
        }),
      };
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate content',
        details: errorMessage,
        code: 'GENERATION_ERROR',
      }),
    };
  }
};
