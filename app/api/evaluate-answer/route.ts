import { NextRequest, NextResponse } from 'next/server';
import { GeminiServiceBackend } from '@/lib/geminiServiceBackend';

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer } = await request.json();
    
    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: question and userAnswer' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiServiceBackend();
    const evaluation = await geminiService.evaluateUserAnswer(question, userAnswer);
    
    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
