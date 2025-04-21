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

#define ENTRY_GATE 1
#define EXIT_GATE 0

#define ENTRY_INVALID_CARD 0
#define ENTRY_VALID_CARD 1
#define EXIT_INVALID_CARD 3
#define EXIT_VALID_CARD 4
#define CHECKING_CARD 2
#define REQUEST_FAIL 5
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

QueueHandle_t slotStatesQueue;

QueueHandle_t slotNewStatesQueue;

QueueHandle_t usernameQueue;

QueueHandle_t scannedCardStateQueue;

QueueHandle_t gateSignalQueue;

QueueHandle_t lightStateQueue;

QueueHandle_t scannedCardInfoQueue;

QueueHandle_t cardWithSpecificGateQueue;

QueueHandle_t timeObserverQueue;

SemaphoreHandle_t entryGateCardDetectedConsumedByRFIDScanDecisionUnit;

SemaphoreHandle_t exitGateCardDetectedConsumedByRFIDScanDecisionUnit;

SemaphoreHandle_t entryGateCardDetectedConsumedByGateCtrl;

SemaphoreHandle_t exitGateCardDetectedConsumedByGateCtrl;

TaskHandle_t displayManagerHandle = NULL;

void printCurrentTime(String taskName){
  unsigned long currentTime = micros();
  Serial.println("[LOG] " + taskName + ": " + String(currentTime) + " µs");
}

int getBitAt (int srcNum, int index){
  //Index start from right to left
  return (srcNum >> index) & 1;
}

void truncateNBitsEnd (int &srcNum, int n){
  srcNum = srcNum >> n;
}

void appendBit (int &srcNum, int value){
  srcNum = (srcNum << 1) + value;
}

void printGateAndCardToSerial (int index, bool gate) {
  String result = "";
  String gatePrior = gate == ENTRY_GATE ? "R" : "L";
  
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

  Serial.println("CARD:"+ gatePrior + ":" + result);
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
    if (hasSlot 
      && isEntryFrontSensorDetected
      && (xSemaphoreTake(entryGateCardDetectedConsumedByGateCtrl, 0) == pdTRUE)) 
    {
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
    if (isExitFrontSensorDetected
      && (xSemaphoreTake(exitGateCardDetectedConsumedByGateCtrl, 0) == pdTRUE)) 
    {
      currentExitGateStatus = OPEN;

    } else {
      currentExitGateStatus = CLOSE;
      entryScanner.clearCache();

    }
  }
}

void espCommandDispatcher (void *pvParameters) { 
  String input, label, value;
  int separatorIndex, result;

  while(1) {
    // Serial.println(1);
    if(Serial.available() <= 0) {
      continue;
    }

    input = Serial.readStringUntil('\n');
    // Serial.println("received command:"+input);
    separatorIndex = input.indexOf(':');

    if (separatorIndex == -1) {
      continue;
    }

    //down here only when receive valid ESP command
    label = input.substring(0, separatorIndex);
    value = input.substring(separatorIndex + 1);
    value.trim();

    if(label.equals("USER")) {
      char msg[15];
      value.toCharArray(msg, sizeof(msg));
      result = xQueueOverwrite(usernameQueue, msg);
      if(result == errQUEUE_FULL){
        Serial.println("[espCommandDispatcher] Fail to overwrite usernameQueue");
      }
    } 

    if(label.equals("CHECKING-RESULT")){
      int valueToInt = value.toInt();
      if(valueToInt == ENTRY_VALID_CARD 
        || valueToInt == ENTRY_INVALID_CARD
        || valueToInt == EXIT_VALID_CARD
        || valueToInt == EXIT_INVALID_CARD
        || valueToInt == REQUEST_FAIL)
      {
        // send to displayManager
        result = xQueueOverwrite(scannedCardStateQueue, &valueToInt);
        if(result == errQUEUE_FULL){
          Serial.println("[espCommandDispatcher] Fail to overwrite scannedCardStateQueue");
        }
      }

      // send to gateController
      if(valueToInt == ENTRY_VALID_CARD){
        xSemaphoreGive(entryGateCardDetectedConsumedByGateCtrl);
        xSemaphoreGive(entryGateCardDetectedConsumedByRFIDScanDecisionUnit);
      }

      if(valueToInt == EXIT_VALID_CARD){
        xSemaphoreGive(exitGateCardDetectedConsumedByGateCtrl);
        xSemaphoreGive(exitGateCardDetectedConsumedByRFIDScanDecisionUnit);
      }
    }  
  }
}

void printTime(String taskName, String startTime, String time, String time2){
  Serial.println("[LOG] " + taskName + ": "+ startTime + " µs " + time + " µs " + time2 + " µs ");
  vTaskDelay(100 / portTICK_PERIOD_MS);
}
void signalReader(void *pvParameters) {
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
    int result = xQueueOverwrite(slotStatesQueue, &slotStates);
    if(result == errQUEUE_FULL){
      Serial.println("[signalReader] Fail to overwrite slotStatesQueue");
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
    result = xQueueOverwrite(gateSignalQueue, &gateState);
    if(result == errQUEUE_FULL){
      Serial.println("[signalReader] Fail to overwrite gateSignalQueue");
    }

    //read light sensor
    lightState = digitalRead(LIGHT_SENSOR_PIN);

    unsigned long currentTime = micros();
    xQueueOverwrite(timeObserverQueue, &currentTime);

    result = xQueueOverwrite(lightStateQueue, &lightState);
    if(result == errQUEUE_FULL){
      Serial.println("[signalReader] Fail to overwrite lightStateQueue");
    }
  }
}

void rfidReader(void *pvParameters) {
  while(1) {
    // read RFID card
    bool isDetected = entryScanner.validateCard();
    if(!entryScanner.hasSend && isDetected) {
      int result = xQueueOverwrite(scannedCardInfoQueue, &(entryScanner.scannedCardIndex));
      if(result == errQUEUE_FULL){
        Serial.println("[rfidReader] Fail to overwrite cardInforQueue");
      }

      entryScanner.hasSend = true;
    }
  }
}

void displayManager(void *pvParameters) {
  int slotStates = 0, cardState = UNDETECTED, result;
  char username[15] = "", displayedText[30];

  while(1){
    result = xQueueReceive(scannedCardStateQueue, &cardState, 0);
    if (result == pdTRUE) {
      display.clearScreen();

      if (cardState == ENTRY_VALID_CARD 
        || cardState == ENTRY_INVALID_CARD
        || cardState == EXIT_VALID_CARD
        || cardState == EXIT_INVALID_CARD
        || cardState == REQUEST_FAIL) {
        //start counting if result arrived
        memset(username, 0, sizeof(username));
        memset(displayedText, 0, sizeof(displayedText));
        username[0] = '\0';
        displayedText[0] = '\0';
      }

      if (cardState == ENTRY_VALID_CARD )
      {
        strcat(displayedText, "Hi ");
      }
      if (cardState == EXIT_VALID_CARD) 
      {
        strcat(displayedText, "Bye ");
      }
    }
    vTaskPrioritySet(displayManagerHandle, 2);

    // rendering`s main logic
    if((cardState == ENTRY_VALID_CARD) || (cardState == EXIT_VALID_CARD))
    {
      if(xQueueReceive(usernameQueue, username, 0)){
        strcat(displayedText, username);
        strcat(displayedText, " !");
      }
      display.printString(displayedText);
      vTaskDelay(2000 / portTICK_PERIOD_MS);

      display.clearScreen();
      cardState = UNDETECTED;

    } else if((cardState == ENTRY_INVALID_CARD) || (cardState == EXIT_INVALID_CARD))
    {
      display.printString("Invalid card");
      vTaskDelay(2000 / portTICK_PERIOD_MS);

      display.clearScreen();
      cardState = UNDETECTED;

    } else if (cardState == CHECKING_CARD) 
    {
      display.printString("Scanning...");

    } else if(cardState == REQUEST_FAIL) 
    {
      display.printString("Fail to scan");
      vTaskDelay(2000 / portTICK_PERIOD_MS);

      display.clearScreen();
      cardState = UNDETECTED;

    } else {
      // unsigned long time_ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
      // Serial.println("before peek: " + (String)time_ms);

      xQueuePeek(slotStatesQueue, &slotStates, 0);
      display.render(getBitAt(slotStates, 5), getBitAt(slotStates, 4), getBitAt(slotStates, 3), 
                     getBitAt(slotStates, 2), getBitAt(slotStates, 1), getBitAt(slotStates, 0));

      // time_ms = xTaskGetTickCount() * portTICK_PERIOD_MS;
      // Serial.println("after displayManager: " + (String)time_ms);
    }
    vTaskPrioritySet(displayManagerHandle, 1);
  }
}

void lightController(void *pvParameters) {
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


void gateController(void *pvParameters) {
  int entrySwitchLastState = 0;
  int exitSwitchLastState = 0;
  bool entryMode = false;
  bool exitMode = false;
  bool currentEntryGateStatus = 0;
  bool currentExitGateStatus = 0;
  int gateState = 0;
  int slotState = 0;

  while(1) {
    xQueuePeek(gateSignalQueue, &gateState, 0);
    xQueuePeek(slotStatesQueue, &slotState, 0);

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

void slotStatesChangeDetector (void *pvParameters) {
  int slotStates = 0;
  int newSlotStates = 0;

  while (1){
    if(xQueuePeek(slotStatesQueue, &newSlotStates, 0)){
      if(slotStates - newSlotStates != 0){ 
        Serial.println("state change: " + (String)newSlotStates + " " + (String)slotStates);
        slotStates = newSlotStates;
        int result = xQueueOverwrite(slotNewStatesQueue, &slotStates);
        if(result == errQUEUE_FULL){
          Serial.println("[slotStatesChangeDetector] Fail to overwrite slotNewStatesQueue");
        }
      }
    }
  }
}

void espCommandProducer (void *pvParameters) {
  int slotStates;
  int cardMixGate = -1;

  while (1){
    if(xQueueReceive(cardWithSpecificGateQueue, &cardMixGate, 0)){
      int gate = getBitAt(cardMixGate, 0); // get the last bit which is gate value
      truncateNBitsEnd(cardMixGate, 1); // truncate the last bit to get the proper cardIndex

      printGateAndCardToSerial(cardMixGate, gate);
      cardMixGate = -1;
    }

    if(xQueueReceive(slotNewStatesQueue, &slotStates, 0)){
      printParkingStatesToSerial(slotStates);
    }
  }
}

void rfidScanDecisionUnit (void *pvParameters) {
  int cardIndex;
  int gateSensorStates = 0;
  int gate = -1;
  int result;
  bool entryGateUnopen = true;
  bool exitGateUnopen = true;
  int slotState;

  while (1){
    xQueuePeek(gateSignalQueue,&gateSensorStates, 0);
    xQueuePeek(slotStatesQueue, &slotState, 0);
    // bit 5th is the value of sensor which is futher to the parkinglot at the entry gate
    // bit 4th is the value of sensor which is closer to the parkinglot at the entry gate
    // bit 2nd is the value of sensor which is closer to the parkinglot at the exit gate
    // bit 1nd is the value of sensor which is futher to the parkinglot at the exit gate

    // if that gate's barrier is open, that side is unscannable 
    if(xSemaphoreTake(entryGateCardDetectedConsumedByRFIDScanDecisionUnit, 0) == pdTRUE){
      entryGateUnopen = false; 
    }
    if(xSemaphoreTake(exitGateCardDetectedConsumedByRFIDScanDecisionUnit, 0) == pdTRUE){
      exitGateUnopen = false; 
    }
    // if both sensors of that gate detects not thing, that side will return to scannable 
    if(!entryGateUnopen 
      && !getBitAt(gateSensorStates, 5) 
      && !getBitAt(gateSensorStates, 4)){
      entryGateUnopen = true; 
    }
    if(!exitGateUnopen 
      && !getBitAt(gateSensorStates, 2) 
      && !getBitAt(gateSensorStates, 1)){
      exitGateUnopen = true; 
    }

    // decide the priority of gate for scanning
    if(getBitAt(gateSensorStates, 5) && !getBitAt(gateSensorStates, 2)){
      gate = entryGateUnopen ? ENTRY_GATE : -1;

    } else if(!getBitAt(gateSensorStates, 5) && getBitAt(gateSensorStates, 2)){
      gate = exitGateUnopen ? EXIT_GATE : -1;

    } else if(!getBitAt(gateSensorStates, 5) && !getBitAt(gateSensorStates, 2)){
      gate = -1;

    } else {
      if(entryGateUnopen && exitGateUnopen){
        if(gate == -1){
          // run in here only when cars in both ways reach the sensor at the same time
          gate = EXIT_GATE;
        }

      }else if(entryGateUnopen || exitGateUnopen){
        gate = entryGateUnopen ? ENTRY_GATE: EXIT_GATE;
        
      }
    }

    if((gate == ENTRY_GATE) && (slotState == TOTAL_SLOTS_BITS_TO_INT)){
      xQueueReceive(scannedCardInfoQueue,&cardIndex, 0);
      continue;
    }

    if(xQueueReceive(scannedCardInfoQueue,&cardIndex, 0)
      && (entryGateUnopen || exitGateUnopen)
      && (gate != -1))
    { // productRFIDFusion: run in here if card is detected and entry gate`s front Sensor or exit gate`s front Sensor detected signal
      appendBit(cardIndex, gate); // append the gate value to the end of cardIndex's bits
      result = xQueueSend(cardWithSpecificGateQueue, &cardIndex, portMAX_DELAY);
      if(result == errQUEUE_FULL){
        Serial.println("[rfidScanDecisionUnit] Fail to overwrite cardWithSpecificGateQueue");
      }
      
      // displayManager: only sent if queue is empty
      if (uxQueueMessagesWaiting(scannedCardStateQueue) == 0){
        int cardState = CHECKING_CARD;
        int result = xQueueOverwrite(scannedCardStateQueue, &cardState);
        if(result == errQUEUE_FULL){
          Serial.println("[rfidScanDecisionUnit] Fail to overwrite scannedCardStateQueue");
        }
      }
    }
    // vTaskDelay(100/MS_PER_TICK);
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

  slotStatesQueue = xQueueCreate(1, sizeof(int));
  slotNewStatesQueue = xQueueCreate(1, sizeof(int));
  usernameQueue = xQueueCreate(1, sizeof(char[15]));
  scannedCardStateQueue = xQueueCreate(1, sizeof(int));
  gateSignalQueue = xQueueCreate(1, sizeof(int));
  lightStateQueue = xQueueCreate(1, sizeof(int));
  scannedCardInfoQueue = xQueueCreate(1, sizeof(int));
  cardWithSpecificGateQueue = xQueueCreate(10, sizeof(int));
  timeObserverQueue = xQueueCreate(1, sizeof(unsigned long));

  entryGateCardDetectedConsumedByRFIDScanDecisionUnit = xSemaphoreCreateBinary();
  exitGateCardDetectedConsumedByRFIDScanDecisionUnit = xSemaphoreCreateBinary();
  entryGateCardDetectedConsumedByGateCtrl = xSemaphoreCreateBinary();
  exitGateCardDetectedConsumedByGateCtrl = xSemaphoreCreateBinary();

  if(entryGateCardDetectedConsumedByRFIDScanDecisionUnit == NULL
    || exitGateCardDetectedConsumedByRFIDScanDecisionUnit == NULL
    || entryGateCardDetectedConsumedByGateCtrl == NULL
    || exitGateCardDetectedConsumedByGateCtrl == NULL
  ){
    Serial.println("[SetUp] Fail to create semaphore");
    return;
  }

  xTaskCreate(espCommandDispatcher, "Task1", 300, NULL, 1, NULL);
  xTaskCreate(signalReader, "Task2", 300, NULL, 1, NULL);
  xTaskCreate(rfidReader, "Task3", 300, NULL, 1, NULL);
  xTaskCreate(displayManager, "Task4", 300, NULL, 1, &displayManagerHandle);
  xTaskCreate(lightController, "Task5", 300, NULL, 1, NULL);
  xTaskCreate(gateController, "Task6", 300, NULL, 1, NULL);
  xTaskCreate(slotStatesChangeDetector, "Task7", 300, NULL, 1, NULL);
  xTaskCreate(espCommandProducer, "Task8", 300, NULL, 1, NULL);
  xTaskCreate(rfidScanDecisionUnit, "Task9", 300, NULL, 1, NULL);

  vTaskStartScheduler();
  // unsigned long start = micros();
  // // ... tác vụ chính ...
  // unsigned long duration = micros() - start;
  // Serial.println("Task done in " + String(duration) + " µs");
}

void loop() {
}
