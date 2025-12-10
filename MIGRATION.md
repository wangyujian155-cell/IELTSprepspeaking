# IELTS Speaking Prep - Migration to Backend API

## Overview

This project has been refactored to move Gemini AI SDK calls from the frontend (client-side) to a secure backend API. This protects your API Key from being exposed in the browser.

### Architecture

```
Frontend (Vite + React)
    ↓ (fetch requests)
Backend API (Express.js)
    ↓ (SDK calls)
Google Gemini AI
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure API Keys

The backend `.env` file is already configured with your Gemini API key:

```bash
# server/.env
PORT=3001
GEMINI_API_KEY=AIzaSyCrezSGp02tOb50woxvtcnrgdWVQDsdjRI
```

**Important:** Never commit `.env` files with real API keys to version control. Add it to `.gitignore`:

```
server/.env
```

### 4. Running the Application

**Option A: Run Frontend Only** (if backend is running separately)
```bash
npm run dev
```

**Option B: Run Both Simultaneously** (Recommended for development)
```bash
npm run dev:all
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 5. Verify Backend is Running

Test the health endpoint:
```bash
curl http://localhost:3001/health
# Expected response: {"status":"ok"}
```

## API Endpoints

The backend exposes the following endpoints:

### Health Check
```
GET /health
```

### Generate Questions
```
POST /api/generate-questions
Content-Type: application/json

{
  "topicTitle": "Technology",
  "part": "part1"
}
```

### Generate Sample Answer
```
POST /api/generate-sample-answer
Content-Type: application/json

{
  "question": "Do you like technology?",
  "part": "part1"
}
```

### Transcribe Audio
```
POST /api/transcribe-audio
Content-Type: application/json

{
  "audioData": "base64_encoded_audio",
  "mimeType": "audio/webm"
}
```

### Evaluate Answer
```
POST /api/evaluate-answer
Content-Type: application/json

{
  "question": "Do you like technology?",
  "userAnswer": "Yes, I do like technology..."
}
```

### Generate Speech
```
POST /api/generate-speech
Content-Type: application/json

{
  "text": "This is the text to convert to speech"
}
```

## File Structure

```
/
├── src/
│   ├── App.tsx              (Updated to use apiService)
│   ├── services/
│   │   ├── apiClient.ts     (NEW - Frontend API client)
│   │   └── geminiService.ts (DEPRECATED - kept for reference)
│   └── ...
│
├── server/                   (NEW - Backend server)
│   ├── server.ts            (Express server setup)
│   ├── services/
│   │   └── geminiService.ts (Backend Gemini service)
│   ├── .env                 (API keys - DO NOT COMMIT)
│   ├── .env.example         (Template for .env)
│   ├── package.json
│   └── tsconfig.json
│
├── vite.config.ts           (Updated - no API key exposure)
├── package.json             (Updated with dev:all script)
└── ...
```

## Security Improvements

✅ **API Key Protected**: The Gemini API key is now only accessible server-side
✅ **CORS Configured**: Backend uses CORS for safe cross-origin requests
✅ **Environment Variables**: Backend uses `.env` file for sensitive data
✅ **No Client SDK**: Frontend no longer bundles or initializes the Gemini SDK

## Frontend Changes Summary

### Changed: Import Statement
```typescript
// Before
import { geminiService, ExpandedContent } from './services/geminiService';

// After
import { apiService, ExpandedContent } from './services/apiClient';
```

### Changed: All API Calls
```typescript
// Before
const result = await geminiService.generateSampleAnswerText(question, part);

// After
const result = await apiService.generateSampleAnswerText(question, part);
```

All four main functions in App.tsx have been updated:
1. `generateSampleAnswerText()` - line 312
2. `transcribeAudio()` - line 661
3. `evaluateUserAnswer()` - line 674
4. `generateSpeech()` - line 711

### Preserved: UI & State Logic
✅ All JSX structure unchanged
✅ CSS classes preserved
✅ State management (isLoading, messages, etc.) unchanged
✅ User interactions identical

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# If in use, either:
# 1. Stop the process using the port
# 2. Change PORT in server/.env
```

### API calls failing
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check server logs for errors
# Make sure GEMINI_API_KEY is set in server/.env
```

### CORS errors
The backend is configured with CORS enabled. If you see CORS errors:
1. Verify both frontend and backend are running
2. Check that frontend is accessing `http://localhost:3001`

## Environment Variables

### Frontend (.env.local)
No Gemini API key needed anymore. Only used for backend API URL if different from localhost:

```
# Optional - defaults to http://localhost:3001
VITE_API_BASE_URL=http://your-backend-url:3001
```

### Backend (server/.env)
```
PORT=3001
GEMINI_API_KEY=your_api_key_here
```

## Next Steps

1. **Set up Git ignore**: Add `server/.env` to `.gitignore`
2. **Deploy Backend**: Choose a hosting service (Vercel, Railway, Render, etc.)
3. **Update Frontend**: Change `API_BASE_URL` in `services/apiClient.ts` to your deployed backend
4. **Test**: Verify all AI functions work through the backend

## References

- [Google Generative AI SDK](https://github.com/google-ai-sdk/google-generative-ai-js)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)
