import os
import subprocess
import tempfile
import shutil
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
import speech_recognition as sr

# Lấy đường dẫn ffmpeg từ imageio-ffmpeg (bundle sẵn, không cần cài thủ công)
try:
    import imageio_ffmpeg as _iio
    FFMPEG_EXE = _iio.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = shutil.which("ffmpeg") or "ffmpeg"

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def make_saved_filename(original_name: str | None, content_type: str | None):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    suffix = Path(original_name or "upload").suffix
    if not suffix:
        if content_type:
            if "webm" in content_type:
                suffix = ".webm"
            elif "wav" in content_type:
                suffix = ".wav"
            elif "mpeg" in content_type or "mp3" in content_type:
                suffix = ".mp3"
            else:
                suffix = ".bin"
        else:
            suffix = ".bin"
    return f"voice_{timestamp}{suffix}"


def convert_to_wav(input_path: str) -> tuple[str, bool]:
    """Convert bất kỳ audio nào sang WAV 16kHz mono bằng ffmpeg trực tiếp."""
    if input_path.lower().endswith(".wav"):
        return input_path, False
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    result = subprocess.run(
        [FFMPEG_EXE, "-y", "-i", input_path, "-ar", "16000", "-ac", "1", tmp.name],
        capture_output=True,
    )
    if result.returncode != 0:
        err = result.stderr.decode(errors="replace")
        raise RuntimeError(f"ffmpeg conversion failed: {err[-400:]}")
    return tmp.name, True


def transcribe_google(wav_path: str, language: str = "vi-VN") -> str:
    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio = recognizer.record(source)
    try:
        return recognizer.recognize_google(audio, language=language)
    except sr.RequestError as e:
        raise RuntimeError(f"Google API request failed: {e}")
    except sr.UnknownValueError:
        return ""


def transcribe_file(input_path: str, language: str = "vi-VN") -> str:
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    wav_path, cleaned = convert_to_wav(input_path)
    try:
        return transcribe_google(wav_path, language=language)
    finally:
        if cleaned and os.path.exists(wav_path):
            try:
                os.remove(wav_path)
            except Exception:
                pass


@app.get("/")
def home():
    return jsonify({
        "service": "audio-service",
        "status": "running",
        "engine": "google",
        "ffmpeg": FFMPEG_EXE,
        "message": "POST /transcribe with an audio file to get text.",
    })


@app.post("/transcribe")
def transcribe_endpoint():
    audio_file = request.files.get("file")
    if audio_file is None:
        return jsonify({"error": "Missing file field named 'file'"}), 400

    language = request.form.get("lang", "vi-VN")

    saved_name = make_saved_filename(audio_file.filename, audio_file.content_type)
    saved_path = UPLOAD_DIR / saved_name
    try:
        audio_file.save(saved_path)
        text = transcribe_file(str(saved_path), language=language)
        return jsonify({"text": text})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Transcription failed: {e}"}), 500


@app.get("/files")
def files():
    items = []
    for fp in sorted(UPLOAD_DIR.glob("*"), key=lambda f: f.stat().st_mtime, reverse=True):
        if fp.is_file():
            stat = fp.stat()
            items.append({"name": fp.name, "size": stat.st_size,
                          "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()})
    return jsonify({"files": items})


@app.get("/health")
def health():
    return jsonify({"ok": True, "engine": "google", "ffmpeg": FFMPEG_EXE})


from gtts import gTTS
import uuid

@app.post("/tts")
def tts_endpoint():
    data = request.get_json()
    text = data.get("text", "")
    lang = data.get("lang", "vi")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
        
    filename = f"tts_{uuid.uuid4()}.mp3"
    filepath = UPLOAD_DIR / filename
    
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(str(filepath))
        return jsonify({
            "url": f"/audio/uploads/{filename}",
            "text": text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/audio/uploads/<filename>")
def get_audio(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_DIR, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=True)
