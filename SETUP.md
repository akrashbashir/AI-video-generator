# Text-to-Audio Setup Guide

## Prerequisites

1. **ElevenLabs Account**: Sign up at [https://elevenlabs.io/](https://elevenlabs.io/)
2. **API Key**: Get your API key from the ElevenLabs dashboard

## Environment Setup

1. Create a `.env.local` file in your project root:
```bash
# ElevenLabs API Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Set to 'development' for detailed error messages
NODE_ENV=development
```

2. Replace `your_elevenlabs_api_key_here` with your actual ElevenLabs API key

## Testing the Text-to-Audio Functionality

1. **Start the development server**:
```bash
npm run dev
```

2. **Visit the test page**: Navigate to `http://localhost:3000/test-audio`

3. **Test the functionality**:
   - Select a voice from the dropdown
   - Enter some text (max 5000 characters)
   - Click "Generate Audio"
   - Listen to the generated audio
   - Download the audio file if needed

## Available Voices

The application includes multiple voices from ElevenLabs:
- Rachel (default)
- Domi
- Bella
- Antoni
- Elli
- Josh
- Arnold
- Adam
- Sam
- Callum
- Serena
- Fin
- Freya
- Shimmer
- Charlie
- Emily
- And many more...

## API Endpoints

### POST `/api/generate-audio`
Converts text to speech using ElevenLabs API.

**Request Body**:
```json
{
  "text": "Your text here",
  "voice": "Rachel",
  "stability": 0.5,
  "similarity_boost": 0.5
}
```

**Response**: Audio file (MP3 format)

### GET `/api/generate-audio`
Returns available voices and configuration.

**Response**:
```json
{
  "voices": ["Rachel", "Domi", "Bella", ...],
  "defaultVoice": "Rachel",
  "maxTextLength": 5000
}
```

## Troubleshooting

### Common Issues

1. **"ElevenLabs API key not configured"**
   - Make sure you have created `.env.local` file
   - Verify your API key is correct
   - Restart the development server after adding the environment variable

2. **"Invalid API key"**
   - Check your ElevenLabs API key in the dashboard
   - Ensure you have sufficient credits in your ElevenLabs account

3. **"Rate limit exceeded"**
   - Wait a few minutes before trying again
   - Check your ElevenLabs usage limits

4. **Audio not playing**
   - Check browser console for errors
   - Ensure your browser supports MP3 audio playback
   - Try downloading the audio file instead

### Getting Help

- Check the browser console for detailed error messages
- Verify your ElevenLabs account status and credits
- Ensure your internet connection is stable 