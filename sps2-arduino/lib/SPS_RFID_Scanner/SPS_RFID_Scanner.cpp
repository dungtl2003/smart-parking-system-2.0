#include "SPS_RFID_Scanner.h"

SPS_RFID_Scanner::SPS_RFID_Scanner(int ssPin, int rstPin)
    : rfid(ssPin, rstPin), isLastCardValid(false) {}

void SPS_RFID_Scanner::init(byte **validUIDs, int totalValidUIDs) {
  SPI.begin();
  rfid.PCD_Init();
  delay(4);
  this->validUIDs = validUIDs;
  this->totalValidUIDs = totalValidUIDs;
}
bool SPS_RFID_Scanner::validateCard() {
  if (!rfid.PICC_IsNewCardPresent()) {
    return isLastCardValid;
  }

  if (!rfid.PICC_ReadCardSerial()) {
    isLastCardValid = false;
    return false;
  }

  for (int i = 0; i < totalValidUIDs; i++) {
    bool match = true;
    for (byte j = 0; j < 4; j++) {
      if (rfid.uid.uidByte[j] != validUIDs[i][j]) {
        match = false;
        break;
      }
    }

    if (match) {
      isLastCardValid = true;
      scannedCardIndex = i;
      rfid.PICC_HaltA();
      hasSend = false;
      return true;
    }
  }

  isLastCardValid = false;
  return false;
}

void SPS_RFID_Scanner::clearCache() { isLastCardValid = false; };