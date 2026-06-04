#pragma once
#include "config.h"

void nrfInit();
bool nrfAvailable();
void nrfRead(PayloadNode1 &data);
bool nrfWriteNode2(PayloadNode2 &data);
