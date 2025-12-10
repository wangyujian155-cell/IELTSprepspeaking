# Backend API Refactoring - Before & After

## Backend API Code

### `server/server.ts`
Express server with 5 main API endpoints:

```typescript
import express from 'express';
import cors from 'cors';
import { GeminiService } from './services/geminiService';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate Questions
app.post('/api/generate-questions', async (req, res) => {
  const { topicTitle, part } = req.body;
  const questions = await geminiService.generatePracticeQuestions(topicTitle, part);
  res.json({ questions });
});

// Generate Sample Answer
app.post('/api/generate-sample-answer', async (req, res) => {
  const { question, part } = req.body;
  const result = await geminiService.generateSampleAnswerText(question, part || 'part1');
  res.json(result);
});

// Transcribe Audio
app.post('/api/transcribe-audio', async (req, res) => {
  const { audioData, mimeType } = req.body;
  const transcription = await geminiService.transcribeAudio(audioData, mimeType);
  res.json({ transcription });
});

// Evaluate Answer
app.post('/api/evaluate-answer', async (req, res) => {
  const { question, userAnswer } = req.body;
  const evaluation = await geminiService.evaluateUserAnswer(question, userAnswer);
  res.json(evaluation);
});

// Generate Speech
app.post('/api/generate-speech', async (req, res) => {
  const { text } = req.body;
  const audioData = await geminiService.generateSpeech(text);
  res.json({ audioData });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
```

### `server/services/geminiService.ts`
The actual SDK implementation moved from frontend to backend:

```typescript
import { GoogleGenAI, Modality, Schema, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    // SDK initialization now happens on backend
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text);
  }

  async generateSampleAnswerText(question: string, part: string): Promise<ExpandedContent> {
    // All SDK calls protected by API key
    const response = await this.ai.models.generateContent({...});
    return JSON.parse(response.text);
  }

  async transcribeAudio(audioData: string, mimeType: string): Promise<string> {
    // Audio sent as base64 from frontend
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioData } },
          { text: "Transcribe the audio..." }
        ]
      }
    });
    return response.text;
  }

  async evaluateUserAnswer(question: string, userAnswer: string): Promise<EvaluationResult> {
    // Complex evaluation with schema validation
    const response = await this.ai.models.generateContent({...});
    return JSON.parse(response.text);
  }

  async generateSpeech(text: string): Promise<string> {
    // Returns base64 audio data
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [...],
      config: { responseModalities: [Modality.AUDIO], ... }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
}
```

---

## Frontend Code Changes

### Before: Direct SDK Usage in App.tsx

```typescript
// OLD: Import SDK directly
import { geminiService, ExpandedContent } from './services/geminiService';
import { GoogleGenAI } from "@google/genai";  // SDK bundled in frontend!

// Function calls used SDK directly
const QuestionExpanderPage = () => {
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await geminiService.generateSampleAnswerText(question, part);
      setResult(res);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
};

// Audio transcription
const handleRecordingComplete = async (blob: Blob, transcript: string) => {
  try {
    const refined = await geminiService.transcribeAudio(blob);  // SDK call in browser
    setUserAnswerText(refined);
  } catch(e) {
    console.error("Transcription refine failed", e);
  }
};

// Answer evaluation
const handleSubmitAnswer = async () => {
  try {
    const evalResult = await geminiService.evaluateUserAnswer(question, userAnswer);  // SDK in browser
    setEvaluation(evalResult);
    
    const genResult = await geminiService.generateSampleAnswerText(question, part);  // SDK in browser
    setCurrentAnswer(newAnswer);
  } catch (e) {
    console.error(e);
  }
};

// Speech generation
const handlePlayAudio = async (text: string) => {
  try {
    const buffer = await geminiService.generateSpeech(text);  // SDK in browser
    setGeneratedAudio(buffer);
  } catch (e) { 
    console.error(e); 
  }
};
```

**Problems:**
❌ API Key exposed in browser console
❌ Large SDK bundle size in frontend
❌ Security risk if browser is compromised
❌ API calls traceable to client-side

---

### After: Secure API Calls

```typescript
// NEW: Import fetch-based service
import { apiService, ExpandedContent } from './services/apiClient';

// Same component, same state management, different API calls
const QuestionExpanderPage = () => {
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await apiService.generateSampleAnswerText(question, part);  // ← Fetch to backend
      setResult(res);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
};

// Audio transcription
const handleRecordingComplete = async (blob: Blob, transcript: string) => {
  try {
    const refined = await apiService.transcribeAudio(blob);  // ← Fetch to backend
    setUserAnswerText(refined);
  } catch(e) {
    console.error("Transcription refine failed", e);
  }
};

// Answer evaluation
const handleSubmitAnswer = async () => {
  try {
    const evalResult = await apiService.evaluateUserAnswer(question, userAnswer);  // ← Fetch to backend
    setEvaluation(evalResult);
    
    const genResult = await apiService.generateSampleAnswerText(question, part);  // ← Fetch to backend
    setCurrentAnswer(newAnswer);
  } catch (e) {
    console.error(e);
  }
};

// Speech generation
const handlePlayAudio = async (text: string) => {
  try {
    const buffer = await apiService.generateSpeech(text);  // ← Fetch to backend
    setGeneratedAudio(buffer);
  } catch (e) { 
    console.error(e); 
  }
};
```

**Improvements:**
✅ No API Key in browser
✅ Smaller frontend bundle
✅ Secure server-side API calls
✅ Easy to scale and maintain
✅ Can add backend logging/monitoring

---

## Frontend API Service

### `services/apiClient.ts` (NEW)

```typescript
const API_BASE_URL = 'http://localhost:3001';

export class ApiService {
  // No SDK initialization - just fetch calls
  
  async generatePracticeQuestions(topicTitle: string, part: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle, part }),
    });
    const data = await response.json();
    return data.questions;
  }

  async generateSampleAnswerText(question: string, part: string): Promise<ExpandedContent> {
    const response = await fetch(`${API_BASE_URL}/api/generate-sample-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, part }),
    });
    return response.json();
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Convert blob to base64
    const base64data = await this.blobToBase64(audioBlob);
    
    const response = await fetch(`${API_BASE_URL}/api/transcribe-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        audioData: base64data, 
        mimeType: audioBlob.type || 'audio/webm' 
      }),
    });
    const data = await response.json();
    return data.transcription;
  }

  async evaluateUserAnswer(question: string, userAnswer: string): Promise<EvaluationResult> {
    const response = await fetch(`${API_BASE_URL}/api/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, userAnswer }),
    });
    return response.json();
  }

  async generateSpeech(text: string): Promise<AudioBuffer> {
    const response = await fetch(`${API_BASE_URL}/api/generate-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    
    // Convert base64 to AudioBuffer
    const audioContext = new AudioContext();
    const pcmData = this.decodeBase64(data.audioData);
    return this.pcmToAudioBuffer(pcmData, audioContext, 24000);
  }

  // Helper methods (decodeBase64, pcmToAudioBuffer) unchanged from original
}

export const apiService = new ApiService();
```

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **API Key Location** | Frontend (env.local) | Backend only (server/.env) |
| **SDK Bundle** | Included in frontend | Only in backend |
| **API Calls** | Direct SDK calls | HTTP fetch requests |
| **Security** | ❌ Key exposed in browser | ✅ Key protected server-side |
| **Scalability** | Single frontend process | Backend handles multiple clients |
| **JSX Structure** | N/A | ✅ 100% unchanged |
| **Component Logic** | Changed (SDK → fetch) | Kept same (async/await patterns) |
| **UI Responsiveness** | ✓ Same | ✓ Same (no loading state changes) |
| **Error Handling** | ✓ Preserved | ✓ Preserved |

---

## Deployment Considerations

### Frontend Deployment (Vite)
```bash
npm run build  # Creates optimized dist/ folder
# No API keys exposed
# Deploy to: Netlify, Vercel, or any static host
```

### Backend Deployment (Express)
```bash
cd server
npm run build  # Compiles TypeScript
npm start      # Runs Node.js server
# Set environment variables on hosting platform
# Ensure GEMINI_API_KEY is kept secret
```

## Files Modified

1. ✏️ `App.tsx` - Updated 4 API calls (lines 312, 661, 674, 679, 711)
2. ✏️ `vite.config.ts` - Removed API key exposure
3. ✏️ `package.json` - Added dev:all script
4. ✏️ `env.local` - API key now only in server/.env
5. ✨ `services/apiClient.ts` - NEW frontend API service
6. ✨ `server/server.ts` - NEW backend API server
7. ✨ `server/services/geminiService.ts` - NEW backend SDK service
8. ✨ `MIGRATION.md` - Setup and deployment guide
