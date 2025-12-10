/**
 * Frontend API Client for Gemini Services
 * 
 * This service replaces direct SDK calls with fetch requests to the backend API.
 * The backend API routes handle all Gemini AI SDK interactions securely on the server.
 */

const API_BASE_URL = 'http://localhost:3001';

export interface ExpandedContent {
  english: string;
  chinese: string;
  vocabularies: any[];
  sentences: any[];
  thinking_logic: string;
  key_arguments: string[];
  prosody_markup?: string;
  ipa?: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  better_version: string;
  prosody_markup?: string;
  ipa?: string;
  logic_analysis: any;
}

export class ApiService {
  /**
   * Generate practice questions for a given topic
   */
  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
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
    return data.questions;
  }

  /**
   * Generate sample answer text with vocabulary and strategy
   */
  async generateSampleAnswerText(question: string, part: string = 'part1'): Promise<ExpandedContent> {
    const response = await fetch(`${API_BASE_URL}/api/generate-sample-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, part }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate sample answer');
    }

    return response.json();
  }

  /**
   * Transcribe audio blob to text
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm';

          const response = await fetch(`${API_BASE_URL}/api/transcribe-audio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audioData: base64data, mimeType }),
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const data = await response.json();
          resolve(data.transcription);
        } catch (e) {
          console.error('Transcription failed', e);
          reject(e);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(audioBlob);
    });
  }

  /**
   * Evaluate user's spoken answer
   */
  async evaluateUserAnswer(question: string, userAnswer: string): Promise<EvaluationResult> {
    const response = await fetch(`${API_BASE_URL}/api/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, userAnswer }),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate answer');
    }

    return response.json();
  }

  /**
   * Generate speech audio from text
   * Returns AudioBuffer for playback
   */
  async generateSpeech(text: string): Promise<AudioBuffer> {
    const response = await fetch(`${API_BASE_URL}/api/generate-speech`, {
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
    
    // Convert base64 audio data to AudioBuffer
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const pcmData = this.decodeBase64(data.audioData);
    const audioBuffer = this.pcmToAudioBuffer(pcmData, audioContext, 24000);
    
    return audioBuffer;
  }

  /**
   * Helper: Decode Base64 to ArrayBuffer
   */
  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Helper: Convert raw PCM to AudioBuffer
   */
  private pcmToAudioBuffer(
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
}

export const apiService = new ApiService();
