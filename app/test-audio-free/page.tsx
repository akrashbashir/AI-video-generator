"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Voice {
  name: string;
  lang: string;
}

export default function TestAudioFreePage() {
  const [text, setText] = useState('Hello! This is a test of the free text-to-speech functionality. Welcome to our AI video generator!');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice (preferably English)
      const defaultVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.default
      ) || voices.find(voice => 
        voice.lang.startsWith('en')
      ) || voices[0];
      
      setSelectedVoice(defaultVoice || null);
    };

    // Load voices immediately if available
    loadVoices();

    // Also load when voices change
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to speech');
      return;
    }

    if (!selectedVoice) {
      setError('No voice selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stop any current speech
      window.speechSynthesis.cancel();

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.voice = selectedVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsLoading(false);
        setError(`Speech synthesis error: ${event.error}`);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('Error with speech synthesis:', err);
      setError(err instanceof Error ? err.message : 'Failed to start speech synthesis');
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Free Text-to-Speech Test</h1>
      
      <div className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Voice:</label>
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = availableVoices.find(v => v.name === e.target.value);
              setSelectedVoice(voice || null);
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableVoices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang}) {voice.default ? '(Default)' : ''}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {availableVoices.length} voices available
          </p>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Text to Convert:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="min-h-[150px]"
            maxLength={5000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {text.length}/5000 characters
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleSpeak}
            disabled={isLoading || isSpeaking || !text.trim() || !selectedVoice}
            className="w-full"
          >
            {isLoading ? 'Preparing...' : isSpeaking ? 'Speaking...' : 'Speak Text'}
          </Button>

          {isSpeaking && (
            <div className="flex space-x-2">
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1"
              >
                Pause
              </Button>
              <Button
                onClick={handleResume}
                variant="outline"
                className="flex-1"
              >
                Resume
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                className="flex-1"
              >
                Stop
              </Button>
            </div>
          )}
        </div>

        {/* Status */}
        {isSpeaking && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              🔊 Speaking: "{text.length > 50 ? text.substring(0, 50) + '...' : text}"
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select a voice from the dropdown (your browser's available voices)</li>
            <li>Enter or paste your text (max 5000 characters)</li>
            <li>Click "Speak Text" to hear the audio</li>
            <li>Use pause/resume/stop controls while speaking</li>
            <li>This uses your browser's built-in speech synthesis (free!)</li>
          </ol>
        </div>

        {/* Features */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Free Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>No API key required</li>
            <li>No account needed</li>
            <li>Works offline</li>
            <li>Multiple voices available</li>
            <li>Real-time speech synthesis</li>
            <li>Pause/Resume/Stop controls</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 