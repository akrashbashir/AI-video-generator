import os
import cv2
import numpy as np
import requests
import subprocess
from flask import Flask, request, send_file, render_template, redirect, url_for, session, flash
import firebase_admin
from firebase_admin import credentials, firestore
import json
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env.local'))

app = Flask(__name__, template_folder='template')
app.secret_key = os.getenv("FLASK_SECRET_KEY", "default-secret-key-for-dev")  # Set a secret key for sessions

# Initialize Firebase Admin SDK
FIREBASE_KEY_PATH = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()

# ElevenLabs API Configuration - Use environment variable
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  # Get from environment variable
ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Example: Rachel's voice (replace if needed)
ELEVENLABS_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"

# FIREBASE_API_KEY = "YOUR_FIREBASE_WEB_API_KEY"
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

# Frontend Routes
@app.route('/')
def home():
    print("Session contents:", session)  # Add this line
    if 'user' in session:
        return render_template('index.html', name=session.get('name', 'User'))
    return redirect(url_for('login'))


def firebase_signin(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    response = requests.post(url, data=json.dumps(payload), headers={"Content-Type": "application/json"})
    return response.json(), response.status_code

def firebase_signup(email, password):
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    response = requests.post(url, data=json.dumps(payload), headers={"Content-Type": "application/json"})
    return response.json(), response.status_code


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash('Email and password are required', 'error')
            return redirect(url_for('login'))
        
        result, status = firebase_signin(email, password)
        
        if status == 200:
            session['user'] = result.get('email', email)
                # Fetch name from Firestore
            try:
                user_id = result.get('localId')
                user_doc = db.collection('users').document(user_id).get()
                if user_doc.exists:
                    session['name'] = user_doc.to_dict().get('name')
                else:
                    session['name'] = 'User'
            except:
                session['name'] = 'User'

            return redirect(url_for('home'))
        else:
            error_message = result.get('error', {}).get('message', 'Login failed')
            flash(error_message, 'error')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        
        if not email or not password or not name:
            flash('Name, Email and password are required', 'error')
            return redirect(url_for('signup'))
        
        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return redirect(url_for('signup'))
        
        result, status = firebase_signup(email, password)
        
        if status == 200:
            session['user'] = result.get('email', email)
            session['name'] = name
            return redirect(url_for('home'))
        else:
            error_message = result.get('error', {}).get('message', 'Signup failed')
            flash(error_message, 'error')
            return redirect(url_for('signup'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

# API Routes (unchanged from your original code)
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

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    result, status = firebase_signup(email, password, name)
    return result, status

@app.route('/api/signin', methods=['POST'])
def api_signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    result, status = firebase_signin(email, password)
    return result, status

@app.route('/process', methods=['POST'])
def process():
    try:
        # Check if user is logged in
        if 'user' not in session:
            return {'error': 'Unauthorized'}, 401
            
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

        # Save record to Firestore
        try:
            doc_ref = db.collection('video_generations').document()
            doc_ref.set({
                'user': session['user'],
                'text': text,
                'avatar_filename': avatar.filename,
                'output_video': f'{output_path}_final.mp4',
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        except Exception as fb_err:
            print(f"Firestore error: {fb_err}")

        return send_file(f'{output_path}_final.mp4', mimetype='video/mp4')
        
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(port=5000)