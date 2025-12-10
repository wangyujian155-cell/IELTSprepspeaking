// API Helper for Vercel deployment
export async function callGeminiAPI(prompt: string, model: string = 'gemini-2.0-flash'): Promise<string> {
  const endpoint = process.env.NODE_ENV === 'production' 
    ? '/api/gemini'
    : 'http://localhost:3000/api/gemini';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'API error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

export async function generateSampleAnswer(question: string, part: string = "part1") {
  const lengthGuide = part === "part1" 
    ? "Keep it concise (approx 3-4 sentences)." 
    : "Provide a structured Band 9 answer.";

  const prompt = `
    You are an expert IELTS examiner.
    Generate a sample answer for this ${part.toUpperCase()} question: "${question}"
    ${lengthGuide}
    
    Return ONLY a valid JSON object (no markdown, no extra text) with these fields:
    {
      "english": "the answer in english",
      "chinese": "chinese translation",
      "vocabularies": [{"word": "word", "definition": "def", "phonetic": "", "example": "example"}],
      "thinking_logic": "strategy",
      "key_arguments": ["arg1", "arg2"],
      "sentences": [],
      "prosody_markup": "",
      "ipa": ""
    }
  `;

  try {
    const text = await callGeminiAPI(prompt);
    // Remove markdown code blocks if present
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to generate answer:", e);
    return {
      english: "Unable to generate answer. Please check API configuration.",
      chinese: "无法生成答案，请检查 API 配置。",
      vocabularies: [],
      sentences: [],
      thinking_logic: "",
      key_arguments: [],
    };
  }
}

export async function evaluateAnswer(question: string, userAnswer: string) {
  const prompt = `
    You are an IELTS examiner. Evaluate this answer.
    
    Question: "${question}"
    Answer: "${userAnswer}"
    
    Return ONLY a valid JSON object with:
    {
      "score": 0-9,
      "fluency": 0-9,
      "pronunciation": 0-9,
      "vocabulary": 0-9,
      "grammar": 0-9,
      "feedback": "detailed feedback",
      "suggestions": ["suggestion1", "suggestion2"]
    }
  `;

  try {
    const text = await callGeminiAPI(prompt);
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to evaluate answer:", e);
    return {
      score: 0,
      fluency: 0,
      pronunciation: 0,
      vocabulary: 0,
      grammar: 0,
      feedback: "Evaluation failed",
      suggestions: [],
    };
  }
}
