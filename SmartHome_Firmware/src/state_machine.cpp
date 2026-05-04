#include "state_machine.h"

static SystemState currentState;

void changeState(SystemState s) {
  currentState = s;
}

SystemState getState() {
  return currentState;
}
