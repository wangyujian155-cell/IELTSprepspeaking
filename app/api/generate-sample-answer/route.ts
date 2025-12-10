import { NextRequest, NextResponse } from 'next/server';
import { GeminiServiceBackend } from '@/lib/geminiServiceBackend';

export async function POST(request: NextRequest) {
  try {
    const { question, part } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Missing required field: question' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiServiceBackend();
    const content = await geminiService.generateSampleAnswerText(question, part || 'part1');
    
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error generating sample answer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate sample answer' },
      { status: 500 }
    );
  }
}
