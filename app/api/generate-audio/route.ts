import { NextResponse } from 'next/server';

// Available voice IDs from ElevenLabs
const VOICES = {
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Domi': 'AZnzlk1XvdvUeBnXmlld',
  'Bella': 'EXAVITQu4vr4xnSDxMaL',
  'Antoni': 'ErXwobaYiN019PkySvjV',
  'Elli': 'MF3mGyEYCl7XYWbV9V6O',
  'Josh': 'TxGEqnHWrfWFTfGW9XjX',
  'Arnold': 'VR6AewLTigWG4xSOukaG',
  'Adam': 'pNInz6obpgDQGcFmaJgB',
  'Sam': 'yoZ06aMxZJJ28mfd3POQ',
  'Callum': 'GBv7mTt0atIp3Br8iCZE',
  'Serena': 'XB0fDUnXU5powFXDhCwa',
  'Fin': 'VR6AewLTigWG4xSOukaG',
  'Freya': 'jsCqWAovK2LkecY7zXl4',
  'Shimmer': 'VR6AewLTigWG4xSOukaG',
  'Charlie': 'IKne3meq5aSn9XLyUdCD',
  'Emily': 'LcfcDJNUP1GQjkzn1xUU',
  'Patrick': 'VR6AewLTigWG4xSOukaG',
  'Ryan': 'VR6AewLTigWG4xSOukaG',
  'Dave': 'VR6AewLTigWG4xSOukaG',
  'Daniel': 'VR6AewLTigWG4xSOukaG',
  'Sarah': 'VR6AewLTigWG4xSOukaG',
  'Phil': 'VR6AewLTigWG4xSOukaG',
  'Steve': 'VR6AewLTigWG4xSOukaG',
  'Joseph': 'VR6AewLTigWG4xSOukaG',
  'Myra': 'VR6AewLTigWG4xSOukaG',
  'Kendall': 'VR6AewLTigWG4xSOukaG',
  'Will': 'VR6AewLTigWG4xSOukaG',
  'Clyde': 'VR6AewLTigWG4xSOukaG',
  'Diana': 'VR6AewLTigWG4xSOukaG',
  'Thomas': 'VR6AewLTigWG4xSOukaG'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice = 'Rachel', stability = 0.5, similarity_boost = 0.5 } = body;

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

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Get voice ID
    const voiceId = VOICES[voice as keyof typeof VOICES] || VOICES['Rachel'];

    // Generate audio using ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: Math.max(0, Math.min(1, stability)),
            similarity_boost: Math.max(0, Math.min(1, similarity_boost))
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error:', errorData);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your ElevenLabs API key.' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate audio',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  return NextResponse.json({
    voices: Object.keys(VOICES),
    defaultVoice: 'Rachel',
    maxTextLength: 5000
  });
}