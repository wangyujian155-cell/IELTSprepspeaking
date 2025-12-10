// Client-side Gemini Service - calls backend API routes
import { SampleAnswer, Vocabulary, WordTiming, EvaluationResult } from "../types";

// Helper to decode Base64 to ArrayBuffer for audio playback
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert raw PCM to AudioBuffer
function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number = 1
): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit PCM to float [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Singleton context for decoding to avoid "limit reached" errors
let decodingContext: AudioContext | null = null;
function getDecodingContext() {
  if (!decodingContext) {
    // Create context with default/native sample rate to ensure hardware compatibility
    decodingContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return decodingContext;
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
  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicTitle, part }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      return data.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  async generateSampleAnswerText(question: string, part: string = "part1"): Promise<ExpandedContent> {
    try {
      const response = await fetch('/api/generate-sample-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, part }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sample answer');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating sample answer:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm';

          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audioBase64: base64data, mimeType }),
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const data = await response.json();
          resolve(data.transcription || '');
        } catch (e) {
          console.error('Transcription failed', e);
          reject(e);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(audioBlob);
    });
  }

  async evaluateUserAnswer(question: string, userAnswer: string): Promise<EvaluationResult> {
    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question, userAnswer }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw error;
    }
  }

  async generateSpeech(text: string): Promise<AudioBuffer> {
    try {
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      const base64Audio = data.audioBase64;

      if (!base64Audio) {
        throw new Error('No audio data returned');
      }

      const audioContext = getDecodingContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const pcmData = decode(base64Audio);
      const audioBuffer = pcmToAudioBuffer(pcmData, audioContext, 24000);
      return audioBuffer;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
