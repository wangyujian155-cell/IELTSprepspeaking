import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function to handle Gemini API calls
export default async function handler(
  request: any,
  response: any,
) {
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
      console.error('GEMINI_API_KEY not configured');
      return response.status(500).json({ error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    return response.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API error:', error);
    return response.status(500).json({
      error: 'Failed to generate content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

