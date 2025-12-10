# IELTS Prep.AI - Next.js Full-Stack Application

**🔐 Secure Backend API Implementation**

This application has been converted to Next.js with secure backend API routes to protect your Gemini API key.

## Security Features

✅ **Backend API Routes**: All AI calls are processed on the server
✅ **Environment Variables**: API key stored securely in `.env.local`  
✅ **No Client Exposure**: API key never reaches the browser
✅ **Type-Safe**: Full TypeScript support

## Quick Start

1. **Install Dependencies**
```powershell
npm install
```

2. **Configure API Key**
Create or edit `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Run Development Server**
```powershell
npm run dev
```

4. **Open Application**
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/                    # 🔒 Secure Backend API Routes
│   │   ├── generate-questions/
│   │   ├── generate-sample-answer/
│   │   ├── transcribe-audio/
│   │   ├── evaluate-answer/
│   │   └── generate-speech/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   └── geminiServiceBackend.ts # 🔒 Server-side Gemini service
├── services/
│   └── geminiService.ts        # ✅ Client-side API wrapper
├── components/                 # React components
├── App.tsx                     # Main application
└── .env.local                  # 🔒 Your API key (gitignored)
```

## How Security Works

1. **`.env.local`** stores your API key (never committed to git)
2. **`lib/geminiServiceBackend.ts`** uses the key on the server only
3. **`app/api/*`** routes handle all AI requests on the backend
4. **`services/geminiService.ts`** makes fetch calls to your API routes
5. **Browser** never sees the API key

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run linter

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio | Yes |

Get your API key: https://aistudio.google.com/

## Features

- ✅ IELTS Speaking Parts 1, 2, & 3 practice
- ✅ AI-generated sample answers with IPA and prosody
- ✅ Voice recording and transcription
- ✅ Answer evaluation and feedback
- ✅ Text-to-speech synthesis
- ✅ Vocabulary deck management
- ✅ Custom topic creation
- ✅ Dark mode support
- ✅ **Secure backend API (API key protected)**

## Migration Notes

This project was migrated from Vite + React Router to Next.js:

- ✅ React Router → Client-side state routing
- ✅ Vite environment variables → Next.js environment variables
- ✅ Frontend API calls → Backend API routes
- ✅ Same UI/UX, improved security

## Important Security Notes

⚠️ **Never commit `.env.local` to version control**  
⚠️ **Never expose your API key in client-side code**  
⚠️ **Rotate your API key if accidentally exposed**  

All AI functionality is now processed securely on the backend!

---

**Original AI Studio App**: https://ai.studio/apps/drive/1I263Y0x38mG1ciwi2nJDX1RhjQl2pXPf
