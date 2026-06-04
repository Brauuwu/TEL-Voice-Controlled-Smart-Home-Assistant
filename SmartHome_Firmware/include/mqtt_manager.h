#pragma once
#include "config.h"
#include <PubSubClient.h>

typedef void (*MqttCallback)(String topic, String payload);

void mqttInit(void (*cmdCallback)(String, String));
void mqttTask();
bool isMqttConnected();
void mqttPublishTelemetry(PayloadNode1 n1, float light, ControlMode mode, bool fanOn, uint8_t ledLevel, bool heaterOn, bool pumpOn, bool mistOn, bool sensorNode = true, bool actuatorNode = true);
