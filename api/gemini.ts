import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(
  req: any,
  res: any,
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, model = 'gemini-2.0-flash' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'prompt is required and must be a string'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API] GEMINI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'API Configuration Error',
        message: 'GEMINI_API_KEY is not set in environment variables'
      });
    }

    console.log(`[API] Calling Gemini with model: ${model}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    const result = await genModel.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      return res.status(500).json({ 
        error: 'Generation Failed',
        message: 'Gemini returned an empty response'
      });
    }

    console.log('[API] Successfully generated content');
    return res.status(200).json({ text });

  } catch (error) {
    console.error('[API] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: message,
      timestamp: new Date().toISOString()
    });
  }
}



