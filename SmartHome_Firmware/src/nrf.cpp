#include "nrf.h"
#include <RF24.h>

RF24 radio(NRF_CE, NRF_CSN);

// Pipe 0 for reading from Node 1
const byte addrRead[6] = "NODE1";
// Pipe 1 for writing to Node 2
const byte addrWrite[6] = "NODE2";

void nrfInit() {
  radio.begin();
  radio.openReadingPipe(0, addrRead);
  radio.openWritingPipe(addrWrite);
  radio.startListening();
}

bool nrfAvailable() {
  return radio.available();
}

void nrfRead(PayloadNode1 &data) {
  radio.read(&data, sizeof(data));
}

void nrfWriteNode2(PayloadNode2 &data) {
  radio.stopListening();
  radio.write(&data, sizeof(data));
  radio.startListening();
}
