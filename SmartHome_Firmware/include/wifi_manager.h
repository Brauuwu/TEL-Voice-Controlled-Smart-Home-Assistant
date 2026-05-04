#pragma once

#include <Arduino.h>

void wifiInit();
void wifiTask();
void startAP();
bool isAPMode();
bool isWifiConnected();
int getWifiRSSI();
void saveWifiCredentials(String ssid, String pass);
