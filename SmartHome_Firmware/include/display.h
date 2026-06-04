#pragma once
#include "config.h"

void displayInit();
void drawBoot();
void drawDashboard(PayloadNode1 n1, float light, bool wifiOk, int rssi, bool mqttOk, ControlMode mode, bool fanOn, bool ledOn, bool heatOn, bool pumpOn, bool mistOn, bool sensorNodeOk = true);
void drawAP(IPAddress ip);
