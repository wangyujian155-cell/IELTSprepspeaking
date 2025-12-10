<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# IELTS Prep Speaking - AI-Powered Practice App

This is an IELTS speaking practice application powered by Google's Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1I263Y0x38mG1ciwi2nJDX1RhjQl2pXPf

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Netlify

This app is configured for Netlify deployment. See [NETLIFY_部署指南.md](./NETLIFY_部署指南.md) (Chinese) or [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) (English) for detailed instructions.

**Quick steps:**
1. Connect your GitHub repository to Netlify
2. Set `GEMINI_API_KEY` environment variable in Netlify dashboard
3. Deploy!

## Deploy to Vercel

This app also supports Vercel deployment:
1. Connect your GitHub repository to Vercel
2. Set `GEMINI_API_KEY` environment variable in Vercel dashboard
3. Deploy!
