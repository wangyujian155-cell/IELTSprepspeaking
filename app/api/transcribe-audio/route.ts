import { NextRequest, NextResponse } from 'next/server';
import { GeminiServiceBackend } from '@/lib/geminiServiceBackend';

export async function POST(request: NextRequest) {
  try {
    const { audioBase64, mimeType } = await request.json();
    
    if (!audioBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: audioBase64 and mimeType' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiServiceBackend();
    const transcription = await geminiService.transcribeAudio(audioBase64, mimeType);
    
    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
