#include "wifi_manager.h"
#include "config.h"
#include <WiFi.h>
#include <Preferences.h>

bool apMode = false;
unsigned long lastWifiCheck = 0;
Preferences preferences;

void wifiInit() {
  preferences.begin("wifi", false);
  String ssid = preferences.getString("ssid", WIFI_SSID);
  String pass = preferences.getString("pass", WIFI_PASS);
  preferences.end();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
}

void wifiTask() {
  if (apMode) return;
  
  if (millis() - lastWifiCheck > 5000) {
    lastWifiCheck = millis();
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.disconnect();
      WiFi.reconnect();
    }
  }
}

void startAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("SmartHome_Config", "12345678");
  apMode = true;
}

bool isAPMode() {
  return apMode;
}

bool isWifiConnected() {
  return !apMode && (WiFi.status() == WL_CONNECTED);
}

int getWifiRSSI() {
  return WiFi.RSSI();
}

void saveWifiCredentials(String ssid, String pass) {
  preferences.begin("wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("pass", pass);
  preferences.end();
}
