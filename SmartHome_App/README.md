# 📱 TEL SmartHome Assistant

A smart home monitoring and control system integrated with a Vietnamese voice assistant. The project is optimized for both PC and Smartphone with a modern, fluid user experience.

## ✨ Key Features

-   **📱 Mobile-First UI**: Premium design optimized for touch interactions, featuring a convenient Bottom Navigation Bar.
-   **🎙️ Vietnamese Voice Assistant**: Control devices and query sensor data via Vietnamese voice commands (Powered by Google Speech Recognition & gTTS).
-   **📊 Real-time Monitoring**: Visualize temperature, humidity, and light data through intuitive gauges and charts (Socket.io).
-   **🤖 Auto Mode**: Smart automation logic that controls lights and fans based on environmental sensor thresholds.
-   **🔐 User Management**: Role-based access control (Admin/User) with secure password hashing using Bcrypt.
-   **📜 Activity Logs**: Detailed historical logs of all device interactions and system events.

## 🛠️ Technology Stack

-   **Frontend**: React.js, Tailwind CSS, Lucide React, Recharts, Socket.io Client.
-   **Backend**: Node.js, Express, MySQL, MQTT (HiveMQ Cloud), Socket.io.
-   **Voice Service**: Python Flask, Google Speech API, gTTS, FFmpeg.

## ⚙️ Installation Guide

### Prerequisites
-   Node.js v16+ & Python 3.9+
-   MySQL Server & FFmpeg

### Setup Steps

1.  **Database Configuration**: Create a database named `btliot` and import the required tables.
2.  **Start the Backend (Server)**:
    ```bash
    cd server
    npm install
    # Configure your .env file with DB and MQTT credentials
    npm start # Runs on port 8688
    ```
3.  **Start the Voice Service**:
    ```bash
    cd audio-service
    pip install -r requirements.txt
    python main.py # Runs on port 5000
    ```
4.  **Start the Frontend (Client) with HTTPS**:
    ```bash
    cd client
    npm install
    # Run this command to enable HTTPS (Required for microphone access on mobile)
    $env:HTTPS="true"; npm start
    ```

## 🌐 Mobile Access (HTTPS Mode)

To use the microphone when accessing from other devices in your LAN, the system is configured to run in a **Secure Context (HTTPS)**.

### Access Steps:
1.  Identify your Host IP (e.g., `192.168.1.10`).
2.  On your phone, visit: `https://192.168.1.10:3000`
3.  **Bypass Security Warning**: Click **"Advanced"** -> **"Proceed anyway"**.
4.  **Allow Mixed Content (Crucial)**: 
    -   Since the HTTPS client calls the HTTP backend.
    -   On Mobile Chrome: Click the **Site Settings** icon (near the address bar) -> **Insecure content** -> Select **Allow**.
5.  You can now use the Microphone icon for voice commands.

## 🎙️ Sample Voice Commands (Vietnamese)
-   "Bật đèn phòng khách" (Turn on living room light)
-   "Tắt quạt" (Turn off fan)
-   "Nhiệt độ hiện tại là bao nhiêu?" (What is the current temperature?)
-   "Hỏi thông số thời tiết" (Query weather parameters)

---
*Developed by PTIT students (Vi Minh Hiếu & Nguyễn Văn Hoàng).*
