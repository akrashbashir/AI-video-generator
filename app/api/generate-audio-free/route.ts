import { NextResponse } from 'next/server';

// Free TTS using browser speech synthesis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice = 'default' } = body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // For now, return a success response with instructions
    // The actual TTS will be handled on the client side
    return NextResponse.json({
      success: true,
      message: 'Text-to-speech will be handled by browser speech synthesis',
      text: text,
      voice: voice
    });

  } catch (error) {
    console.error('Free TTS error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process text',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  return NextResponse.json({
    voices: [
      'default',
      'en-US',
      'en-GB',
      'en-AU',
      'en-CA',
      'en-IN',
      'en-IE',
      'en-ZA',
      'en-NZ'
    ],
    defaultVoice: 'default',
    maxTextLength: 5000,
    type: 'browser-speech-synthesis'
  });
} 