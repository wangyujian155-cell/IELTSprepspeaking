import { NextRequest, NextResponse } from 'next/server';
import { GeminiServiceBackend } from '@/lib/geminiServiceBackend';

export async function POST(request: NextRequest) {
  try {
    const { topicTitle, part } = await request.json();
    
    if (!topicTitle || !part) {
      return NextResponse.json(
        { error: 'Missing required fields: topicTitle and part' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiServiceBackend();
    const questions = await geminiService.generatePracticeQuestions(topicTitle, part);
    
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
