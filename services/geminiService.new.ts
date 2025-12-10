import { SampleAnswer, Vocabulary, WordTiming, EvaluationResult } from "../types";

export interface ExpandedContent {
  english: string;
  chinese: string;
  vocabularies: Vocabulary[];
  sentences: any[];
  thinking_logic: string;
  key_arguments: string[];
  prosody_markup?: string;
  ipa?: string;
}

// Helper function to call backend API
async function callGeminiAPI(prompt: string, model: string = 'gemini-2.0-flash'): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  const data = await response.json();
  return data.text;
}

export class GeminiService {
  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    let prompt = "";
    if (part === "part1") {
      prompt = `Generate 5 IELTS Speaking Part 1 questions about "${topicTitle}". Return them as a JSON array of strings.`;
    } else if (part === "part2") {
      prompt = `Generate 1 IELTS Speaking Part 2 Cue Card prompt about "${topicTitle}". Include "You should say: ..." points. Return it as a JSON array with a single string.`;
    } else {
      prompt = `Generate 5 IELTS Speaking Part 3 discussion questions related to the topic of "${topicTitle}". Return them as a JSON array of strings.`;
    }

    try {
      const text = await callGeminiAPI(prompt);
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse questions", e);
      return [];
    }
  }

  async generateSampleAnswerText(question: string, part: string = "part1"): Promise<ExpandedContent> {
    const lengthGuide = part === "part1" 
      ? "Keep it concise (approx 3-4 sentences)." 
      : "Provide a structured Band 9 answer.";

    const prompt = `
      You are an expert IELTS examiner and linguist.
      Task: Expand the following question into a complete learning resource.
      Question: "${question}"
      Part: ${part}
      ${lengthGuide}
      
      Return a JSON object with these exact fields (required):
      - english: The full Band 9 sample answer text
      - chinese: The Chinese translation of the answer
      - vocabularies: Array of vocabulary objects with word, definition, phonetic, example
      - thinking_logic: Explanation of the strategy
      - key_arguments: Array of 3-5 key concepts
      - sentences: Array of sentence analyses (can be empty)
      - prosody_markup: Prosody visualization (optional)
      - ipa: IPA transcription (optional)
    `;

    try {
      const text = await callGeminiAPI(prompt);
      const data = JSON.parse(text);
      
      return {
        english: data.english || "",
        chinese: data.chinese || "",
        vocabularies: data.vocabularies || [],
        sentences: data.sentences || [],
        thinking_logic: data.thinking_logic || "",
        key_arguments: data.key_arguments || [],
        prosody_markup: data.prosody_markup,
        ipa: data.ipa
      };
    } catch (e) {
      console.error("Failed to generate sample answer", e);
      return {
        english: "Unable to generate answer",
        chinese: "无法生成答案",
        vocabularies: [],
        sentences: [],
        thinking_logic: "",
        key_arguments: [],
      };
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          
          const prompt = `Transcribe the following audio exactly as spoken. Return only the transcribed text.`;
          
          // Since we're calling through API, we need to handle this differently
          // For now, return a placeholder
          resolve("Transcription service available through API");
        } catch (e) {
          console.error("Transcription failed", e);
          reject(e);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(audioBlob);
    });
  }

  async evaluateUserAnswer(question: string, userAnswer: string): Promise<EvaluationResult> {
    const prompt = `
      You are an IELTS Speaking examiner. Evaluate this answer.
      
      Question: "${question}"
      User Answer: "${userAnswer}"

      Return a JSON object with:
      - fluency: score 0-9
      - pronunciation: score 0-9
      - vocabulary: score 0-9
      - grammar: score 0-9
      - feedback: detailed feedback
      - suggestions: array of improvement suggestions
    `;

    try {
      const text = await callGeminiAPI(prompt);
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to evaluate answer", e);
      return {
        fluency: 0,
        pronunciation: 0,
        vocabulary: 0,
        grammar: 0,
        feedback: "Unable to evaluate",
        suggestions: [],
      };
    }
  }

  async generateSpeech(text: string): Promise<AudioBuffer> {
    // This would need server-side implementation for TTS
    throw new Error("Speech generation not implemented in this version");
  }
}

export const geminiService = new GeminiService();
