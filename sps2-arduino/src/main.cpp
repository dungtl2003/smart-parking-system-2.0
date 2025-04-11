#include <SPS_Gate.h>
#include <SPS_Display.h>
#include <SPS_Infrared_Sensor.h>
#include <SPS_RFID_Scanner.h>
#include <Arduino_FreeRTOS.h>
#include <task.h>
#include <semphr.h>
#include <queue.h>

#define OPEN 1
#define CLOSE 0

#define ENTRY_INVALID_CARD 0
#define ENTRY_VALID_CARD 1
#define EXIT_INVALID_CARD 3
#define EXIT_VALID_CARD 4
#define CHECKING_CARD 2
#define UNDETECTED -1

#define IR_CAR_1 22
#define IR_CAR_2 23
#define IR_CAR_3 24
#define IR_CAR_4 25
#define IR_CAR_5 26
#define IR_CAR_6 27
#define IR_ENTRY_FRONT 28
#define IR_ENTRY_BACK 29
#define IR_EXIT_FRONT 30
#define IR_EXIT_BACK 31

#define SERVO_ENTER_PIN 9
#define SERVO_EXIT_PIN 8
#define SERVO_DELAY_MS 0

#define RFID_ENTER_SS_PIN 53
#define RFID_ENTER_RST_PIN 5

#define ENTRY_BTN_PIN 11 //Button 2
#define EXIT_BTN_PIN 10 //Button 1

#define LCD_ADDR 0x27
#define LCD_FPS 60

#define LED_PIN 7
#define LIGHT_SENSOR_PIN 6

#define TOTAL_SLOTS 6
#define TOTAL_SLOTS_BITS_TO_INT 63

#define configTICK_RATE_HZ 1000
#define MS_PER_TICK (1000 / configTICK_RATE_HZ)

unsigned char** validUIDs = new unsigned char*[6];

SPS_InfraredSensor infraredSensor(IR_CAR_1, IR_CAR_2, IR_CAR_3, IR_CAR_4, IR_CAR_5, IR_CAR_6, IR_ENTRY_FRONT, IR_ENTRY_BACK, IR_EXIT_FRONT, IR_EXIT_BACK);
SPS_Display display(LCD_ADDR, LCD_FPS);
SPS_Gate entryGate(SERVO_ENTER_PIN, SERVO_DELAY_MS);
SPS_Gate exitGate(SERVO_EXIT_PIN, SERVO_DELAY_MS);
SPS_RFID_Scanner entryScanner(RFID_ENTER_SS_PIN, RFID_ENTER_RST_PIN);

QueueHandle_t slotStateQueue;

QueueHandle_t slotSignalQueue;

QueueHandle_t usernameQueue;

QueueHandle_t scannedCardStateQueue;

QueueHandle_t gateStateQueue;

QueueHandle_t entryGateValidCardDetectedQueue;

QueueHandle_t exitGateValidCardDetectedQueue;

QueueHandle_t lightStateQueue;

QueueHandle_t cardInfoQueue;

QueueHandle_t cardSignalQueue;

QueueHandle_t gatePosQueue;

TaskHandle_t renderTaskHandle = NULL;

int getBitAt (int slots, int index){
  //Index start from right to left
  return (slots >> index) & 1;
}

void appendBit (int &slots, int value){
  slots = (slots << 1) + value;
}

void printGateAndCardToSerial (int index, int gate) {
  String result = "";
  String gatePos = gate == 1 ? "R" : "L";
  
  for (int i = 0; i < 4; i++) {
    result += "0x";
    if (validUIDs[index][i] < 0x10) { 
      result += "0";
    }
    result += String(validUIDs[index][i], HEX); 
    result.toUpperCase();

    if (i < 3) {
      result += "-";
    }
  }

  Serial.println("CARD:"+ gatePos + ":" + result);
}

void printParkingStatesToSerial (int slotStates) {
  String message = "STATE:";
  for (int i = TOTAL_SLOTS - 1; i >= 0; i--) {
    message += String(getBitAt(slotStates, i));
    if (i > 0) {
      message += ","; 
    }
  }
  Serial.println(message);
}

void updateEntryGateStatus(int &entrySwitchLastState, bool &entryMode, bool &currentEntryGateStatus, 
                            bool isEntryFrontSensorDetected, bool isEntryBackSensorDetected, 
                            int newEntrySwitchState, bool hasSlot) {
  if(newEntrySwitchState != entrySwitchLastState){ // manual mode
    //update related variables
    entrySwitchLastState = newEntrySwitchState;
    entryMode = !entryMode;

    //handle mode change event
    if(entryMode) {
      currentEntryGateStatus = (currentEntryGateStatus == OPEN) ? CLOSE : OPEN;
    }
    return;
  }

  if(entryMode) return;

  // run down here only in auto mode
  if (currentEntryGateStatus == OPEN) {
    if (!isEntryFrontSensorDetected && !isEntryBackSensorDetected) {
        currentEntryGateStatus = CLOSE;
        entryScanner.clearCache();
    }
  } else {
    int scannedCardState = UNDETECTED;
    xQueueReceive(entryGateValidCardDetectedQueue, &scannedCardState, 0);

    if (hasSlot && (scannedCardState == ENTRY_VALID_CARD) && isEntryFrontSensorDetected) {
      currentEntryGateStatus = OPEN;
    } else { 
      currentEntryGateStatus = CLOSE;
      entryScanner.clearCache();
    }
  }
}

void updateExitGateStatus(int &exitSwitchLastState, bool &exitMode, bool &currentExitGateStatus,
                          bool isExitFrontSensorDetected, bool isExitBackSensorDetected,
                          int newExitSwitchState) { 
  if(newExitSwitchState != exitSwitchLastState){ // manual mode
    //update related variables
    exitSwitchLastState = newExitSwitchState;
    exitMode = !exitMode;

    //handle mode change event
    if(exitMode) {
      currentExitGateStatus = (currentExitGateStatus == OPEN) ? CLOSE : OPEN;
    }
    return;
  }

  if(exitMode) return;

  // run down here only in auto mode
  if (currentExitGateStatus == OPEN) {
    if (!isExitFrontSensorDetected && !isExitBackSensorDetected) {
      currentExitGateStatus = CLOSE;
      entryScanner.clearCache();
    }
  } else {
    int scannedCardState = UNDETECTED;
    if ((scannedCardState == EXIT_VALID_CARD) && isExitFrontSensorDetected) {
      currentExitGateStatus = OPEN;
    } else {
      currentExitGateStatus = CLOSE;
      entryScanner.clearCache();
    }
  }
}

void consumeESPCommand (void *pvParameters) { 
  while(1) {
    // Serial.println(1);
    if(Serial.available() <= 0) {
      continue;
    }

    String input = Serial.readStringUntil('\n');
    int separatorIndex = input.indexOf(':');

    if (separatorIndex == -1) {
      continue;
    }

    //down here only when receive valid ESP command
    String label = input.substring(0, separatorIndex);
    String value = input.substring(separatorIndex + 1);
    value.trim();

    if(label.equals("USER")) {
      char msg[15];
      value.toCharArray(msg, sizeof(msg));
      int result = xQueueOverwrite(usernameQueue, msg);
      if(result == errQUEUE_FULL){
        Serial.println("[consumeESPCommand] Fail to overwrite usernameQueue");
      }
    } 

    if(label.equals("CHECKING-RESULT")){
      int valueToInt = value.toInt();
      if(valueToInt == ENTRY_VALID_CARD 
        || valueToInt == ENTRY_INVALID_CARD
        || valueToInt == EXIT_VALID_CARD
        || valueToInt == EXIT_INVALID_CARD)
      {
        // send to render
        int result = xQueueOverwrite(scannedCardStateQueue, &valueToInt);
        if(result == errQUEUE_FULL){
          Serial.println("[consumeESPCommand] Fail to overwrite scannedCardStateQueue");
        }
      }

      // send to control gate
      if(value.toInt() == ENTRY_VALID_CARD){
        int result = xQueueOverwrite(entryGateValidCardDetectedQueue, &valueToInt);
        if(result == errQUEUE_FULL){
          Serial.println("[consumeESPCommand] Fail to overwrite entryGateValidCardDetectedQueue");
        }
      }

      if(value.toInt() == EXIT_VALID_CARD){
        int result = xQueueOverwrite(exitGateValidCardDetectedQueue, &valueToInt);
        if(result == errQUEUE_FULL){
          Serial.println("[consumeESPCommand] Fail to overwrite exitGateValidCardDetectedQueue");
        }
      }
    }  
  }
}

void readSignal(void *pvParameters) {
  int slotStates = 0;
  int gateState = 0;
  int lightState = 0;

  while(1) {
    // read parkinglot sensors
    slotStates = 0;
    for (int i = 0; i < TOTAL_SLOTS; i++) {
      int value = infraredSensor.isParkingSensorDetected(i) ? 1 : 0;
      appendBit(slotStates, value);
    }
    int result = xQueueOverwrite(slotStateQueue, &slotStates);
    if(result == errQUEUE_FULL){
      Serial.println("[readSignal] Fail to overwrite slotStateQueue");
    }

    // unsigned long time_ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
    // Serial.println("sensor: " + (String)time_ms);

    // read sensor around gates
    gateState = 0;
    appendBit(gateState, infraredSensor.isEntryFrontSensorDetected());
    appendBit(gateState, infraredSensor.isEntryBackSensorDetected());
    appendBit(gateState, digitalRead(ENTRY_BTN_PIN));
    appendBit(gateState, infraredSensor.isExitFrontSensorDetected());
    appendBit(gateState, infraredSensor.isExitBackSensorDetected());
    appendBit(gateState, digitalRead(EXIT_BTN_PIN));
    result = xQueueOverwrite(gateStateQueue, &gateState);
    if(result == errQUEUE_FULL){
      Serial.println("[readSignal] Fail to overwrite gateStateQueue");
    }

    //read light sensor
    lightState = digitalRead(LIGHT_SENSOR_PIN);
    result = xQueueOverwrite(lightStateQueue, &lightState);
    if(result == errQUEUE_FULL){
      Serial.println("[readSignal] Fail to overwrite lightStateQueue");
    }
  }
}

void readRFID(void *pvParameters) {
  while(1) {
    // read RFID card
    bool isDetected = entryScanner.validateCard();
    if(!entryScanner.hasSend && isDetected) {
      int result = xQueueOverwrite(cardInfoQueue, &(entryScanner.scannedCardIndex));
      if(result == errQUEUE_FULL){
        Serial.println("[readRFID] Fail to overwrite cardInforQueue");
      }

      entryScanner.hasSend = true;
    }
  }
}

void render(void *pvParameters) {
  int slotStates = 0;
  int cardState = UNDETECTED;
  char username[15] = "";
  char displayText[30];

  while(1){
    int popResult = xQueueReceive(scannedCardStateQueue, &cardState, 0);
    if (popResult == pdTRUE) {
      display.clearScreen();
      if (cardState == ENTRY_VALID_CARD 
        || cardState == ENTRY_INVALID_CARD
        || cardState == EXIT_VALID_CARD
        || cardState == EXIT_INVALID_CARD) {
        //start counting if result arrived
        memset(username, 0, sizeof(username));
        memset(displayText, 0, sizeof(displayText));
        username[0] = '\0';
        displayText[0] = '\0';
      }
      if (cardState == ENTRY_VALID_CARD )
      {
        strcat(displayText, "Hi ");
      }
      if (cardState == EXIT_VALID_CARD) 
      {
        strcat(displayText, "Bye ");
      }
    }
    vTaskPrioritySet(renderTaskHandle, 2);

    // rendering`s main logic
    if((cardState == ENTRY_VALID_CARD) || (cardState == EXIT_VALID_CARD)){
      if(xQueueReceive(usernameQueue, username, 0)){
        strcat(displayText, username);
        strcat(displayText, " !");
      }
      display.printString(displayText);
      vTaskDelay(2000 / portTICK_PERIOD_MS);

      display.clearScreen();
      cardState = UNDETECTED;
    } else if((cardState == ENTRY_INVALID_CARD) || (cardState == EXIT_INVALID_CARD)) {
      display.printString("Invalid card");
      vTaskDelay(2000 / portTICK_PERIOD_MS);

      display.clearScreen();
      cardState = UNDETECTED;
    } else if (cardState == CHECKING_CARD) {
      display.printString("Scanning...");

    } else {
      // unsigned long time_ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
      // Serial.println("before peek: " + (String)time_ms);

      xQueuePeek(slotStateQueue, &slotStates, 0);
      // display.render(0, 0, 0, 0, 0, 0); 
      display.render(getBitAt(slotStates, 5), getBitAt(slotStates, 4), getBitAt(slotStates, 3), 
                     getBitAt(slotStates, 2), getBitAt(slotStates, 1), getBitAt(slotStates, 0));

      // time_ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
      // Serial.println("after render: " + (String)time_ms);
    }
    vTaskPrioritySet(renderTaskHandle, 1);
  }
}

void controlLight(void *pvParameters) {
  int lightState = 0;

  while(1) {
    xQueuePeek(lightStateQueue, &lightState, 0);

    if (lightState == HIGH) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
  }
}

void controlGate(void *pvParameters) {
  int entrySwitchLastState = 0;
  int exitSwitchLastState = 0;
  bool entryMode = false;
  bool exitMode = false;
  bool currentEntryGateStatus = 0;
  bool currentExitGateStatus = 0;
  int gateState = 0;
  int slotState = 0;

  while(1) {
    xQueuePeek(gateStateQueue, &gateState, 0);
    xQueuePeek(slotStateQueue, &slotState, 0);

    // update gate status
    updateEntryGateStatus(entrySwitchLastState, entryMode, currentEntryGateStatus, 
              getBitAt(gateState, 5), getBitAt(gateState, 4), 
              getBitAt(gateState, 3), slotState != TOTAL_SLOTS_BITS_TO_INT);
 
    if (currentEntryGateStatus == OPEN) {
      entryGate.open();
    } else {
      entryGate.close();
    }

    updateExitGateStatus(exitSwitchLastState, exitMode, currentExitGateStatus, 
              getBitAt(gateState, 2), getBitAt(gateState, 1), 
              getBitAt(gateState, 0));

    if (currentExitGateStatus == OPEN) {
      exitGate.open();
    } else {
      exitGate.close();
    }
  }
}

void detectParkingStatesChanges (void *pvParameters) {
  int slotStates = 0;
  int newSlotStates = 0;

  while (1){
    if(xQueuePeek(slotStateQueue, &newSlotStates, 0)){
      if(slotStates - newSlotStates != 0){ 
        Serial.println("state change: " + (String)newSlotStates + " " + (String)slotStates);
        slotStates = newSlotStates;
        int result = xQueueOverwrite(slotSignalQueue, &slotStates);
        if(result == errQUEUE_FULL){
          Serial.println("[detectParkingStatesChanges] Fail to overwrite slotSignalQueue");
        }
      }
    }
  }
}

void produceESPCommand (void *pvParameters) {
  int slotStates;
  int cardIndex = -1;
  int gatePos = -1;

  while (1){
    xQueueReceive(cardSignalQueue, &cardIndex, 0);
    xQueueReceive(gatePosQueue, &gatePos, 0);

    if(cardIndex != -1 && gatePos != -1){
      printGateAndCardToSerial(cardIndex, gatePos);
      gatePos = -1;
      cardIndex = -1;
    }

    if(xQueueReceive(slotSignalQueue, &slotStates, 0)){
      printParkingStatesToSerial(slotStates);
    }
  }
}

void sensorRFIDFusion (void *pvParameters) {
  int cardIndex;
  int gatePos; //1 is Entry which is "R", 0 is Exit which is "L"
  int gateState = 0;

  while (1){
    xQueuePeek(gateStateQueue,&gateState, 0);

    if(xQueueReceive(cardInfoQueue,&cardIndex, 0) 
      && (getBitAt(gateState, 5) || getBitAt(gateState, 2) ))
    {
      // productRFIDFusion: go in here if card is detected and entry gate`s front Sensor or exit gate`s front Sensor is 1 
      int result = xQueueOverwrite(cardSignalQueue, &cardIndex);
      if(result == errQUEUE_FULL){
        Serial.println("[sensorRFIDFusion] Fail to overwrite cardInfoQueue");
      }
      int gatePos = getBitAt(gateState, 5) ? 1 : 0;
      result = xQueueOverwrite(gatePosQueue, &gatePos);
      if(result == errQUEUE_FULL){
        Serial.println("[sensorRFIDFusion] Fail to overwrite gatePosQueue");
      }
      
      // render: only sent if queue is empty
      if (uxQueueMessagesWaiting(scannedCardStateQueue) == 0){
        int cardState = CHECKING_CARD;
        int result = xQueueOverwrite(scannedCardStateQueue, &cardState);
        if(result == errQUEUE_FULL){
          Serial.println("[sensorRFIDFusion] Fail to overwrite scannedCardStateQueue");
        }
      }
    }

  }
}

void setup() {
  Serial.begin(9600);

  pinMode(ENTRY_BTN_PIN, INPUT_PULLUP);
  pinMode(EXIT_BTN_PIN, INPUT_PULLUP);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // Allocate memory for each row and populate the array
  validUIDs[0] = new unsigned char[4]{ 0x6D, 0xE2, 0xD7, 0x21 };  // Thẻ 1
  validUIDs[1] = new unsigned char[4]{ 0x23, 0x0A, 0x54, 0x11 };  // Thẻ 2
  validUIDs[2] = new unsigned char[4]{ 0xE3, 0x9A, 0x66, 0x10 };  // Thẻ 3
  validUIDs[3] = new unsigned char[4]{ 0x43, 0x34, 0x54, 0x10 };  // Thẻ 4
  validUIDs[4] = new unsigned char[4]{ 0x40, 0x1E, 0x4A, 0x12 };  // Thẻ 5
  validUIDs[5] = new unsigned char[4]{ 0x6A, 0xD5, 0x17, 0xA4 };  // Thẻ 6

  infraredSensor.init();
  display.init();
  entryGate.init();
  entryScanner.init(validUIDs, 6);
  exitGate.init(); 
  slotStateQueue = xQueueCreate(1, sizeof(int));
  slotSignalQueue = xQueueCreate(1, sizeof(int));
  usernameQueue = xQueueCreate(1, sizeof(char[15]));
  scannedCardStateQueue = xQueueCreate(1, sizeof(int));
  gateStateQueue = xQueueCreate(1, sizeof(int));
  entryGateValidCardDetectedQueue = xQueueCreate(1, sizeof(int));
  exitGateValidCardDetectedQueue = xQueueCreate(1, sizeof(int));
  lightStateQueue = xQueueCreate(1, sizeof(int));
  cardInfoQueue = xQueueCreate(1, sizeof(int));
  cardSignalQueue = xQueueCreate(1, sizeof(int));
  gatePosQueue = xQueueCreate(1, sizeof(int));

  xTaskCreate(consumeESPCommand, "Task1", 300, NULL, 1, NULL);
  xTaskCreate(readSignal, "Task2", 300, NULL, 1, NULL);
  xTaskCreate(readRFID, "Task3", 300, NULL, 1, NULL);
  xTaskCreate(render, "Task4", 300, NULL, 1, &renderTaskHandle);
  xTaskCreate(controlLight, "Task5", 300, NULL, 1, NULL);
  xTaskCreate(controlGate, "Task6", 300, NULL, 1, NULL);
  xTaskCreate(detectParkingStatesChanges, "Task7", 300, NULL, 1, NULL);
  xTaskCreate(produceESPCommand, "Task8", 300, NULL, 1, NULL);
  xTaskCreate(sensorRFIDFusion, "Task9", 300, NULL, 1, NULL);

  vTaskStartScheduler();
}

void loop() {
}
