import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeminiService } from './services/geminiService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Service with server-side API key
const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Generate Practice Questions
app.post('/api/generate-questions', async (req: Request, res: Response) => {
  try {
    const { topicTitle, part } = req.body;
    
    if (!topicTitle || !part) {
      return res.status(400).json({ error: 'Missing topicTitle or part' });
    }

    const questions = await geminiService.generatePracticeQuestions(topicTitle, part);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// Generate Sample Answer Text
app.post('/api/generate-sample-answer', async (req: Request, res: Response) => {
  try {
    const { question, part } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    const result = await geminiService.generateSampleAnswerText(question, part || 'part1');
    res.json(result);
  } catch (error) {
    console.error('Error generating sample answer:', error);
    res.status(500).json({ error: 'Failed to generate sample answer' });
  }
});

// Transcribe Audio
app.post('/api/transcribe-audio', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData' });
    }

    const transcription = await geminiService.transcribeAudio(audioData, mimeType);
    res.json({ transcription });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Evaluate User Answer
app.post('/api/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, userAnswer } = req.body;
    
    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Missing question or userAnswer' });
    }

    const evaluation = await geminiService.evaluateUserAnswer(question, userAnswer);
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
});

// Generate Speech
app.post('/api/generate-speech', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const audioData = await geminiService.generateSpeech(text);
    res.json({ audioData });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
