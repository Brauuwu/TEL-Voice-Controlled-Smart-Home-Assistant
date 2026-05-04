import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_AUDIO_SERVICE_URL =
    process.env.REACT_APP_AUDIO_SERVICE_URL || 'http://localhost:5000';

const VoiceCommandPanel = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const [lang, setLang] = useState('vi-VN');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            stopTracks();
            clearTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const stopTracks = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const startTimer = () => {
        clearTimer();
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
            setRecordingTime((value) => value + 1);
        }, 1000);
    };

    const pickMediaRecorderMimeType = () => {
        const candidates = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
        ];

        for (const candidate of candidates) {
            if (window.MediaRecorder && MediaRecorder.isTypeSupported(candidate)) {
                return candidate;
            }
        }

        return '';
    };

    const handleStartRecording = async () => {
        setError('');
        setTranscript('');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Trình duyệt không hỗ trợ ghi âm bằng microphone.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            chunksRef.current = [];

            const mimeType = pickMediaRecorderMimeType();
            const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                clearTimer();
                stopTracks();

                const blob = new Blob(chunksRef.current, {
                    type: mediaRecorder.mimeType || 'audio/webm',
                });
                chunksRef.current = [];

                if (blob.size === 0) {
                    setError('Không có dữ liệu âm thanh để gửi.');
                    return;
                }

                setIsSending(true);
                try {
                    const formData = new FormData();
                    const ext = blob.type.includes('webm') ? 'webm' : 'wav';
                    const fileName = `voice-command-${Date.now()}.${ext}`;
                    formData.append('file', blob, fileName);
                    formData.append('lang', lang);

                    const response = await fetch(
                        `${DEFAULT_AUDIO_SERVICE_URL}/transcribe`,
                        { method: 'POST', body: formData },
                    );

                    const rawText = await response.text();
                    let payload = {};
                    try {
                        payload = rawText ? JSON.parse(rawText) : {};
                    } catch {
                        payload = { raw: rawText };
                    }

                    if (!response.ok) {
                        throw new Error(
                            payload.error || payload.raw ||
                            `Gửi âm thanh thất bại (HTTP ${response.status}).`,
                        );
                    }

                    setTranscript(payload.text || '');
                    if (!payload.text) {
                        setError('Không nhận ra nội dung nào. Hãy thử nói to và rõ hơn.');
                    }
                } catch (sendError) {
                    setError(sendError.message || 'Không thể gọi audio-service.');
                } finally {
                    setIsSending(false);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            startTimer();
        } catch (recordError) {
            setError(recordError.message || 'Không thể mở microphone.');
            stopTracks();
            clearTimer();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Ghi âm để ra lệnh</h3>
                    <p className="text-sm text-slate-500">
                        Ghi âm, gửi sang audio-service (Google Speech API), rồi hiển thị kết quả bên dưới.
                    </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {formatTime(recordingTime)}
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Engine
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
                        Google Speech API
                    </div>
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-700">
                    Ngôn ngữ
                    <input
                        className="rounded-lg border border-slate-300 px-3 py-2"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        placeholder="vi-VN"
                        disabled={isRecording || isSending}
                    />
                </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                {!isRecording ? (
                    <button
                        className="rounded-xl bg-emerald-600 px-5 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleStartRecording}
                        disabled={isSending}
                    >
                        {isSending ? 'Đang xử lý...' : 'Ghi âm'}
                    </button>
                ) : (
                    <button
                        className="rounded-xl bg-rose-600 px-5 py-2 text-white transition hover:bg-rose-700"
                        onClick={handleStopRecording}
                    >
                        Dừng và gửi
                    </button>
                )}

                <div className="text-sm text-slate-500">
                    {isRecording
                        ? 'Đang ghi âm...'
                        : isSending
                        ? 'Đang gửi file sang Google Speech API...'
                        : 'Nhấn ghi âm để bắt đầu.'}
                </div>
            </div>

            {error ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-700">Kết quả nhận dạng</div>
                <div className="mt-2 min-h-[80px] whitespace-pre-wrap rounded-xl border border-dashed border-slate-300 bg-white p-3 text-slate-900">
                    {transcript || 'Chưa có kết quả.'}
                </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">
                API mặc định: {DEFAULT_AUDIO_SERVICE_URL}/transcribe
            </div>

            <div className="mt-1 text-xs text-slate-500">
                Nếu không chạy được, kiểm tra <span className="font-medium">GET /health</span> và <span className="font-medium">GET /files</span> trên audio-service.
            </div>
        </div>
    );
};

export default VoiceCommandPanel;
