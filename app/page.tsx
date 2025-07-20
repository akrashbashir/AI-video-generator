"use client";
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function Home() {
  const [script, setScript] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'video/*': ['.mp4', '.mov']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setAvatar(acceptedFiles[0]);
      setError(null);
    }
  });

  const handleGenerate = async () => {
    if (!script || !avatar) {
      setError('Please add a script and upload an avatar!');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      setProgress(10);
      // 1. Generate audio
      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({ text: script }),
      });
      
      if (!audioRes.ok) throw new Error('Audio generation failed');
      
      setProgress(40);
      const audioBlob = await audioRes.blob();

      // 2. Lip-sync
      const formData = new FormData();
      formData.append('avatar', avatar);
      formData.append('audio', new Blob([audioBlob], { type: 'audio/mpeg' }));

      setProgress(60);
      const videoRes = await fetch('/api/lip-sync', {
        method: 'POST',
        body: formData,
      });
      
      if (!videoRes.ok) throw new Error('Lip-sync failed');
      
      setProgress(90);
      const videoBlob = await videoRes.blob();
      setVideoUrl(URL.createObjectURL(videoBlob));
      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">AI Video Generator</h1>
        <div className="space-x-2">
          <Link href="/test-api">
            <Button variant="outline" size="sm">
              Test API
            </Button>
          </Link>
          <Link href="/test-audio-free">
            <Button variant="outline" size="sm">
              Free TTS
            </Button>
          </Link>
          <Link href="/test-audio">
            <Button variant="outline">
              Test Text-to-Audio
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="space-y-6 max-w-2xl">
        <Textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your script here..."
          className="min-h-[200px]"
        />

        <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
          <input {...getInputProps()} />
          <p className="text-center">
            {avatar ? avatar.name : 'Drag & drop an image/video avatar here, or click to select'}
          </p>
        </div>

        {error && (
          <div className="text-red-500 p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <Button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </Button>

        {isLoading && (
          <Progress value={progress} className="h-2" />
        )}

        {videoUrl && (
          <div className="mt-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Generated Video</h2>
            <video 
              src={videoUrl} 
              controls 
              className="w-full rounded-lg border shadow-sm"
            />
            <Button 
              variant="outline" 
              className="mt-2 w-full"
              onClick={() => {
                const a = document.createElement('a');
                a.href = videoUrl;
                a.download = `generated-video-${Date.now()}.mp4`;
                a.click();
              }}
            >
              Download Video
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}