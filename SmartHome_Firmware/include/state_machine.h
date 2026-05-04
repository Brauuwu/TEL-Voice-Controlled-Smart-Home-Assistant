#pragma once

enum SystemState {
  STATE_BOOT,
  STATE_NORMAL,
  STATE_AP
};

void changeState(SystemState s);
SystemState getState();