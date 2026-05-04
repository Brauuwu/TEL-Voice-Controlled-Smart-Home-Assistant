#include "buzzer.h"
#include "config.h"

int melody[] = {0,262,330,392,523,0};
int idx = 0;
unsigned long t = 0;
bool done = false;

void buzzerInit() {
  pinMode(BUZZER_PIN, OUTPUT);
}

bool buzzerStartup() {

  if (done) return true;

  if (millis() - t > 150) {
    t = millis();

    if (idx < 6) {
      if (melody[idx] == 0) {
        noTone(BUZZER_PIN);
      } else {
        tone(BUZZER_PIN, melody[idx]);
      }
      idx++;
    } else {
      noTone(BUZZER_PIN);
      done = true;
    }
  }
  return done;
}

bool manualBuzzerActive = false;
bool autoBuzzerActive = false;
unsigned long lastBlink = 0;
bool blinkState = false;

void buzzerSetManual(bool on) {
  manualBuzzerActive = on;
  if (!on && !autoBuzzerActive) {
    analogWrite(BUZZER_PIN, 0);
    blinkState = false;
  }
}

void buzzerTask() {
  if (!manualBuzzerActive && !autoBuzzerActive) return;

  if (millis() - lastBlink > 300) {
    lastBlink = millis();
    blinkState = !blinkState;
    if (blinkState) {
      analogWrite(BUZZER_PIN, 200);
    } else {
      analogWrite(BUZZER_PIN, 0);
    }
  }
}

void buzzerAlert(float temp, bool motion) {
  autoBuzzerActive = (temp > 45.0);
  
  if (!manualBuzzerActive && !autoBuzzerActive) {
     analogWrite(BUZZER_PIN, 0);
  }
}
