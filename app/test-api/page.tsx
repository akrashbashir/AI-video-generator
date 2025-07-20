"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestApiPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testApiKey = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'Hello, this is a test.',
          voice: 'Rachel'
        }),
      });

      if (response.ok) {
        setResult('✅ API key is working! Audio generated successfully.');
      } else {
        const errorData = await response.json();
        setError(`❌ API Error: ${errorData.error}`);
      }
    } catch (err) {
      setError(`❌ Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testVoices = async () => {
    setIsLoading(true);
    setResult('');
    setError('');

    try {
      const response = await fetch('/api/generate-audio');
      
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Voices loaded successfully! Found ${data.voices?.length || 0} voices.`);
      } else {
        const errorData = await response.json();
        setError(`❌ Error loading voices: ${errorData.error}`);
      }
    } catch (err) {
      setError(`❌ Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">API Key Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Make sure you have created a <code>.env.local</code> file</li>
            <li>Add your ElevenLabs API key to the file</li>
            <li>Restart your development server</li>
            <li>Click the test buttons below</li>
          </ol>
        </div>

        <div className="space-y-4">
          <Button
            onClick={testVoices}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Voice Loading'}
          </Button>

          <Button
            onClick={testApiKey}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Audio Generation'}
          </Button>
        </div>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{result}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Common Issues:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Invalid API key:</strong> Get a new key from ElevenLabs dashboard</li>
            <li><strong>No credits:</strong> Check your ElevenLabs account balance</li>
            <li><strong>Environment not loaded:</strong> Restart the development server</li>
            <li><strong>Wrong file name:</strong> Make sure it's exactly <code>.env.local</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
} 