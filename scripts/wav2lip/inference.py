import os
import cv2
import numpy as np
import requests
import subprocess
from flask import Flask, request, send_file

app = Flask(__name__)

# ElevenLabs API Configuration - Use environment variable
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  # Get from environment variable
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Example: Rachel's voice (replace if needed)
ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

def generate_audio_from_text(text, output_path):
    """Generate audio using ElevenLabs API and save to file."""
    if not ELEVENLABS_API_KEY:
        raise Exception("ELEVENLABS_API_KEY environment variable not set")
    
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    response = requests.post(ELEVENLABS_URL, json=data, headers=headers)
    
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        raise Exception(f"ElevenLabs API Error: {response.text}")

@app.route('/process', methods=['POST'])
def process():
    try:
        # Save uploaded files
        avatar = request.files['avatar']
        text = request.form.get('text')  # Get text from form data
        
        temp_dir = 'temp'
        os.makedirs(temp_dir, exist_ok=True)
        
        avatar_path = os.path.join(temp_dir, 'avatar.mp4')
        audio_path = os.path.join(temp_dir, 'audio.mp3')
        output_path = os.path.join(temp_dir, 'output.mp4')
        
        avatar.save(avatar_path)
        
        # Generate audio from text using ElevenLabs
        if text:
            generate_audio_from_text(text, audio_path)
        
        # Simple lip-sync simulation (replace with actual Wav2Lip)
        cap = cv2.VideoCapture(avatar_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            out.write(frame)
        
        cap.release()
        out.release()
        
        # Merge with audio (simplified)
        cmd = f'ffmpeg -y -i {output_path} -i {audio_path} -c:v copy -c:a aac -strict experimental {output_path}_final.mp4'
        subprocess.run(cmd, shell=True, check=True)
        
        return send_file(f'{output_path}_final.mp4', mimetype='video/mp4')
        
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(port=5000)