#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <Servo.h>

#define RST_PIN D4
#define SS_PIN D8

#define redPin 4
#define greenPin 16

MFRC522 mfrc522(SS_PIN, RST_PIN);
Servo servo;

const char *ssid = "CuongDepTrai";
const char *password = "0363541710";
String host = "http://192.168.1.123:5000";
String url = host + "/read-checkin";

boolean checkinMode = true;

AsyncWebServer server(80);

int closePos = 180;
int openPos = 0;
int currentPos = closePos;
int servoOn = 0;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);

  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  servo.attach(D1);
  
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to Wifi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  servo.write(closePos);

  server.on("/door-status", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /door-status request");
    if(currentPos == openPos)
      request->send(200, "text/plain", "open");
    else request->send(200, "text/plain", "close");
  });

  server.on("/open-door", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /open-door request");
    request->send(200, "text/plain", "Door opened!");
    if(currentPos == openPos) {
      servo.write(closePos);
      currentPos = closePos;
    }
    else {
      servo.write(openPos);
      currentPos = openPos;
    }
    delay(1000);
  });

  server.on("/close-door", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /close-door request");
    request->send(200, "text/plain", "Door closed!");
    servo.write(closePos);
    currentPos = closePos;
    delay(1000);
  });

  server.on("/checkin", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /checkin request");
    request->send(200, "text/plain", "Checkin Switched!");
    checkinMode = true;
    url = host + "/read-checkin";
  });

  server.on("/register", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /register request");
    request->send(200, "text/plain", "Register Switched!");
    checkinMode = false;
    url = host + "/read-register";
  });

  server.on("/green-led-on", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /green-led request");
    request->send(200, "text/plain", "Green led is enabled!");
    turnOnLed(1);
  });

  server.on("/red-led-on", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Received /red-led request");
    request->send(200, "text/plain", "Red led is enabled!");
    turnOnLed(0);
  });

  server.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    if (!mfrc522.PICC_IsNewCardPresent()) {
      return;
    }

    if (!mfrc522.PICC_ReadCardSerial()) {
      return;
    }

    byte *cardId = mfrc522.uid.uidByte;
    String cardIdString = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      cardIdString += String(cardId[i], HEX);
    }

    Serial.println(cardIdString);

    WiFiClient client;
    HTTPClient http;
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument jsonDocument(200);
    jsonDocument["card_id"] = cardIdString;
    String jsonString;
    serializeJson(jsonDocument, jsonString);

    int httpCode = http.POST(jsonString);
    if (httpCode > 0) {
      String payload = http.getString();
      delay(1000);
    } else {
      Serial.println("HTTP request failed");
      delay(2000);
    }
    http.end();
    delay(3000);
  } else {
    Serial.println("Wifi disconnected...");
    delay(3000);
  }
}

void turnOnLed(int isGreen) {
  if(isGreen) {
    digitalWrite(greenPin, HIGH);
    delay(1000);
    digitalWrite(greenPin, LOW);
  }
  else {
    digitalWrite(redPin, HIGH);
    delay(1000);
    digitalWrite(redPin, LOW);
  }
}
