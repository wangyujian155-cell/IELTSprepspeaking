import { SampleAnswer, Vocabulary, WordTiming, EvaluationResult } from "../types";

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

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    let prompt = "";
    if (part === "part1") {
      prompt = `Generate 5 IELTS Speaking Part 1 questions about "${topicTitle}". Return them as a JSON array of strings.`;
    } else if (part === "part2") {
      prompt = `Generate 1 IELTS Speaking Part 2 Cue Card prompt about "${topicTitle}". Include "You should say: ..." points. Return it as a JSON array with a single string.`;
    } else {
      prompt = `Generate 5 IELTS Speaking Part 3 discussion questions related to the topic of "${topicTitle}". Return them as a JSON array of strings.`;
    }

    const schema: Schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];
    try {
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
      
      Requirements:
      1. thinking_logic: A concise explanation of the strategy/direction to answer this question (in Chinese).
      2. key_arguments: An array of 3-5 key concepts or high-level vocabulary phrases useful for this answer (English phrases with Chinese meaning in brackets).
      3. english: The full Band 9 sample answer text.
      4. chinese: The Chinese translation of the answer.
      5. vocabularies: Identify 3-5 key vocabulary words from the answer with definitions.
      6. prosody_markup: Visualize the prosody of the 'english' answer.
         - Divide into thought groups using '|'.
         - Mark the ONE primary stress per chunk with **BOLD**.
         - Use '‿' for linking.
         - Add arrows (↘, ↗) for intonation.
      7. ipa: Provide IPA transcription for the 'english' answer.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        thinking_logic: { type: Type.STRING },
        key_arguments: { type: Type.ARRAY, items: { type: Type.STRING } },
        english: { type: Type.STRING },
        chinese: { type: Type.STRING },
        vocabularies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              example: { type: Type.STRING }
            },
            required: ["word", "definition", "phonetic", "example"]
          }
        },
        prosody_markup: { type: Type.STRING },
        ipa: { type: Type.STRING }
      },
      required: ["english", "chinese", "vocabularies", "thinking_logic", "key_arguments"]
    };

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    try {
      const data = JSON.parse(text);
      
      return {
        english: data.english,
        chinese: data.chinese,
        vocabularies: data.vocabularies || [],
        sentences: [],
        thinking_logic: data.thinking_logic || "Strategy not available.",
        key_arguments: data.key_arguments || [],
        prosody_markup: data.prosody_markup,
        ipa: data.ipa
      };
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Invalid response format from AI");
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm'; 

          const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
              parts: [
                { inlineData: { mimeType: mimeType, data: base64data } },
                { text: "Transcribe the following audio exactly as spoken. Do not add any conversational filler or commentary. If the speech is unclear, provide the best guess." }
              ]
            }
          });

          const text = response.text;
          if (text) {
            resolve(text);
          } else {
            resolve("");
          }
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
      ROLE: You are an elite IELTS Speaking Coach (Band 9 Level) and a Senior Linguist specializing in Second Language Acquisition (SLA) for Chinese learners. Your expertise lies in diagnosing "Chinglish" (L1 interference) and transforming it into idiomatic, sophisticated English that meets IELTS Band 8+ criteria. You are also a specialized "Logic Analyst".
      
      CORE SKILLS:
      1. Collocation Repair: Identify and fix unnatural Verb-Noun or Adjective-Noun pairings (e.g., change "learn knowledge" to "acquire insights"; "big rain" to "torrential downpour").
      2. Syntax Restructuring: Convert "Topic-Comment" structures (Chinglish) into standard English SVO structures. Fix run-on sentences and "There have" existentials.
      3. Part 3 Hedging: If the input discusses abstract topics, social issues, or opinions (typical of IELTS Part 3), you MUST inject academic hedging (e.g., "tend to," "arguably," "it appears that") to avoid generalization.
      4. Lexical Upgrading: Replace Band 5/6 vocabulary (e.g., "good," "bad," "think") with Band 8+ alternatives (e.g., "beneficial," "detrimental," "speculate").

      INPUT:
      Question: "${question}"
      User Answer: "${userAnswer}"

      TASK 1: LINGUISTIC DIAGNOSIS (for 'feedback' field)
      Provide a strict IELTS assessment.
      Generate a "Native Polish Comparison Table" in Markdown. 
      Table Columns: 
      - Original Fragment (Chinglish)
      - Band 8+ Polished Expression
      - Coach's Insight (Why?)
      
      After the table, provide a brief bullet-point summary of the assessment.

      TASK 2: LOGIC VISUALIZATION (for 'logic_analysis.mermaid_code')
      Construct a 'graph TD' flowchart representing the user's logic flow.
      Styling Rules:
      - Claim (Red): classDef claim fill:#ffcccc,stroke:#333;
      - Reason (Blue): classDef reason fill:#cce5ff,stroke:#333;
      - Evidence (Green): classDef evidence fill:#ccffcc,stroke:#333;
      - Missing Links: dotted lines.
      - Apply classes to nodes (e.g., A[Main Claim]:::claim --> B[Reason]:::reason).

      TASK 3: LOGIC DIAGNOSIS (for 'logic_analysis.logic_xray')
      In Chinese (Mandarin), briefly analyze the Main Claim, Reasons, and Examples. Point out logic gaps or circular reasoning in 1-2 sentences.

      TASK 4: BETTER VERSION (for 'better_version')
      A native-speaker level rewrite applying Core Skills.

      OUTPUT FORMAT (JSON):
      Return a single JSON object.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        feedback: { type: Type.STRING, description: "Markdown string containing the Native Polish Comparison Table and assessment." },
        better_version: { type: Type.STRING },
        prosody_markup: { type: Type.STRING },
        ipa: { type: Type.STRING },
        logic_analysis: {
          type: Type.OBJECT,
          properties: {
            logic_xray: { type: Type.STRING },
            mermaid_code: { type: Type.STRING },
            argument_structure: {
              type: Type.OBJECT,
              properties: {
                Main_Claim: { type: Type.STRING, nullable: true },
                Supporting_Reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                Examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                Logic_Gap_Detected: { type: Type.BOOLEAN },
                Improvement_Suggestion: { type: Type.STRING }
              },
              required: ["Supporting_Reasons", "Examples", "Logic_Gap_Detected", "Improvement_Suggestion"]
            },
            next_step_advice: { type: Type.STRING }
          },
          required: ["logic_xray", "mermaid_code", "argument_structure", "next_step_advice"]
        }
      },
      required: ["score", "feedback", "better_version", "logic_analysis"]
    };

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse evaluation", e);
      throw new Error("Invalid evaluation format");
    }
  }

  async generateSpeech(text: string): Promise<AudioBuffer> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini");
    }

    const audioContext = getDecodingContext();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const pcmData = decode(base64Audio);
    const audioBuffer = pcmToAudioBuffer(pcmData, audioContext, 24000);
    return audioBuffer;
  }
}

export const geminiService = new GeminiService();
