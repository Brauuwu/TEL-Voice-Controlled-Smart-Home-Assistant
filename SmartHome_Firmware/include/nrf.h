#pragma once
#include "config.h"

void nrfInit();
bool nrfAvailable();
void nrfRead(PayloadNode1 &data);
void nrfWriteNode2(PayloadNode2 &data);
