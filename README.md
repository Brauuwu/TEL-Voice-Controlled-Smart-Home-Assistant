# 🏠 Smart Home Assistant

A modular smart home system featuring a rule-based automation engine, real-time web dashboard, and Vietnamese voice control.

## 🏗️ System Architecture

The system consists of three main components:

1.  **SmartHome_App**: Modern Web Interface (React), Backend Server (Node.js), and Voice Processing Service (Python).
2.  **SmartHome_Firmware**: Firmware for the Gateway (ESP32) and satellite Sensor/Actuator Nodes (ESP8266).
3.  **Connectivity**: Uses MQTT for cloud/external communication and NRF24L01 for the internal private sensor network.

## 🌟 Key Features

-   **Real-time Monitoring**: Track temperature, humidity, light intensity, and motion detection.
-   **Multi-mode Control**: Control devices via the Web Dashboard or Vietnamese Voice Commands (Google STT/TTS).
-   **Rule-based Automation**: Automatic device triggering (e.g., turn on lights when dark, activate fan when hot, or trigger alarm on motion detection).
-   **NRF24 Sensor Network**: Long-range wireless connection between nodes without requiring WiFi for internal communication.
-   **System Management**: User management, detailed activity logs (Mode tracking included), and sensor history charts.

## 📂 Project Structure

```text
.
├── SmartHome_App/          # Web Application & Voice Service
│   ├── client/             # React.js Frontend
│   ├── server/             # Node.js Backend
│   └── audio-service/      # Voice Command Service (Python)
└── SmartHome_Firmware/     # Microcontroller Firmware (PlatformIO)
    ├── src/                # Gateway ESP32 Logic
    └── esp8266_nodes/      # Sensors & Actuators Nodes
```

## 🚀 Quick Start

1.  **Firmware**: Flash the code to ESP32 and ESP8266 using PlatformIO or Arduino IDE.
2.  **Database**: Import the SQL schema (located in `server/data`) into your MySQL server.
3.  **Backend**: `cd SmartHome_App/server && npm install && npm start`.
4.  **Voice Service**: `cd SmartHome_App/audio-service && pip install -r requirements.txt && python main.py`.
5.  **Frontend**: `cd SmartHome_App/client && npm install && npm start`.

---
© 2026 D22 PTIT TEL Smart Home Assistant System. All rights reserved.
