int LED1 = 13;
int button = 2;
int alive = 3;
int SHTSIGNAL = 4;
int ENABLE = 5;

boolean LED1State = false;

long buttonTimer = 0;
long longPressTime = 1500;
long veryLongPressTime = 5000;

boolean buttonActive = false;
boolean longPressActive = false;
boolean veryLongPressActive = false;

struct {
  int OFF;
  int ON;
  int UNDERSHUTDOWN;
  int UNDERBOOTUP;
} PowerStates {0, 1, 2 ,3};

int powerState = PowerStates.OFF;

void setup() {
  Serial.begin(9600);
  pinMode(LED1, OUTPUT);
  digitalWrite(LED1, false);
  pinMode(ENABLE, OUTPUT);
  digitalWrite(ENABLE, false);
  pinMode(SHTSIGNAL, OUTPUT);
  digitalWrite(SHTSIGNAL, false);
  pinMode(button, INPUT_PULLUP);
  pinMode(alive, INPUT);
}

void switchPowerOn() {
  digitalWrite(LED1, true);
  digitalWrite(ENABLE, true);
}

void switchPowerOff() {
  delay(3000);
  digitalWrite(LED1, false);
  digitalWrite(ENABLE, false);
}

void sendShutdownSignal() {
  Serial.println("Request MCU shutdown");
  digitalWrite(SHTSIGNAL, true);
  delay(100);
  digitalWrite(SHTSIGNAL, false);
}

void loop() {
  if (digitalRead(button) == LOW) {
    if (buttonActive == false) {
      buttonActive = true;
      buttonTimer = millis();
    }

    if ((millis() - buttonTimer > longPressTime) && (longPressActive == false)) {
      longPressActive = true;
      powerState = PowerStates.UNDERSHUTDOWN;
      sendShutdownSignal();
    }

    if ((millis() - buttonTimer > veryLongPressTime) && (veryLongPressActive == false)) {
      veryLongPressActive = true;
      Serial.println("Hard shutdown");
      powerState = PowerStates.OFF;
      switchPowerOff();
    }
  } else {
    if (buttonActive == true) {
      if (veryLongPressActive == true) {
        veryLongPressActive = false;
      }
      if (longPressActive == true) {
        longPressActive = false;
      } else {
        switchPowerOn();
        if(powerState == PowerStates.OFF) {
          powerState = PowerStates.UNDERBOOTUP;
          Serial.println("Booting UP");
        }
      }
      buttonActive = false;
    }

    if(digitalRead(alive) == HIGH) {
      /*if(powerState == PowerStates.OFF) {
         powerState = PowerStates.ON;
         Serial.println("MCU booted UP alone");
         digitalWrite(LED1, true);
      }*/

      if(powerState == PowerStates.UNDERBOOTUP) {
        powerState = PowerStates.ON;
        Serial.println("MCU booted UP");
      }

      if(powerState == PowerStates.UNDERSHUTDOWN) {
        powerState = PowerStates.ON;
      }
    } else {
      if(powerState == PowerStates.ON) {
        powerState = PowerStates.OFF;
        Serial.println("MCU shutdowned");
        switchPowerOff();
      }
    }
  }
}