// to be used with Fio V3/ATmega32U4

#include <Keyboard.h>

uint8_t downPin  = 15;
uint8_t leftPin  = 14;
uint8_t upPin    = 16;
uint8_t rightPin = 10;
uint8_t enterPin = 2;
uint8_t aboutPin = 3;

uint8_t stickState = 0; // 0: none, 1: down, 2: left, 3: up, 4: right, 5: enter, 6: 'a'
uint32_t nextUpdate = 0;
uint16_t DEBOUNCEMS = 50;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Keyboard.begin();

  pinMode(downPin, INPUT_PULLUP);
  pinMode(leftPin, INPUT_PULLUP);
  pinMode(upPin, INPUT_PULLUP);
  pinMode(rightPin, INPUT_PULLUP);
  pinMode(enterPin, INPUT_PULLUP);
  pinMode(aboutPin, INPUT_PULLUP);

  stickState = 0;
  nextUpdate = 0;
}

void loop() {
  // put your main code here, to run repeatedly:
  if (digitalRead(downPin) == LOW) {
    if (stickState != 1) {
      delay(DEBOUNCEMS);
      if (digitalRead(downPin) == LOW) {
        Serial.println("DOWN");
        Keyboard.write(KEY_DOWN_ARROW);
        stickState = 1;
      }
    }
  } else if (digitalRead(leftPin) == LOW) {
    if (stickState != 2) {
      delay(DEBOUNCEMS);
      if (digitalRead(leftPin) == LOW) {
        Serial.println("LEFT");
        Keyboard.write(KEY_LEFT_ARROW);
        stickState = 2;
      }
    }
  } else if (digitalRead(upPin) == LOW) {
    if (stickState != 3) {
      delay(DEBOUNCEMS);
      if (digitalRead(upPin) == LOW) {
        Serial.println("UP");
        Keyboard.write(KEY_UP_ARROW);
        stickState = 3;
      }
    }
  } else if (digitalRead(rightPin) == LOW) {
    if (stickState != 4) {
      delay(DEBOUNCEMS);
      if (digitalRead(rightPin) == LOW) {
        Serial.println("RIGHT");
        Keyboard.write(KEY_RIGHT_ARROW);
        stickState = 4;
      }
    }
  } else if (digitalRead(enterPin) == LOW) {
    if (stickState != 5) {
      delay(DEBOUNCEMS);
      if (digitalRead(enterPin) == LOW) {
        Serial.println("ENTER");
        Keyboard.write(KEY_RETURN);
        stickState = 5;
      }
    }
  } else if (digitalRead(aboutPin) == LOW) {
    if (stickState != 6) {
      delay(DEBOUNCEMS);
      if (digitalRead(aboutPin) == LOW) {
        Serial.println("INFO");
        Keyboard.write('a');
        stickState = 6;
      }
    }
  } else {
    stickState = 0;
  }
}
