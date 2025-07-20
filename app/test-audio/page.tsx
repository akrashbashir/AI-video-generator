"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Voice {
  name: string;
  id: string;
}

export default function TestAudioPage() {
  const [text, setText] = useState('Hello! This is a test of the text-to-audio functionality. Welcome to our AI video generator!');
  const [selectedVoice, setSelectedVoice] = useState('Rachel');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<string[]>([]);

  // Fetch available voices on component mount
  useEffect(() => {
    fetch('/api/generate-audio')
      .then(res => res.json())
      .then(data => {
        if (data.voices) {
          setVoices(data.voices);
        }
      })
      .catch(err => {
        console.error('Failed to fetch voices:', err);
      });
  }, []);

  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert to audio');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          stability: 0.5,
          similarity_boost: 0.5
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = `audio-${selectedVoice}-${Date.now()}.mp3`;
      a.click();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Text to Audio Test</h1>
      
      <div className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Voice:</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {voices.map(voice => (
              <option key={voice} value={voice}>
                {voice}
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Text to Convert:</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to audio..."
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

        {/* Generate Button */}
        <Button
          onClick={handleGenerateAudio}
          disabled={isLoading || !text.trim()}
          className="w-full"
        >
          {isLoading ? 'Generating Audio...' : 'Generate Audio'}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold">Generated Audio:</h3>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              Download Audio
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select a voice from the dropdown</li>
            <li>Enter or paste your text (max 5000 characters)</li>
            <li>Click "Generate Audio"</li>
            <li>Listen to the generated audio</li>
            <li>Download the audio file if needed</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 