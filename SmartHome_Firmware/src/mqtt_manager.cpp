#include "mqtt_manager.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "wifi_manager.h"

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

unsigned long lastMqttCheck = 0;
MqttCallback userCallback = nullptr;

void internalCallback(char* topic, byte* payload, unsigned int length) {
  String p = "";
  for (int i = 0; i < length; i++) p += (char)payload[i];
  if (userCallback) userCallback(String(topic), p);
}

void mqttInit(MqttCallback cb) {
  userCallback = cb;
  secureClient.setInsecure(); // No certificate checking for simplicity
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(internalCallback);
}

void mqttTask() {
  if (!isWifiConnected()) return;

  if (!mqttClient.connected()) {
    if (millis() - lastMqttCheck > 5000) {
      lastMqttCheck = millis();
      
      uint64_t chipId = ESP.getEfuseMac();
      String clientId = "ESP32_SmartHome_" + String((uint32_t)(chipId >> 32), HEX) + String((uint32_t)chipId, HEX);
      
      if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS, "smarthome/status", 1, true, "offline")) {
        // Successfully connected
        mqttClient.publish("smarthome/status", "online", true); // Publish online status
        
        // Subscribe to commands
        mqttClient.subscribe("smarthome/commands/#");
      }
    }
  } else {
    mqttClient.loop();
  }
}

bool isMqttConnected() {
  return mqttClient.connected();
}

void mqttPublishTelemetry(PayloadNode1 n1, float light, ControlMode mode, bool fan, bool led, bool heater, bool pump, bool mist, bool sensorNode, bool actuatorNode) {
  if (!isMqttConnected()) return;
  
  String mStr = (mode == MODE_AUTO) ? "auto" : "manual";
  
  String payload = "{\"temperature\":" + String(n1.temp) + 
                   ",\"humidity\":" + String(n1.hum) + 
                   ",\"motion\":" + String(n1.motion ? "true" : "false") + 
                   ",\"ldr\":" + String(light) + 
                   ",\"mode\":\"" + mStr + "\"" + 
                   ",\"fan\":" + String(fan ? "true" : "false") + 
                   ",\"led\":" + String(led ? "true" : "false") + 
                   ",\"heater\":" + String(heater ? "true" : "false") + 
                   ",\"pump\":" + String(pump ? "true" : "false") + 
                   ",\"mist\":" + String(mist ? "true" : "false") + 
                   ",\"sensorNode\":" + String(sensorNode ? "true" : "false") + 
                   ",\"actuatorNode\":" + String(actuatorNode ? "true" : "false") + "}";
                   
  mqttClient.publish("smarthome/sensors", payload.c_str());
}
