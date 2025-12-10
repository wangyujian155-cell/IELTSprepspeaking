# Netlify Deployment Instructions

This application can be deployed on Netlify with the following steps:

## Prerequisites
- A Netlify account
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Deployment Steps

1. **Connect your repository to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git repository

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

3. **Set environment variables**
   - In your Netlify site dashboard, go to "Site configuration" → "Environment variables"
   - Add a new variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your Gemini API key

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your application

## How it works

- The `netlify.toml` file configures the build settings and redirects
- The `/api/*` requests are redirected to `/.netlify/functions/*`
- The Netlify serverless function in `netlify/functions/gemini.js` handles the Gemini API calls
- This keeps your API key secure on the server side

## Testing locally

To test the Netlify functions locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run the development server
netlify dev
```

This will start both the Vite dev server and the Netlify functions locally.
