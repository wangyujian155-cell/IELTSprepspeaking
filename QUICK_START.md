#!/usr/bin/env node

/**
 * IELTS Speaking Prep - Quick Start Guide
 * 
 * This script provides setup instructions for running both frontend and backend
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   IELTS Speaking Prep - Secure API Refactoring Complete ✅    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📋 WHAT CHANGED:
  ✅ Gemini API Key moved to secure backend (server/.env)
  ✅ Frontend now uses simple fetch API (no SDK bundled)
  ✅ All AI calls go through Express backend
  ✅ 100% UI and JSX preserved

🚀 QUICK START:

  1️⃣  Install Frontend Dependencies
      npm install

  2️⃣  Install Backend Dependencies
      cd server && npm install && cd ..

  3️⃣  Run Everything (Recommended)
      npm run dev:all

      This will start:
      • Frontend: http://localhost:3000
      • Backend:  http://localhost:3001

  4️⃣  Verify Backend is Running
      curl http://localhost:3001/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 PROJECT STRUCTURE:

  FRONTEND (Vite + React)
  ├── src/
  │   ├── App.tsx (Updated - uses apiService)
  │   ├── services/
  │   │   ├── apiClient.ts (NEW - fetch-based API calls)
  │   │   └── geminiService.ts (Deprecated)
  │   └── components/ (Unchanged)
  ├── vite.config.ts (Updated - no API key exposure)
  └── package.json (Added dev:all script)

  BACKEND (Express + Node.js) 
  ├── server.ts (NEW - API server)
  ├── services/
  │   └── geminiService.ts (NEW - SDK calls)
  ├── .env (API key protected)
  ├── package.json
  └── tsconfig.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 SECURITY IMPROVEMENTS:

  ❌ Before:  API Key in browser (compromised)
  ✅ After:   API Key only on server (protected)

  ❌ Before:  Large SDK bundle in frontend
  ✅ After:   SDK only in backend

  ❌ Before:  Direct SDK calls from browser
  ✅ After:   Secure server-side API calls

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 COMMON TASKS:

  Frontend Only (backend running elsewhere)
    npm run dev

  Backend Only
    cd server && npm run dev

  Both Together (Recommended)
    npm run dev:all

  Build for Production
    npm run build

  Test Backend API
    curl -X POST http://localhost:3001/health

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 DOCUMENTATION:

  • MIGRATION.md - Complete setup and deployment guide
  • REFACTORING_SUMMARY.md - Before/after code comparison
  • DETAILED_CHANGES.md - Line-by-line changes in App.tsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 API ENDPOINTS:

  POST  /api/generate-questions      Generate practice questions
  POST  /api/generate-sample-answer  Generate sample answer + vocab
  POST  /api/transcribe-audio        Convert audio to text
  POST  /api/evaluate-answer         Evaluate user's answer
  POST  /api/generate-speech         Convert text to audio

  All endpoints require:
    Content-Type: application/json
    Backend running on http://localhost:3001

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  ENVIRONMENT VARIABLES:

  Backend (server/.env):
    PORT=3001
    GEMINI_API_KEY=your_key_here

  Frontend (.env.local):
    (Optional - defaults to http://localhost:3001)
    VITE_API_BASE_URL=http://your-backend-url:3001

  ⚠️  DO NOT COMMIT server/.env with real API keys!
      Add to .gitignore:
        server/.env

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ TROUBLESHOOTING:

  Backend won't start?
    • Check if port 3001 is already in use
    • Verify GEMINI_API_KEY is set in server/.env
    • Check that dependencies installed: cd server && npm install

  API calls failing?
    • Verify backend is running: curl http://localhost:3001/health
    • Check browser console for error messages
    • Verify both frontend and backend are running

  CORS errors?
    • Ensure frontend is on http://localhost:3000
    • Ensure backend is on http://localhost:3001
    • CORS is configured in server.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 DEPLOYMENT:

  Backend (Node.js/Express):
    • Deploy to: Render, Railway, Heroku, AWS, GCP, Azure
    • Set environment variable: GEMINI_API_KEY
    • Start command: npm install && npm run build && npm start

  Frontend (Vite):
    • Deploy to: Vercel, Netlify, GitHub Pages
    • Build command: npm run build
    • Output directory: dist/
    • Update apiClient.ts API_BASE_URL to production backend

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ NEXT STEPS:

  1. Install dependencies (both frontend and backend)
  2. Start the development servers: npm run dev:all
  3. Test all features in the app
  4. Verify all AI functions work correctly
  5. Deploy backend to production
  6. Update frontend API URL for production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Made with ❤️ for secure, scalable AI applications
`);
