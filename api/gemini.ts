import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function to handle Gemini API calls
export default async function handler(
  request: any,
  response: any,
) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gemini-2.0-flash' } = request.body;

    if (!prompt) {
      return response.status(400).json({ error: 'Missing prompt parameter' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not found');
      return response.status(500).json({ 
        error: 'API key not configured on server',
        code: 'NO_API_KEY'
      });
    }

    console.log(`Calling Gemini API with model: ${model}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      return response.status(500).json({ 
        error: 'Empty response from Gemini',
        code: 'EMPTY_RESPONSE'
      });
    }

    return response.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return response.status(500).json({
      error: 'Failed to generate content',
      details: errorMessage,
      code: 'GENERATION_ERROR'
    });
  }
}


