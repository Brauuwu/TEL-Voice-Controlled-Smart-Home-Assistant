import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { VOICE_URL } from '../config';

const VoiceAssistant = ({ onCommand, sensors, status, devices }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);
    const sensorsRef = useRef(sensors);
    const onCommandRef = useRef(onCommand);
    const isSpeakingRef = useRef(isSpeaking);
    const isListeningRef = useRef(isListening);
    const statusRef = useRef(status);
    const devicesRef = useRef(devices);

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
        devicesRef.current = devices;
    }, [devices]);

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
                try { recognitionRef.current.stop(); } catch (e) { }
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
            lowerText.includes("tivi") || lowerText.includes("chuyển động") || lowerText.includes("mở") ||
            lowerText.includes("đóng") || lowerText.includes("dừng") || lowerText.includes("yếu") ||
            lowerText.includes("vừa") || lowerText.includes("max") || lowerText.includes("hé") ||
            lowerText.includes("toang") || lowerText.includes("nửa") || lowerText.includes("mức") ||
            lowerText.includes("sáng") || lowerText.includes("độ c") ||
            lowerText.includes("tăng") || lowerText.includes("giảm");

        if (currentStatus !== 'online' && isRecognized) {
            speak("Rất tiếc, hệ thống đang ngoại tuyến, không thể lấy dữ liệu hoặc thực hiện lệnh lúc này.");
            return;
        }

        // === LED: 4 levels (0=off, 1=dim, 2=medium, 3=max) ===
        if (lowerText.includes("đèn sáng yếu") || lowerText.includes("đèn mức 1") || lowerText.includes("đèn yếu")) {
            onCommandRef.current({ device: 'led', action: 1, type: 'voice' });
            responseText = "Đã chỉnh đèn sáng yếu.";
        } else if (lowerText.includes("đèn sáng vừa") || lowerText.includes("đèn mức 2") || lowerText.includes("đèn vừa")) {
            onCommandRef.current({ device: 'led', action: 2, type: 'voice' });
            responseText = "Đã chỉnh đèn sáng vừa.";
        } else if (lowerText.includes("đèn sáng max") || lowerText.includes("đèn mức 3") || lowerText.includes("đèn tối đa") || lowerText.includes("đèn hết cỡ")) {
            onCommandRef.current({ device: 'led', action: 3, type: 'voice' });
            responseText = "Đã chỉnh đèn sáng tối đa.";
        } else if (lowerText.includes("bật đèn") || lowerText.includes("mở đèn")) {
            onCommandRef.current({ device: 'led', action: 3, type: 'voice' });
            responseText = "Đã bật đèn sáng tối đa.";
        } else if (lowerText.includes("tắt đèn") || lowerText.includes("đóng đèn")) {
            onCommandRef.current({ device: 'led', action: 0, type: 'voice' });
            responseText = "Đã tắt đèn.";
        } else if (lowerText.includes("tăng đèn") || lowerText.includes("đèn sáng hơn") || lowerText.includes("tăng sáng") || lowerText.includes("sáng hơn") || lowerText.includes("tăng độ sáng")) {
            const currentLed = devicesRef.current.led || 0;
            if (currentLed >= 3) {
                responseText = "Đèn đã ở mức sáng tối đa rồi.";
            } else {
                const newLevel = currentLed + 1;
                const labels = ['tắt', 'yếu', 'vừa', 'tối đa'];
                onCommandRef.current({ device: 'led', action: newLevel, type: 'voice' });
                responseText = `Đã tăng đèn lên mức ${labels[newLevel]}.`;
            }
        } else if (lowerText.includes("giảm đèn") || lowerText.includes("đèn tối hơn") || lowerText.includes("giảm sáng") || lowerText.includes("tối hơn") || lowerText.includes("giảm độ sáng")) {
            const currentLed = devicesRef.current.led || 0;
            if (currentLed <= 0) {
                responseText = "Đèn đã tắt rồi.";
            } else {
                const newLevel = currentLed - 1;
                const labels = ['tắt', 'yếu', 'vừa', 'tối đa'];
                onCommandRef.current({ device: 'led', action: newLevel, type: 'voice' });
                responseText = newLevel === 0 ? "Đã tắt đèn." : `Đã giảm đèn xuống mức ${labels[newLevel]}.`;
            }

        // === FAN ===
        } else if (lowerText.includes("bật quạt") || lowerText.includes("mở quạt")) {
            onCommandRef.current({ device: 'fan', action: 'ON', type: 'voice' });
            responseText = "Đã bật quạt.";
        } else if (lowerText.includes("tắt quạt") || lowerText.includes("dừng quạt")) {
            onCommandRef.current({ device: 'fan', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt quạt.";

        // === BUZZER ===
        } else if (lowerText.includes("bật còi") || lowerText.includes("báo động")) {
            onCommandRef.current({ device: 'buzzer', action: 'ON', type: 'voice' });
            responseText = "Đã bật còi báo động.";
        } else if (lowerText.includes("tắt còi") || lowerText.includes("dừng báo động")) {
            onCommandRef.current({ device: 'buzzer', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt còi.";

        // === CURTAIN: 3 levels (0=closed, 50=half, 100=open) ===
        } else if (lowerText.includes("mở rèm vừa") || lowerText.includes("rèm hé") || lowerText.includes("rèm nửa") || lowerText.includes("mở hé rèm")) {
            onCommandRef.current({ device: 'curtain', action: 50, type: 'voice' });
            responseText = "Đã mở rèm vừa phải.";
        } else if (lowerText.includes("mở rèm") || lowerText.includes("bật rèm") || lowerText.includes("mở toang rèm") || lowerText.includes("rèm hết")) {
            onCommandRef.current({ device: 'curtain', action: 100, type: 'voice' });
            responseText = "Đã mở toang rèm cửa.";
        } else if (lowerText.includes("đóng rèm") || lowerText.includes("tắt rèm")) {
            onCommandRef.current({ device: 'curtain', action: 0, type: 'voice' });
            responseText = "Đã đóng rèm.";

        // === AC: temperature 20-29°C or off ===
        } else if (lowerText.includes("tắt điều hòa") || lowerText.includes("dừng điều hòa")) {
            onCommandRef.current({ device: 'ac', action: 0, type: 'voice' });
            responseText = "Đã tắt điều hòa.";
        } else if (lowerText.includes("tăng điều hòa") || lowerText.includes("tăng nhiệt độ điều hòa") || lowerText.includes("điều hòa tăng") || lowerText.includes("ấm hơn")) {
            const currentAc = devicesRef.current.ac || 0;
            if (currentAc >= 29) {
                responseText = "Điều hòa đã ở mức tối đa 29 độ C rồi.";
            } else if (currentAc < 20) {
                onCommandRef.current({ device: 'ac', action: 20, type: 'voice' });
                responseText = "Đã bật điều hòa ở 20 độ C.";
            } else {
                const newTemp = currentAc + 1;
                onCommandRef.current({ device: 'ac', action: newTemp, type: 'voice' });
                responseText = `Đã tăng điều hòa lên ${newTemp} độ C.`;
            }
        } else if (lowerText.includes("giảm điều hòa") || lowerText.includes("giảm nhiệt độ điều hòa") || lowerText.includes("điều hòa giảm") || lowerText.includes("mát hơn") || lowerText.includes("lạnh hơn")) {
            const currentAc = devicesRef.current.ac || 0;
            if (currentAc <= 20 && currentAc >= 1) {
                onCommandRef.current({ device: 'ac', action: 0, type: 'voice' });
                responseText = "Đã tắt điều hòa.";
            } else if (currentAc < 20) {
                responseText = "Điều hòa đang tắt. Hãy nói bật điều hòa trước.";
            } else {
                const newTemp = currentAc - 1;
                onCommandRef.current({ device: 'ac', action: newTemp, type: 'voice' });
                responseText = `Đã giảm điều hòa xuống ${newTemp} độ C.`;
            }
        } else if (lowerText.includes("điều hòa")) {
            // Try to extract temperature: "điều hòa 24 độ" or "bật điều hòa 25"
            const tempMatch = lowerText.match(/(\d+)\s*(độ|°)/);
            if (tempMatch) {
                let temp = parseInt(tempMatch[1]);
                if (temp >= 20 && temp <= 29) {
                    onCommandRef.current({ device: 'ac', action: temp, type: 'voice' });
                    responseText = `Đã chỉnh điều hòa ${temp} độ C.`;
                } else {
                    responseText = `Nhiệt độ ${temp} độ nằm ngoài phạm vi. Vui lòng chọn từ 20 đến 29 độ C.`;
                }
            } else if (lowerText.includes("bật") || lowerText.includes("mở")) {
                onCommandRef.current({ device: 'ac', action: 25, type: 'voice' });
                responseText = "Đã bật điều hòa ở 25 độ C.";
            }

        // === TV ===
        } else if (lowerText.includes("bật tivi") || lowerText.includes("bật tv") || lowerText.includes("mở tivi")) {
            onCommandRef.current({ device: 'tv', action: 'ON', type: 'voice' });
            responseText = "Đã bật tivi.";
        } else if (lowerText.includes("tắt tivi") || lowerText.includes("tắt tv") || lowerText.includes("dừng tivi")) {
            onCommandRef.current({ device: 'tv', action: 'OFF', type: 'voice' });
            responseText = "Đã tắt tivi.";

        // === MODE ===
        } else if (lowerText.includes("chế độ tự động") || lowerText.includes("bật tự động") || lowerText.includes("chuyển sang tự động") || lowerText.includes("auto")) {
            onCommandRef.current({ device: 'mode', action: 'auto', type: 'voice' });
            responseText = "Đã chuyển sang chế độ tự động.";
        } else if (lowerText.includes("chế độ thủ công") || lowerText.includes("tắt tự động") || lowerText.includes("chuyển sang thủ công") || lowerText.includes("manual")) {
            onCommandRef.current({ device: 'mode', action: 'manual', type: 'voice' });
            responseText = "Đã chuyển sang chế độ thủ công.";

        // === SENSOR QUERIES ===
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
            const response = await axios.post(`${VOICE_URL}/tts`, { text, lang: 'vi' });
            const audio = new Audio(`${VOICE_URL}${response.data.url}`);
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
        <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 flex flex-col items-end gap-4 z-50">
            {transcript && (
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white max-w-[280px] lg:max-w-xs animate-in slide-in-from-bottom-4 duration-300">
                    <p className="text-slate-600 text-xs lg:text-sm font-bold italic leading-relaxed text-center px-2">"{transcript}"</p>
                </div>
            )}
            <button
                onClick={toggleListening}
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${isListening ? 'bg-rose-500 animate-pulse scale-110 shadow-rose-200' :
                        isSpeaking ? 'bg-blue-500 animate-bounce shadow-blue-200' : 'premium-gradient hover:scale-110 active:scale-95 shadow-indigo-200'
                    }`}
            >
                {isListening ? (
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
        </div>
    );
};


export default VoiceAssistant;
