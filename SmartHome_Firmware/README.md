# 📟 SmartHome Firmware

Microcontroller source code for the Smart Home system, built using ESP32 and ESP8266 platforms.

## 📡 Network Architecture (NRF24L01)

The system uses a Star Topology with an ESP32 as the Central Gateway:
-   **Node 0 (Gateway - ESP32)**: Manages WiFi/MQTT connectivity and coordinates with satellite nodes.
-   **Node 1 (Sensors - ESP8266)**: Collects environmental data (Temp, Hum, Motion).
-   **Node 2 (Actuators - ESP8266)**: Controls terminal devices (LED) and displays system status on OLED.

## 🔌 Pin Configuration

### 1. Central Gateway (ESP32)
-   **TFT LCD**: CS: 5, DC: 2, RST: 4
-   **NRF24L01**: CE: 21, CSN: 22
-   **MCP3008 (ADC)**: CS: 13
-   **Buzzer**: 12
-   **Relay**: 25
-   **RGB LED**: Red: 26, Green: 27, Blue: 14
-   **Boot Button**: 0 (Hold during boot to enter AP Mode)

### 2. Sensors Node (ESP8266)
-   **DHT11**: D2
-   **PIR Sensor**: D4
-   **NRF24L01**: CE: D8, CSN: D0

### 3. Actuators Node (ESP8266)
-   **LED**: D4
-   **OLED (I2C)**: Standard ESP8266 SDA/SCL
-   **NRF24L01**: CE: D8, CSN: D0

## 🛠️ Flashing Guide

The project uses **PlatformIO** for the Central Gateway and **Arduino IDE/PlatformIO** for satellite nodes.

### NRF24 Common Configuration:
-   **Address NODE1**: `NODE1` (Sensors)
-   **Address NODE2**: `NODE2` (Actuators)
-   **Channel**: 76
-   **Data Rate**: 1Mbps

### Flashing Steps:
1.  Open the `SmartHome_Firmware` directory in VS Code with PlatformIO.
2.  Edit the `.env` or `config.h` file to provide your WiFi SSID and MQTT Broker details.
3.  Select the `esp32dev` environment and click **Upload**.
4.  Flash the respective `.ino` files in the `esp8266_nodes` folder to your ESP8266 chips.

## 🛰️ AP Mode
If the device fails to connect to WiFi, hold the **BOOT** button on the ESP32 during power-up. The screen will display Access Point info. Connect your phone to this WiFi to configure new credentials via the web interface.
