import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const VoiceAssistant = ({ onCommand, sensors, status }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);
    const sensorsRef = useRef(sensors);
    const onCommandRef = useRef(onCommand);
    const isSpeakingRef = useRef(isSpeaking);
    const isListeningRef = useRef(isListening);
    const statusRef = useRef(status);

    // Keep refs up to date to avoid stale closures
    useEffect(() => {
        sensorsRef.current = sensors;
    }, [sensors]);

    useEffect(() => {
        onCommandRef.current = onCommand;
    }, [onCommand]);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Back to standard mode
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onresult = (event) => {
            if (isSpeakingRef.current) return;

            const text = event.results[0][0].transcript;
            setTranscript(text);

            if (event.results[0].isFinal) {
                processCommand(text);
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
            }
        };
    }, []);

    // Effect to handle start/stop based on isListening state
    useEffect(() => {
        if (isListening && recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Recognition start error:", e);
            }
        } else if (!isListening && recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // Ignore error if already stopped
            }
        }
    }, [isListening]);

    const toggleListening = () => {
        setIsListening(!isListening);
    };

    const processCommand = (text) => {
        const lowerText = text.toLowerCase();
        let responseText = "Tôi không hiểu lệnh này.";
        const currentSensors = sensorsRef.current;
        const currentStatus = statusRef.current;

        // Keywords for any recognized command
        const isRecognized = lowerText.includes("bật") || lowerText.includes("tắt") || 
                             lowerText.includes("nhiệt độ") || lowerText.includes("độ ẩm") || 
                             lowerText.includes("ánh sáng") || lowerText.includes("thông số") ||
                             lowerText.includes("nóng") || lowerText.includes("mưa") || lowerText.includes("thời tiết") ||
                             lowerText.includes("còi") || lowerText.includes("rèm") || lowerText.includes("điều hòa") ||
                             lowerText.includes("tivi") || lowerText.includes("chuyển động") || lowerText.includes("mở") || lowerText.includes("đóng") || lowerText.includes("dừng");
        
        if (currentStatus !== 'online' && isRecognized) {
            speak("Rất tiếc, hệ thống đang ngoại tuyến, không thể lấy dữ liệu hoặc thực hiện lệnh lúc này.");
            return;
        }

        if (lowerText.includes("bật đèn") || lowerText.includes("mở đèn")) {
            onCommandRef.current({ device: 'led', action: 'ON', type: 'voice' });
            responseText = "Đã bật đèn cho bạn.";
        } else if (lowerText.includes("tắt đèn") || lowerText.includes("đóng đèn")) {
            onCommandRef.current({ device: 'led', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt đèn.";
        } else if (lowerText.includes("bật quạt") || lowerText.includes("mở quạt")) {
            onCommandRef.current({ device: 'fan', action: 'ON', type: 'voice' });
            responseText = "Đã bật quạt.";
        } else if (lowerText.includes("tắt quạt") || lowerText.includes("dừng quạt")) {
            onCommandRef.current({ device: 'fan', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt quạt.";
        } else if (lowerText.includes("bật còi") || lowerText.includes("báo động")) {
            onCommandRef.current({ device: 'buzzer', action: 'ON', type: 'voice' });
            responseText = "Đã bật còi báo động.";
        } else if (lowerText.includes("tắt còi") || lowerText.includes("dừng báo động")) {
            onCommandRef.current({ device: 'buzzer', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt còi.";
        } else if (lowerText.includes("mở rèm") || lowerText.includes("bật rèm")) {
            onCommandRef.current({ device: 'curtain', action: 100, type: 'voice' });
            responseText = "Đã mở rèm cửa.";
        } else if (lowerText.includes("đóng rèm") || lowerText.includes("tắt rèm")) {
            onCommandRef.current({ device: 'curtain', action: 0, type: 'voice' });
            responseText = "Đã đóng rèm.";
        } else if (lowerText.includes("bật điều hòa") || lowerText.includes("mở điều hòa")) {
            onCommandRef.current({ device: 'ac', action: 100, type: 'voice' });
            responseText = "Đã bật điều hòa.";
        } else if (lowerText.includes("tắt điều hòa") || lowerText.includes("dừng điều hòa")) {
            onCommandRef.current({ device: 'ac', action: 0, type: 'voice' });
            responseText = "Đã tắt điều hòa.";
        } else if (lowerText.includes("bật tivi") || lowerText.includes("bật tv") || lowerText.includes("mở tivi")) {
            onCommandRef.current({ device: 'tv', action: 'ON', type: 'voice' });
            responseText = "Đã bật tivi.";
        } else if (lowerText.includes("tắt tivi") || lowerText.includes("tắt tv") || lowerText.includes("dừng tivi")) {
            onCommandRef.current({ device: 'tv', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt tivi.";
        } else if (lowerText.includes("chế độ tự động") || lowerText.includes("bật tự động") || lowerText.includes("chuyển sang tự động") || lowerText.includes("auto")) {
            onCommandRef.current({ device: 'mode', action: 'auto', type: 'voice' });
            responseText = "Đã chuyển sang chế độ tự động.";
        } else if (lowerText.includes("chế độ thủ công") || lowerText.includes("tắt tự động") || lowerText.includes("chuyển sang thủ công") || lowerText.includes("manual")) {
            onCommandRef.current({ device: 'mode', action: 'manual', type: 'voice' });
            responseText = "Đã chuyển sang chế độ thủ công.";
        } else if (lowerText.includes("nhiệt độ") || lowerText.includes("nóng không")) {
            responseText = `Nhiệt độ hiện tại là ${currentSensors.temperature} độ C.`;
        } else if (lowerText.includes("độ ẩm") || lowerText.includes("mưa không")) {
            responseText = `Độ ẩm hiện tại là ${currentSensors.humidity} phần trăm.`;
        } else if (lowerText.includes("ánh sáng") || lowerText.includes("sáng không")) {
            responseText = `Cường độ ánh sáng hiện tại là ${currentSensors.ldr} lux.`;
        } else if (lowerText.includes("chuyển động") || lowerText.includes("có ai không")) {
            responseText = currentSensors.motion ? "Phát hiện có chuyển động trong khu vực." : "Hiện không có chuyển động nào.";
        } else if (lowerText.includes("thông số") || lowerText.includes("thời tiết")) {
            responseText = `Hiện tại nhiệt độ là ${currentSensors.temperature} độ, độ ẩm ${currentSensors.humidity} phần trăm, ánh sáng là ${currentSensors.ldr} lux và ${currentSensors.motion ? 'có' : 'không có'} chuyển động.`;
        }

        speak(responseText);
    };

    const speak = async (text) => {
        setIsSpeaking(true);
        // Safety timeout to reset speaking state after 7 seconds max
        const timeout = setTimeout(() => setIsSpeaking(false), 7000);
        
        try {
            const response = await axios.post('http://localhost:5000/tts', { text, lang: 'vi' });
            const audio = new Audio(`http://localhost:5000${response.data.url}`);
            audio.onended = () => {
                clearTimeout(timeout);
                setIsSpeaking(false);
            };
            audio.play().catch(e => {
                clearTimeout(timeout);
                setIsSpeaking(false);
            });
        } catch (error) {
            console.error("TTS Error:", error);
            clearTimeout(timeout);
            setIsSpeaking(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-50">
            {transcript && (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-xs animate-in slide-in-from-bottom-4 duration-300">
                    <p className="text-gray-800 text-sm italic">"{transcript}"</p>
                </div>
            )}
            <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isListening ? 'bg-red-500 animate-pulse scale-110' : 
                    isSpeaking ? 'bg-blue-500 animate-bounce' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
        </div>
    );
};

export default VoiceAssistant;
