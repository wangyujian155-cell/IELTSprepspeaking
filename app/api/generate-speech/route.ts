import { NextRequest, NextResponse } from 'next/server';
import { GeminiServiceBackend } from '@/lib/geminiServiceBackend';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiServiceBackend();
    const audioBase64 = await geminiService.generateSpeech(text);
    
    return NextResponse.json({ audioBase64 });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
