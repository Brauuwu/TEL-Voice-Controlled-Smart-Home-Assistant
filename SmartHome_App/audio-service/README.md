# audio-service

Flask API for speech-to-text processing.

## Install

```powershell
cd BTL/BTL/audio-service
python -m pip install -r requirements.txt
```

## Run

```powershell
cd BTL/BTL/audio-service
python main.py
```

The server starts on `http://localhost:5000` by default.

## Endpoints

- `GET /` - service info
- `GET /health` - health check
- `GET /files` - list saved uploads
- `POST /transcribe` - transcribe an uploaded audio file

### POST /transcribe

Send a multipart form request with:

- `file` - audio file
- `engine` - `whisper` or `google` (default: `whisper`)
- `lang` - language code, for example `vi-VN`
- `whisper_model` - model name like `tiny`, `base`, `small`, `medium`, `large`

Example using PowerShell and `curl.exe`:

```powershell
curl.exe -X POST http://localhost:5000/transcribe ^
  -F "file=@input.mp3" ^
  -F "engine=whisper" ^
  -F "lang=vi-VN" ^
  -F "whisper_model=small"
```

Check uploaded files:

```powershell
curl.exe http://localhost:5000/files
```
