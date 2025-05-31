from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import uuid
import sys
from omegaconf import OmegaConf
import cv2
from flask_cors import CORS
import threading
from functools import wraps 

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.inference import main as run_inference

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

UPLOAD_FOLDER = 'temp'
OUTPUT_FOLDER = 'outputs'
CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'configs', 'unet', 'stage2.yaml'))

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

LATENTSYNC_API_KEY = os.environ.get('FLASK_LATENTSYNC_API_KEY')

if not LATENTSYNC_API_KEY:
    print("WARNING: FLASK_LATENTSYNC_API_KEY environment variable not set. API will be unsecured.", file=sys.stderr)
else:
    print(f"DEBUG: LATENTSYNC_API_KEY loaded by Flask: '{LATENTSYNC_API_KEY}' (Length: {len(LATENTSYNC_API_KEY)})", file=sys.stderr)

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200

        if not LATENTSYNC_API_KEY:
            print("WARNING: API Key not set on server. Skipping auth for this request.", file=sys.stderr)
            return f(*args, **kwargs)

        sent_key = request.headers.get('X-API-Key') 
        
        print(f"\n--- LATENTSYNC API KEY DEBUG START ---", file=sys.stderr)
        print(f"Flask expects (from env): '{LATENTSYNC_API_KEY}'", file=sys.stderr)
        print(f"Received key (from frontend 'X-API-Key'): '{sent_key}'", file=sys.stderr)
        print(f"Are they equal? {sent_key == LATENTSYNC_API_KEY}", file=sys.stderr)
        print(f"--- LATENTSYNC API KEY DEBUG END ---\n", file=sys.stderr)

        if sent_key != LATENTSYNC_API_KEY:
            return jsonify({'error': 'Invalid API Key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

@app.route("/")
def index():
    return "LatentSync API is up and running 🚀"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "LatentSync_API"}), 200

@app.route('/api/lipsync', methods=['POST', 'OPTIONS'])
@require_api_key
def lipsync():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    video = request.files['video']
    filename = secure_filename(video.filename)
    unique_name = f"{uuid.uuid4()}_{filename}.mp4"
    video_path = os.path.join(UPLOAD_FOLDER, unique_name)
    video.save(video_path)

    if os.path.getsize(video_path) == 0:
        os.remove(video_path)
        return jsonify({'error': 'Invalid or empty video file'}), 400

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap.release()
        os.remove(video_path)
        return jsonify({'error': 'Invalid or empty video file or not a valid video format'}), 400
    cap.release()

    audio = request.files['audio']
    audio_filename = secure_filename(audio.filename)
    audio_unique_name = f"{uuid.uuid4()}_{audio_filename}"
    audio_path = os.path.join(UPLOAD_FOLDER, audio_unique_name)
    audio.save(audio_path)

    try:
        config = OmegaConf.load(CONFIG_PATH)

        overrides = OmegaConf.create({
            'input_video_path': video_path,
            'output_path': os.path.join(OUTPUT_FOLDER, f"out_{unique_name}.mp4"),
        })
        config = OmegaConf.merge(config, overrides)

        from types import SimpleNamespace
        args = SimpleNamespace(
            inference_ckpt_path=r"C:\Users\navee\Documents\Avatar_Lab[1]\avatar_lab backend\LatentSync\checkpoints\latentsync_unet.pt",
            video_path=video_path,
            audio_path=audio_path,
            video_out_path=config.output_path,
            inference_steps=20,
            guidance_scale=1.0,
            seed=42
        )

        print(f"[INFO] Running inference on {video_path}")
        result = run_inference(config=config, args=args)
        output_path = result.get('output_path') if isinstance(result, dict) else config.output_path

        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Output file not found: {output_path}. Inference might have failed.")

        return send_file(output_path, as_attachment=True)

    except Exception as e:
        print(f"[ERROR] An error occurred during lipsync processing: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return jsonify({'error': 'Internal server error during processing', 'details': 'Please check server logs for details.'}), 500

    finally:
        def cleanup_files_async():
            if os.path.exists(video_path):
                os.remove(video_path)
                print(f"[INFO] Cleaned up video file: {video_path}")
            if os.path.exists(audio_path):
                os.remove(audio_path)
                print(f"[INFO] Cleaned up audio file: {audio_path}")
            cleanup_thread = threading.Thread(target=cleanup_files_async)
            cleanup_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6900, debug=True)