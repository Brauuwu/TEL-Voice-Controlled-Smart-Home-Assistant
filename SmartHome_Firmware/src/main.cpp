#include <Arduino.h>
#include <WiFi.h>
#include "config.h"
#include "wifi_manager.h"
#include "mqtt_manager.h"
#include "display.h"
#include "nrf.h"
#include "sensors.h"
#include "buzzer.h"
#include "app_webserver.h"
#include "state_machine.h"
#include <ArduinoJson.h>

PayloadNode1 n1 = {0.0, 0.0, false};
ControlMode sysMode = MODE_AUTO;
bool fanStatus = false;
uint8_t ledLevel = 0;   // 0=off, 1=dim, 2=medium, 3=max
bool heaterStatus = false;
bool pumpStatus = false;
bool mistStatus = false;
bool bootFinished = false;

unsigned long lastNrfNode1 = 0;   // Last time we received data from Sensor Node
bool sensorNodeConnected = false; // Whether Sensor Node is connected
bool actuatorNodeConnected = false; // Whether Actuator Node is connected
#define NRF_TIMEOUT 5000          // 5 seconds timeout

void onCommand(String topic, String message) {
  JsonDocument doc;
  deserializeJson(doc, message);
  
  String device = doc["device"] | "";
  String action = doc["action"] | "";
  
  if (device == "mode") {
    sysMode = (action == "auto") ? MODE_AUTO : MODE_MANUAL;
  } else if (device == "fan") {
    fanStatus = (action == "ON");
    digitalWrite(RELAY_PIN, fanStatus);
  } else if (device == "led") {
    // LED: 4 levels (0=off, 1=dim, 2=medium, 3=max)
    ledLevel = doc["action"].is<int>() ? doc["action"].as<int>() : (action == "ON" ? 3 : 0);
    if (ledLevel > 3) ledLevel = 3;
  } else if (device == "buzzer") {
    buzzerSetManual(action == "ON");
  } else if (device == "curtain") {
    // Curtain: 3 levels (0=closed, 50=half, 100=open)
    int val = doc["action"].is<int>() ? doc["action"].as<int>() : (action == "ON" ? 100 : 0);
    analogWrite(RGB_R, map(val, 0, 100, 0, 255));
  } else if (device == "ac") {
    // AC: 10 levels (20-29°C) or 0=off
    int val = doc["action"].is<int>() ? doc["action"].as<int>() : (action == "ON" ? 25 : 0);
    if (val >= 20 && val <= 29) {
      analogWrite(RGB_G, map(val, 20, 29, 28, 255));
    } else {
      analogWrite(RGB_G, 0);
    }
  } else if (device == "tv") {
    int val = doc["action"].is<int>() ? doc["action"].as<int>() : (action == "ON" ? 100 : 0);
    analogWrite(RGB_B, map(val, 0, 100, 0, 255));
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(BTN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  
  pinMode(RGB_R, OUTPUT);
  pinMode(RGB_G, OUTPUT);
  pinMode(RGB_B, OUTPUT);
  digitalWrite(RGB_R, LOW);
  digitalWrite(RGB_G, LOW);
  digitalWrite(RGB_B, LOW);

  displayInit();
  drawBoot();
  sensorsInit();
  nrfInit();
  wifiInit();
  mqttInit(onCommand);
  buzzerInit();
  
  changeState(STATE_BOOT);
}

unsigned long lastScreenUpdate = 0;
unsigned long lastNrfNode2 = 0;

void loop() {
  // Check for AP Mode trigger
  if (digitalRead(BTN) == LOW && getState() != STATE_AP) {
    startAP();
    webInit();
    changeState(STATE_AP);
  }

  if (!bootFinished) {
    bootFinished = buzzerStartup();
    return;
  }

  if (getState() == STATE_AP) {
    webHandle();
    if (millis() - lastScreenUpdate > 1000) {
      lastScreenUpdate = millis();
      drawAP(WiFi.softAPIP());
    }
    return;
  }

  wifiTask();
  mqttTask();
  webHandle();
  buzzerTask();

  // Read NRF Sensors Node
  if (nrfAvailable()) {
    nrfRead(n1);
    lastNrfNode1 = millis();
    sensorNodeConnected = true;
  }

  // Check Sensor Node timeout
  if (millis() - lastNrfNode1 > NRF_TIMEOUT) {
    sensorNodeConnected = false;
  }

  float ldr = readLight();

  // Write to Node 2 (Actuators) over NRF24
  if (millis() - lastNrfNode2 > 1000) {
    lastNrfNode2 = millis();
    PayloadNode2 n2;
    n2.temp = n1.temp;
    n2.hum = n1.hum;
    n2.light = ldr;
    n2.motion = n1.motion;
    n2.ledLevel = ledLevel;
    actuatorNodeConnected = nrfWriteNode2(n2);
  }

  if (millis() - lastScreenUpdate > 1000) {
    lastScreenUpdate = millis();
    mqttPublishTelemetry(n1, ldr, sysMode, fanStatus, ledLevel, heaterStatus, pumpStatus, mistStatus, sensorNodeConnected, actuatorNodeConnected);
    drawDashboard(n1, ldr, isWifiConnected(), getWifiRSSI(), isMqttConnected(), sysMode, fanStatus, ledLevel > 0, heaterStatus, pumpStatus, mistStatus, sensorNodeConnected);
    buzzerAlert(n1.temp, n1.motion);
  }
}