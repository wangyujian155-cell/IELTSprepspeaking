import { SampleAnswer, Vocabulary, EvaluationResult } from "../types";

// DEPRECATED FILE - Use apiHelper.ts instead
// API calls are now handled through Vercel serverless functions

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
  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    return [];
  }

  async generateSampleAnswerText(question: string, part: string = "part1"): Promise<ExpandedContent> {
    return {
      english: "", chinese: "", vocabularies: [], sentences: [], thinking_logic: "", key_arguments: []
    };
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> { return ""; }

  async evaluateUserAnswer(question: string, userAnswer: string): Promise<any> {
    return { score: 0, feedback: "" };
  }

  async generateSpeech(text: string): Promise<AudioBuffer> {
    throw new Error("Not implemented");
  }
}

export const geminiService = new GeminiService();
