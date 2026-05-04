#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <DHT.h>

// PIN Configuration
#define DHTPIN D2
#define PIRPIN D4
#define CE_PIN D8
#define CSN_PIN D0

#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
RF24 radio(CE_PIN, CSN_PIN);

// NRF Address
const byte address[6] = "NODE1";

struct PayloadNode1 {
  float temp;
  float hum;
  bool motion;
};

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PIRPIN, INPUT);

  if (!radio.begin()) {
    Serial.println(F("nRF24L01 failed!"));
    while (1);
  }
  
  radio.setDataRate(RF24_1MBPS);
  radio.setChannel(76);
  radio.setPALevel(RF24_PA_LOW);
  radio.openWritingPipe(address);
  radio.stopListening();
  
  Serial.println("Sensors Node Started...");
}

void loop() {
  PayloadNode1 data;
  data.temp = dht.readTemperature();
  data.hum = dht.readHumidity();
  data.motion = (digitalRead(PIRPIN) == HIGH);

  if (!isnan(data.temp) && !isnan(data.hum)) {
    Serial.print("Sending Data - Temp: "); Serial.print(data.temp);
    Serial.print(" Hum: "); Serial.println(data.hum);
    radio.write(&data, sizeof(data));
  }

  delay(2000);
}
