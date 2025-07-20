# AI Video Generator

A Next.js application that generates AI videos by converting text to speech and performing lip-sync on uploaded avatar images/videos.

## 🚀 Features

- **Text-to-Speech**: Convert text to audio using ElevenLabs API or browser speech synthesis
- **Multiple Voices**: 25+ different voices available
- **Free TTS Option**: Browser-based speech synthesis (no API key required)
- **Avatar Upload**: Support for image and video avatars
- **Lip-Sync**: Synchronize audio with avatar movements
- **Real-time Processing**: Progress tracking and status updates
- **Download Support**: Save generated videos and audio files

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Text-to-Speech**: ElevenLabs API + Browser Speech Synthesis
- **File Upload**: React Dropzone
- **Deployment**: Netlify

## 📦 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/akrashbashir/AI-video-generator.git
cd AI-video-generator
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```bash
# ElevenLabs API Configuration (optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Set to 'development' for detailed error messages
NODE_ENV=development
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open your browser**: Navigate to `http://localhost:3000`

## 🎯 Usage

### Free Text-to-Speech (No API Key Required)
- Visit `/test-audio-free` for browser-based speech synthesis
- Select from your browser's available voices
- Enter text and hear it immediately
- Works offline and completely free

### ElevenLabs Text-to-Speech (Requires API Key)
- Visit `/test-audio` for ElevenLabs integration
- Get an API key from [ElevenLabs](https://elevenlabs.io/)
- Add your API key to `.env.local`
- Access 25+ high-quality voices

### Full Video Generation
- Visit the main page `/`
- Enter your script
- Upload an avatar (image or video)
- Generate the complete video with lip-sync

## 🌐 API Endpoints

### Text-to-Speech (ElevenLabs)
- `POST /api/generate-audio` - Generate audio from text
- `GET /api/generate-audio` - Get available voices

### Free Text-to-Speech
- `POST /api/generate-audio-free` - Browser-based TTS
- `GET /api/generate-audio-free` - Get browser voices

### Lip-Sync
- `POST /api/lip-sync` - Process avatar with audio

## 🚀 Deployment

### Deploy to Netlify

1. **Connect to GitHub**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository

2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

3. **Add environment variables**:
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key

4. **Deploy**: Click "Deploy site"

### Deploy to Vercel

1. **Connect to GitHub**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure environment variables**:
   - Add `ELEVENLABS_API_KEY`

3. **Deploy**: Vercel will automatically deploy

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | No (for free TTS) |
| `NODE_ENV` | Environment mode | No |

### Available Voices (ElevenLabs)

- Rachel (default)
- Domi, Bella, Antoni, Elli, Josh
- Arnold, Adam, Sam, Callum, Serena
- Fin, Freya, Shimmer, Charlie, Emily
- And many more...

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Get a new API key from ElevenLabs dashboard
   - Ensure your account has sufficient credits

2. **"ElevenLabs API key not configured"**
   - Create `.env.local` file
   - Add your API key
   - Restart the development server

3. **Audio not playing**
   - Check browser console for errors
   - Try the free TTS option at `/test-audio-free`

4. **Build errors**
   - Ensure Node.js version 18+ is installed
   - Clear `.next` folder and rebuild

## 📁 Project Structure

```
ai-video-generator/
├── app/
│   ├── api/                 # API routes
│   ├── test-audio/         # ElevenLabs TTS test
│   ├── test-audio-free/    # Free TTS test
│   ├── test-api/           # API testing
│   └── page.tsx            # Main page
├── components/
│   └── ui/                 # UI components
├── lib/                    # Utilities and constants
├── scripts/                # Python scripts (Wav2Lip)
└── public/                 # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io/) for high-quality text-to-speech
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for components

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Visit the [test pages](#-usage) to verify functionality
3. Open an issue on GitHub

---

**Made with ❤️ by [akrashbashir](https://github.com/akrashbashir)**
