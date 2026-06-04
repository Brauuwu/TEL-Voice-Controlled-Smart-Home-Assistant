#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// PIN Configuration
#define LED_PIN D4
#define CE_PIN D8
#define CSN_PIN D0

Adafruit_SSD1306 display(128, 64, &Wire, -1);
RF24 radio(CE_PIN, CSN_PIN);

// NRF Address
const byte address[6] = "NODE2";

struct PayloadNode2 {
  float temp;
  float hum;
  float light;
  bool motion;
  uint8_t ledLevel;  // 0=off, 1=dim, 2=medium, 3=max
};

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 failed"));
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("Actuators Node");
  display.display();

  if (!radio.begin()) {
    Serial.println(F("nRF24L01 failed!"));
    while (1);
  }
  
  radio.setDataRate(RF24_1MBPS);
  radio.setChannel(76);
  radio.setPALevel(RF24_PA_LOW);
  radio.openReadingPipe(1, address);
  radio.startListening();
  
  Serial.println("Actuators Node Started...");
}

unsigned long lastReceived = 0;    // Last time we received data from Gateway
bool gatewayConnected = false;     // Whether Gateway is connected
#define GW_TIMEOUT 5000            // 5 seconds timeout

void drawLossConnection() {
  display.clearDisplay();
  
  // Border
  display.drawRect(0, 0, 128, 64, WHITE);
  
  // Warning icon (triangle with !)
  display.setCursor(52, 5);
  display.setTextSize(2);
  display.print("!");
  
  // Title
  display.setTextSize(1);
  display.setCursor(10, 25);
  display.print("LOSS CONNECTION");
  
  // Subtitle with animated dots
  display.setCursor(16, 40);
  display.print("Waiting for GW");
  int dots = (millis() / 500) % 4;
  for (int i = 0; i < dots; i++) display.print(".");
  
  display.display();
}

void loop() {
  if (radio.available()) {
    PayloadNode2 data;
    radio.read(&data, sizeof(data));
    lastReceived = millis();
    gatewayConnected = true;
    
    Serial.print("Received Data - LED Level: "); Serial.println(data.ledLevel);
    // PWM output: ESP8266 analogWrite range is 0-1023
    const int pwmValues[] = {0, 341, 682, 1023};
    uint8_t level = data.ledLevel > 3 ? 3 : data.ledLevel;
    analogWrite(LED_PIN, pwmValues[level]);
    
    // LED level labels
    const char* ledLabels[] = {"OFF", "LOW", "MED", "MAX"};
    
    display.clearDisplay();
    display.setCursor(0,0);
    display.setTextSize(1);
    display.println("--- STATUS ---");
    display.println("");
    
    display.print("LED: "); display.println(ledLabels[level]);
    display.print("Light: "); display.print(data.light); display.println(" Lux");
    display.print("Motion: "); display.println(data.motion ? "DETECTED" : "CLEAR");
    
    display.println("");
    display.print("Temp: "); display.print(data.temp); display.println(" C");
    
    display.display();
  }

  // Check Gateway timeout
  if (lastReceived > 0 && millis() - lastReceived > GW_TIMEOUT) {
    gatewayConnected = false;
  }
  
  // Show loss connection screen if Gateway is disconnected
  if (!gatewayConnected) {
    drawLossConnection();
    delay(200); // Small delay for animation
  }
}
