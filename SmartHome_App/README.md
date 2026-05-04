# 📱 SmartHome App

The software ecosystem of the Smart Home system, providing the user interface, coordination server, and voice assistant capabilities.

## 🛠️ Technology Stack

### 1. Frontend (React.js)
-   **Dashboard**: Displays real-time gauges, area charts, and device control panels.
-   **Voice Assistant Component**: Handles audio recording and communication with the Voice Service.
-   **Socket.io Client**: Provides real-time data updates without page reloads.
-   **Tailwind CSS**: Modern, responsive UI design.

### 2. Backend (Node.js & Express)
-   **MQTT Bridge**: Coordinates messages between the Web UI and hardware via an MQTT broker.
-   **Socket.io Server**: Broadcasts sensor data and device status updates to all connected clients.
-   **MySQL**: Stores sensor history, detailed activity logs, and user credentials.

### 3. Voice Service (Python Flask)
-   **Speech-to-Text**: Utilizes Google Speech Recognition API for Vietnamese command processing.
-   **Text-to-Speech**: Uses gTTS to provide voice feedback to the user.
-   **FFmpeg Integration**: Handles audio format conversion from browser-side recordings.

## ⚙️ Installation

### Requirements
-   Node.js v16+
-   Python 3.9+
-   MySQL Server
-   FFmpeg (included in the python environment)

### Setup Steps

1.  **Database Configuration**:
    -   Create a database named `btliot`.
    -   Run the SQL scripts to initialize `sensordata`, `activity_logs`, `users`, and `device_status` tables.

2.  **Start the Backend**:
    ```bash
    cd server
    npm install
    # Create a .env file with DB_HOST, DB_USER, MQTT_SERVER...
    npm start
    ```

3.  **Start the Voice Service**:
    ```bash
    cd audio-service
    pip install -r requirements.txt
    python main.py
    ```

4.  **Start the Frontend**:
    ```bash
    cd client
    npm install
    npm start
    ```

## 🎙️ Sample Voice Commands

-   "Turn on the living room light"
-   "Turn off the fan"
-   "What is the current temperature?"
-   "Open the curtains"
-   "Switch to automatic mode"
-   "Enable manual mode"
