#pragma once

#include <Arduino.h>

// ===== WIFI & MQTT (Load from .env via extra_scripts) =====
#ifndef WIFI_SSID
  #define WIFI_SSID "DEFAULT_SSID"
#endif
#ifndef WIFI_PASS
  #define WIFI_PASS "DEFAULT_PASS"
#endif

#ifndef MQTT_SERVER
  #define MQTT_SERVER "192.168.1.10"
#endif
#ifndef MQTT_PORT
  #define MQTT_PORT 1883
#endif
#ifndef MQTT_USER
  #define MQTT_USER ""
#endif
#ifndef MQTT_PASS
  #define MQTT_PASS ""
#endif

#define MQTT_TOPIC "smarthome/sensors"

// ===== PIN =====
#define TFT_CS 5
#define TFT_DC 2
#define TFT_RST 4

#define MCP_CS 13

#define NRF_CE 21
#define NRF_CSN 22

#define BTN 0
#define BUZZER_PIN 12

#define RELAY_PIN 25
#define RGB_R 26
#define RGB_G 27
#define RGB_B 14

// ===== DATA =====
struct PayloadNode1 {
  float temp;
  float hum;
  bool motion;
};

struct PayloadNode2 {
  float temp;
  float hum;
  float light;
  bool motion;
  uint8_t ledLevel;  // 0=off, 1=dim, 2=medium, 3=max
};

enum ControlMode {
  MODE_AUTO,
  MODE_MANUAL
};