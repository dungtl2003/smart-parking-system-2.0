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

#define VALID_CARD 1
#define CHECKING_CARD 2
#define INVALID_CARD 0
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
#define LCD_FPS 45
#define LCD_LOOP_COUNTER 100

#define LED_PIN 7
#define LIGHT_SENSOR_PIN 6

#define TOTAL_SLOTS 6

SPS_InfraredSensor infraredSensor(IR_CAR_1, IR_CAR_2, IR_CAR_3, IR_CAR_4, IR_CAR_5, IR_CAR_6, IR_ENTRY_FRONT, IR_ENTRY_BACK, IR_EXIT_FRONT, IR_EXIT_BACK);
SPS_Display display(LCD_ADDR, LCD_FPS);
SPS_Gate entryGate(SERVO_ENTER_PIN, SERVO_DELAY_MS);
SPS_Gate exitGate(SERVO_EXIT_PIN, SERVO_DELAY_MS);
SPS_RFID_Scanner entryScanner(RFID_ENTER_SS_PIN, RFID_ENTER_RST_PIN);

int slotStates[TOTAL_SLOTS];
bool hasSlot = true;
SemaphoreHandle_t slotStateMutex;

int scannedCardState = UNDETECTED; 
SemaphoreHandle_t scannedCardStateMutex;

String username;
SemaphoreHandle_t usernameMutex;

bool currentEntryGateStatus;
SemaphoreHandle_t entryGateStateMutex;

bool currentExitGateStatus;
SemaphoreHandle_t exitGateStateMutex;

unsigned char** validUIDs = new unsigned char*[6];

TaskHandle_t parkingSlotStatesChangeHandler = NULL;
TaskHandle_t renderHanlder = NULL;
TaskHandle_t readSerialCommandFromESPHandler = NULL;

void printCardToSerial (int index) {
  String result = "";
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

  Serial.println("CARD:" + result);
}

void updateEntryGateStatus(int &entrySwitchLastState, bool &entryMode, bool &isEntryFrontSensorDetected, bool &isEntryBackSensorDetected) {
  int newState = digitalRead(ENTRY_BTN_PIN);
  if(newState != entrySwitchLastState){ // manual mode
    //update related variables
    entrySwitchLastState = newState;
    entryMode = !entryMode;

    //handle mode change event
    if(entryMode && xSemaphoreTake(entryGateStateMutex, portMAX_DELAY)) {
      currentEntryGateStatus = (currentEntryGateStatus == OPEN) ? CLOSE : OPEN;
      
      xSemaphoreGive(entryGateStateMutex);
    }
    return;
  }

  if(entryMode) return;

  // run down here only in auto mode
  if(xSemaphoreTake(entryGateStateMutex, 0)){
    if (currentEntryGateStatus == OPEN) {
      if (!isEntryFrontSensorDetected && !isEntryBackSensorDetected) {
          currentEntryGateStatus = CLOSE;
          entryScanner.clearCache();
      }
    } else {
      if(xSemaphoreTake(scannedCardStateMutex, portMAX_DELAY)){
        if (hasSlot && (scannedCardState == VALID_CARD) && isEntryFrontSensorDetected) {
          currentEntryGateStatus = OPEN;
        } else { 
          currentEntryGateStatus = CLOSE;
          entryScanner.clearCache();
        }

        xSemaphoreGive(scannedCardStateMutex);
      }
    }

    xSemaphoreGive(entryGateStateMutex);
  }
}

void updateExitGateStatus(int &exitSwitchLastState, bool &exitMode, bool &isExitFrontSensorDetected, bool &isExitBackSensorDetected) { 
  int newState = digitalRead(EXIT_BTN_PIN);
  if(newState != exitSwitchLastState){ // manual mode
    //update related variables
    exitSwitchLastState = newState;
    exitMode = !exitMode;

    //handle mode change event
    if(exitMode && xSemaphoreTake(exitGateStateMutex, portMAX_DELAY)) {
      currentExitGateStatus = (currentExitGateStatus == OPEN) ? CLOSE : OPEN;

      xSemaphoreGive(exitGateStateMutex);
    }
    return;
  }

  if(exitMode) return;

  // run down here only in auto mode
  if(xSemaphoreTake(exitGateStateMutex, portMAX_DELAY)){
    if (currentExitGateStatus == OPEN) {
      if (!isExitFrontSensorDetected && !isExitBackSensorDetected) {
        currentExitGateStatus = CLOSE;
      }
    } else {
      if (isExitFrontSensorDetected) {
        currentExitGateStatus = OPEN;
      } else {
        currentExitGateStatus = CLOSE;
      }
    }

    xSemaphoreGive(exitGateStateMutex);
  }
}

void readSerialCommandFromESP (void *pvParameters) { // related global variables: username, loopCounter, isValidCardDetected
  readSerialCommandFromESPHandler = xTaskGetCurrentTaskHandle();

  while(1) {
    // Serial.println(1);
    String input = Serial.readStringUntil('\n');
    int separatorIndex = input.indexOf(':');

    if (separatorIndex != -1) {
      String label = input.substring(0, separatorIndex);
      String value = input.substring(separatorIndex + 1);
      value.trim();

      if(label.equals("USER") && xSemaphoreTake(usernameMutex, 0)) {
        username = value;
        xSemaphoreGive(usernameMutex);
      } 
      if(label.equals("CHECKING-RESULT")){
        if(xSemaphoreTake(scannedCardStateMutex, portMAX_DELAY)){
          xTaskNotifyGive(renderHanlder);
          display.clearScreen();
          if(value.equals("1") || value.equals("0")){
            scannedCardState = value.toInt();
          } else {
            scannedCardState = UNDETECTED;
          }

          xSemaphoreGive(scannedCardStateMutex);
        }
      }  
    }

    if (ulTaskNotifyTake(pdTRUE, 0)) {
      if(xSemaphoreTake(scannedCardStateMutex, portMAX_DELAY)){
        scannedCardState = UNDETECTED;

        xSemaphoreGive(scannedCardStateMutex);
      }
    }

    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

void readSensor(void *pvParameters) { // related global variables: slotStates, hasChangeState, slotsLeft, isDetected, isSending
  int entrySwitchLastState = digitalRead(ENTRY_BTN_PIN);
  int exitSwitchLastState = digitalRead(EXIT_BTN_PIN);
  bool entryMode = false;
  bool exitMode = false;
  bool isEntryFrontSensorDetected = false;
  bool isEntryBackSensorDetected = false;
  bool isExitFrontSensorDetected = false;
  bool isExitBackSensorDetected = false;

  while(1) {
    int slotsLeft = TOTAL_SLOTS;
    int sensorValue;
    int prevSlotStateCounter = 0;

    // read parkinglot states
    if(xSemaphoreTake(slotStateMutex, portMAX_DELAY)){
      for (int i = 0; i < 6; i++) {
        sensorValue = infraredSensor.isParkingSensorDetected(i) ? 1 : 0;
        if(slotStates[i] != sensorValue){
          prevSlotStateCounter++;
        }
        slotStates[i] = sensorValue;
        slotsLeft = slotsLeft - slotStates[i];
      }
      hasSlot = slotsLeft > 0;

      xSemaphoreGive(slotStateMutex);
    }

    if(prevSlotStateCounter > 0){ 
      xTaskNotifyGive(parkingSlotStatesChangeHandler);
    }
    
    // read sensor states around gates
    isEntryFrontSensorDetected = infraredSensor.isEntryFrontSensorDetected();
    isEntryBackSensorDetected = infraredSensor.isEntryBackSensorDetected();
    isExitFrontSensorDetected = infraredSensor.isExitFrontSensorDetected();
    isExitBackSensorDetected = infraredSensor.isExitBackSensorDetected();

    // read RFID card
    bool isDetected = entryScanner.validateCard();
    if(!entryScanner.hasSend && isDetected ) {
      printCardToSerial(entryScanner.scannedCardIndex);
      entryScanner.hasSend = true;
      if(xSemaphoreTake(scannedCardStateMutex, portMAX_DELAY)){
        scannedCardState = CHECKING_CARD;

        xSemaphoreGive(scannedCardStateMutex);
      }
    }

    // update gate status
    updateEntryGateStatus(entrySwitchLastState, entryMode, isEntryFrontSensorDetected, isEntryBackSensorDetected);
    updateExitGateStatus(exitSwitchLastState, exitMode, isExitFrontSensorDetected, isExitBackSensorDetected);

    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

void render(void *pvParameters) { // related global variables: loopCounter, username, isValidCardDetected
  int loopCounter = LCD_LOOP_COUNTER;
  renderHanlder = xTaskGetCurrentTaskHandle();

  while(1){
    // Serial.println("3");
    if (ulTaskNotifyTake(pdTRUE, 0)) {
      loopCounter--;
    }

    if(loopCounter == 0){ //clear LCD after display scanning result for a while
      display.clearScreen();
      loopCounter = LCD_LOOP_COUNTER;
      xTaskNotifyGive(readSerialCommandFromESPHandler);
    }

    if(xSemaphoreTake(scannedCardStateMutex, 0)){
      if((loopCounter == LCD_LOOP_COUNTER - 1) && scannedCardState != UNDETECTED){
        display.clearScreen();
      }
      xSemaphoreGive(scannedCardStateMutex);
    }

    if(xSemaphoreTake(scannedCardStateMutex, portMAX_DELAY)){
      if(scannedCardState == VALID_CARD){
        if(xSemaphoreTake(usernameMutex, 0)){
          display.printString("Hi " + username + " !");

          xSemaphoreGive(usernameMutex);
        }
      } else if(scannedCardState == INVALID_CARD) {
        display.printString("Invalid card");
      } else if (scannedCardState == CHECKING_CARD) {
        display.clearScreen();
        display.printString("Scan...");

        xSemaphoreGive(scannedCardStateMutex);
        vTaskDelay(pdMS_TO_TICKS(10));
        continue;
      } else {
        if(xSemaphoreTake(slotStateMutex, portMAX_DELAY)){
          display.render(slotStates[0], slotStates[1], slotStates[2], slotStates[3], slotStates[4], slotStates[5]);
          
          xSemaphoreGive(slotStateMutex);
        }

        xSemaphoreGive(scannedCardStateMutex);
        vTaskDelay(pdMS_TO_TICKS(1));
        continue;
      }

      xSemaphoreGive(scannedCardStateMutex);
    }

    vTaskDelay(pdMS_TO_TICKS(1));
    loopCounter--;
  }
}

void controlHardware(void *pvParameters) {
  while(1) {
    // Serial.println("4");
    if (digitalRead(LIGHT_SENSOR_PIN) == HIGH) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }

    if(xSemaphoreTake(entryGateStateMutex, 0)){
      if (currentEntryGateStatus == OPEN) {
        entryGate.open();
      } else {
        entryGate.close();
      }

      xSemaphoreGive(entryGateStateMutex);
    }

    if(xSemaphoreTake(exitGateStateMutex, 0)){
      if (currentExitGateStatus == OPEN) {
        exitGate.open();
      } else {
        exitGate.close();
      }

      xSemaphoreGive(exitGateStateMutex);
    }

    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

void handleParkinglotStatesChanges (void *pvParameters) {
  parkingSlotStatesChangeHandler = xTaskGetCurrentTaskHandle();
  while (1){
    // Serial.println("5");
    ulTaskNotifyTake(pdTRUE, portMAX_DELAY);

    if(xSemaphoreTake(slotStateMutex, portMAX_DELAY)){
      String message = "STATE:";
      for (int i = 0; i < TOTAL_SLOTS; i++) {
        message += String(slotStates[i]);
        if (i < TOTAL_SLOTS - 1) {
          message += ","; 
        }
      }
      Serial.println(message);

      xSemaphoreGive(slotStateMutex);
    }
  }
}

void setup() {
  pinMode(ENTRY_BTN_PIN, INPUT_PULLUP);
  pinMode(EXIT_BTN_PIN, INPUT_PULLUP);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  Serial.begin(9600);

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

  entryGateStateMutex = xSemaphoreCreateMutex();
  exitGateStateMutex = xSemaphoreCreateMutex();
  slotStateMutex = xSemaphoreCreateMutex();
  scannedCardStateMutex = xSemaphoreCreateMutex();
  usernameMutex = xSemaphoreCreateMutex();

  xTaskCreate(readSerialCommandFromESP, "Task1", 300, NULL, 1, NULL);
  xTaskCreate(readSensor, "Task2", 300, NULL, 1, NULL);
  xTaskCreate(render, "Task3", 300, NULL, 1, &renderHanlder);
  xTaskCreate(controlHardware, "Task4", 300, NULL, 1, NULL);
  xTaskCreate(handleParkinglotStatesChanges, "Task5", 300, NULL, 2, &parkingSlotStatesChangeHandler);

  vTaskStartScheduler();
}

void loop() {
}
