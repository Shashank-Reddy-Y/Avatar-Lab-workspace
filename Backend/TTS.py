from flask import Flask, request, jsonify, send_file
import os
import io
import uuid
import requests
import traceback
import torch
import torchaudio
from flask_cors import CORS
import sys
from functools import wraps 

os.environ['PHONEMIZER_ESPEAK_LIBRARY'] = r'C:\Program Files\eSpeak NG\libespeak-ng.dll'
os.environ['PATH'] += os.pathsep + r'C:\Program Files\eSpeak NG'

import torch._dynamo
torch._dynamo.config.suppress_errors = True

from phonemizer.backend import EspeakBackend
from zonos.model import Zonos
from zonos.conditioning import make_cond_dict
from zonos.utils import DEFAULT_DEVICE as device

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

OUTPUT_FOLDER = 'outputs'
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

ZONOS_API_KEY = os.environ.get('FLASK_ZONOS_API_KEY')

if not ZONOS_API_KEY:
    print("WARNING: FLASK_ZONOS_API_KEY environment variable not set. API will be unsecured.", file=sys.stderr)
else:
    print(f"DEBUG: ZONOS_API_KEY loaded by Flask: '{ZONOS_API_KEY}' (Length: {len(ZONOS_API_KEY)})", file=sys.stderr)

try:
    model = Zonos.from_pretrained("Zyphra/Zonos-v0.1-transformer", device=device)
    print("[INFO] Zonos model loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load Zonos model: {str(e)}", file=sys.stderr)
    sys.exit(1)

@app.route("/")
def index():
    return "Zonos TTS API is up and running 🚀"

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200

        if not ZONOS_API_KEY:
            print("WARNING: API Key not set on server. Skipping auth for this request.", file=sys.stderr)
            return f(*args, **kwargs)

        sent_key = request.headers.get('X-API-Key') 
        
        print(f"\n--- ZONOS API KEY DEBUG START ---", file=sys.stderr)
        print(f"Flask expects (from env): '{ZONOS_API_KEY}'", file=sys.stderr)
        print(f"Received key (from frontend 'X-API-Key'): '{sent_key}'", file=sys.stderr)
        print(f"Are they equal? {sent_key == ZONOS_API_KEY}", file=sys.stderr)
        print(f"--- ZONOS API KEY DEBUG END ---\n", file=sys.stderr)

        if sent_key != ZONOS_API_KEY:
            return jsonify({'error': 'Invalid API Key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "TTS_API"}), 200

@app.route('/api/generate_speech', methods=['POST', 'OPTIONS'])
@require_api_key
def generate_speech():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    if 'speaker_audio_path' not in data:
        return jsonify({'error': 'No speaker audio path provided'}), 400

    text = data['text']
    speaker_audio_path = data.get('speaker_audio_path')
    language = data.get('language', 'en-us')

    try:
        wav = None
        sampling_rate = None

        if speaker_audio_path.startswith('http://') or speaker_audio_path.startswith('https://'):
            print(f"[INFO] Downloading speaker audio from URL: {speaker_audio_path}")
            response = requests.get(speaker_audio_path, timeout=10)
            response.raise_for_status()
            audio_buffer = io.BytesIO(response.content)
            wav, sampling_rate = torchaudio.load(audio_buffer)
        else:
            speaker_audio_path_abs = os.path.abspath(speaker_audio_path)
            if not os.path.exists(speaker_audio_path_abs):
                return jsonify({'error': f"Speaker audio file not found: {speaker_audio_path}"}), 400
            print(f"[INFO] Loading speaker audio from local file: {speaker_audio_path_abs}")
            wav, sampling_rate = torchaudio.load(speaker_audio_path_abs)

        if wav.dim() > 1 and wav.shape[0] > 1:
            wav = wav.mean(dim=0, keepdim=True)
        if sampling_rate != model.autoencoder.sampling_rate:
            print(f"[INFO] Resampling speaker audio from {sampling_rate}Hz to {model.autoencoder.sampling_rate}Hz.")
            resampler = torchaudio.transforms.Resample(orig_freq=sampling_rate, new_freq=model.autoencoder.sampling_rate)
            wav = resampler(wav)
            sampling_rate = model.autoencoder.sampling_rate

        speaker = model.make_speaker_embedding(wav, sampling_rate)
        cond_dict = make_cond_dict(text=text, speaker=speaker, language=language)
        conditioning = model.prepare_conditioning(cond_dict)

        codes = model.generate(conditioning)
        wavs = model.autoencoder.decode(codes).cpu()

        output_filename = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        torchaudio.save(output_path, wavs[0], model.autoencoder.sampling_rate)

        print(f"[INFO] Generated speech saved to: {output_path}")
        return send_file(output_path, as_attachment=True, mimetype='audio/wav')

    except requests.exceptions.RequestException as req_e:
        print(f"[ERROR] Network error downloading speaker audio: {req_e}", file=sys.stderr)
        return jsonify({'error': 'Failed to download speaker audio from URL', 'details': str(req_e)}), 500
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred during speech generation: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return jsonify({'error': 'Internal server error during processing', 'details': 'Please check server logs for details.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)