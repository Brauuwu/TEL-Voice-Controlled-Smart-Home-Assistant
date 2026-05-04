#pragma once

void buzzerInit();
bool buzzerStartup();
void buzzerAlert(float temp, bool motion);
void buzzerSetManual(bool on);
void buzzerTask();
