#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

#define ENTRY_INVALID_CARD 0
#define ENTRY_VALID_CARD 1
#define EXIT_INVALID_CARD 3
#define EXIT_VALID_CARD 4
#define REQUEST_FAIL 5

//NOTICE: change to the domain of webserver
//NOTICE: currently, we cannot make ESP communicate with outsider server which is not in the same local wifi address with ESP
const String WEB_SERVER_DOMAIN = "http://192.168.43.116:4000";
const int MAX_FAILED_PING = 3;

ESP8266WiFiMulti WiFiMulti;
bool readyToRequest;
int failedPingCounter;
const String healthCheckUrl = WEB_SERVER_DOMAIN + "/healthcheck";
const String carEnteringUrl = WEB_SERVER_DOMAIN + "/api/v1/cards/linked-vehicle";
const String updateParkingSlotUrl = WEB_SERVER_DOMAIN + "/api/v1/parking-slots";
WiFiClient client;
HTTPClient http;

void setup() {
  Serial.begin(9600);
  readyToRequest = false;
  failedPingCounter = 0;

  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    delay(1000);
  }

  WiFi.mode(WIFI_STA);
  // must use the same wifi as Webserver
  // WiFiMulti.addAP("Trung Tam TT-TV", "12345679");
  WiFiMulti.addAP("AndroidAP", "12345679");
}

String encodeQueryParam(const String &str) {
    String encoded = "";
    for (int i = 0; i < str.length(); i++) {
        char c = str[i];
        if (isalnum(c)) {
            encoded += c;
        } else {
            encoded += '%';
            char buf[3];
            sprintf(buf, "%02X", c);
            encoded += buf;
        }
    }
    return encoded;
}

void requestToCheckCard (String cardId, String pos) {
  //test
  // Serial.println("USER:Huy\nCHECKING-RESULT:1");
  // return;

  http.setTimeout(10000); //ms
  String url = carEnteringUrl 
              + "?card_id=" + encodeQueryParam(cardId) 
              + "&gate_pos=" + encodeQueryParam(pos);
  String checkingResult = "CHECKING-RESULT:";

  if (!http.begin(client, url)) {
    readyToRequest = false;
    Serial.println(checkingResult + REQUEST_FAIL);
    http.end();
    return;
  }

  Serial.println("[HTTP] GET: request to check card");
  int httpCode = http.GET();

  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
      String payload = http.getString();
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, payload);

      if (error) {
        Serial.println("JSON parse failed");
        return;
      }

      String info = doc["info"].as<String>();
      Serial.println("USER:" + info);
      checkingResult += (pos == "R" ? ENTRY_VALID_CARD : EXIT_VALID_CARD);
    } else {
      checkingResult += (pos == "R" ? ENTRY_INVALID_CARD : EXIT_INVALID_CARD);
    }
    Serial.println(checkingResult);
  } else {
    readyToRequest = false;
    Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    Serial.println(checkingResult + REQUEST_FAIL);
  }

  http.end();
}

void requestToUpdateParkingState (String value) {
  //test
  // return;

  http.setTimeout(10000); //ms
  if (http.begin(client, updateParkingSlotUrl)) {
    http.addHeader("Content-Type", "application/json");
    Serial.println("[HTTP] PUT: updateParkingSlotUrl");
    String payload = "{\"states\":\"" + value +  "\"}";
    int httpCode = http.PUT(payload);
    
    if (httpCode > 0) {
      Serial.printf("[HTTP] PUT... code: %d\n", httpCode);
    } else {
      readyToRequest = false;
      Serial.printf("[HTTP] PUT... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    readyToRequest = false;
    Serial.println("[HTTP] Unable to connect");
  }
}

void pingToExpressServer () {
  //test
  // readyToRequest = true;
  // return;

  http.setTimeout(2000); //ms
  if (http.begin(client, healthCheckUrl)) {
    Serial.println("[HTTP] GET: health check server");
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.printf("[HTTP] GET: healthcheck code: %d\n", httpCode);
      readyToRequest = true;

      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
        String payload = http.getString();
        Serial.println(payload);
      }
    } else {
      Serial.printf("[HTTP] GET healthcheck failed, error: %s\n", http.errorToString(httpCode).c_str());
      failedPingCounter++;
    }

    http.end();
  } else {
    Serial.println("[HTTP] Unable to connect");
    failedPingCounter++;
  }
}

void loop() {
  if(failedPingCounter >= MAX_FAILED_PING){
    Serial.println("Too many failed ping request, Reset WiFi...");
    WiFi.disconnect(true);
    delay(1000);
    WiFiMulti.run();
    failedPingCounter = 0;
  }

  if ((WiFiMulti.run() != WL_CONNECTED)) { // wifi not is ready
    Serial.println("WiFi is not ready...");
    delay(500);
    return;
  }

  if(!readyToRequest){ // express server is ready
    pingToExpressServer();
    delay(1000);
  }

  if((Serial.available() <= 0)) return;

  String input = Serial.readStringUntil('\n');
  int separatorIndex = input.indexOf(':');

  if (separatorIndex != -1) {
    String label = input.substring(0, separatorIndex);
    String value = input.substring(separatorIndex + 1);

    if(label == "CARD"){
      separatorIndex = value.indexOf(':');
      String gatePos = value.substring(0, separatorIndex);
      String cardId = value.substring(separatorIndex + 1);

      requestToCheckCard(cardId, gatePos);
    } else if(label == "STATE") {
      value.trim();
      requestToUpdateParkingState(value);
    }
  }  
}