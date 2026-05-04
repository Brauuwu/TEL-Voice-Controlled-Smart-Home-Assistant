#include "sensors.h"
#include <Adafruit_MCP3008.h>
#include <SimpleKalmanFilter.h>
#include <math.h>

Adafruit_MCP3008 adc;

// SimpleKalmanFilter(e_mea, e_est, q)
SimpleKalmanFilter kalmanLight(2, 2, 0.01);

const float VREF = 3.3;
const float R_FIXED = 10000.0;

void sensorsInit() {
  adc.begin(13);
}

float calculateLux(int adcValue) {
  if (adcValue <= 0) return 0; // tránh chia cho 0
  
  float voltage = adcValue * (VREF / 1023.0);
  if (voltage <= 0.01) return 0;
  
  // Công thức tính điện trở LDR
  float rLdr = (VREF - voltage) * R_FIXED / voltage;
  
  // Công thức lux xấp xỉ cho LDR loại phổ biến
  float lux = pow((750.0 / (rLdr / 1000.0)), 1.8);
  
  if (lux < 0) lux = 0;
  return lux;
}

float readLight() {
  int rawADC = (adc.readADC(0) + adc.readADC(1)) / 2;
  float filtered = kalmanLight.updateEstimate(rawADC);
  return calculateLux((int)filtered);
}
