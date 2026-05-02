/**
 * SMART PARKING SYSTEM - Group X
 * FST Tanger - LSI S2
 * Technologies Arduino et Systèmes embarqués
 * 
 * Hardware: Arduino Uno, HC-SR04, SG90 Servos, LEDs
 */

#include <Servo.h>

// ── Ultrasonic Sensor Pins ───────────────────────────────────────
const int TRIG_PINS[] = {2, 4, 6, 8};
const int ECHO_PINS[] = {3, 5, 7, 9};
const int NUM_SENSORS = 4;

// ── Servo Pins ───────────────────────────────────────────────────
const int ENTRY_SERVO_PIN = 10;
const int EXIT_SERVO_PIN  = 11;

// ── Door Angles ──────────────────────────────────────────────────
//   Entry: CLOSED=0, OPEN=90  (confirmed working)
//   Exit:  reversed — CLOSED=90, OPEN=0
const int ENTRY_DOOR_OPEN   = 180;
const int ENTRY_DOOR_CLOSED = 90;
const int EXIT_DOOR_OPEN    = 0;   // ← reversed
const int EXIT_DOOR_CLOSED  = 90;  // ← reversed

// ── LED Pins ─────────────────────────────────────────────────────
//   Green LEDs : D12, D13, A4, A5
//   Red   LEDs : A0,  A1,  A2, A3
const int GREEN_PINS[] = {12, 13, A0, A1};
const int RED_PINS[]   = {A2, A3, A4, A5};

// ── Detection Threshold ──────────────────────────────────────────
const float OCCUPIED_THRESHOLD_CM = 10.0;

// ── Servo Objects ────────────────────────────────────────────────
Servo entryServo;
Servo exitServo;

// ── State Tracking ───────────────────────────────────────────────
bool entryDoorOpen = false;
bool exitDoorOpen  = false;
bool slotOccupied[NUM_SENSORS] = {false, false, false, false};
bool spotReserved[NUM_SENSORS] = {false, false, false, false};

// ════════════════════════════════════════════════════════════════
//  Ultrasonic Helper
// ════════════════════════════════════════════════════════════════
float getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return -1;
  return (duration * 0.0343) / 2.0;
}

// ════════════════════════════════════════════════════════════════
//  LED Control
// ════════════════════════════════════════════════════════════════
void setSlotLED(int sensorIndex, bool occupied) {
  if (occupied) {
    digitalWrite(GREEN_PINS[sensorIndex], LOW);
    digitalWrite(RED_PINS[sensorIndex],   HIGH);
  } else {
    digitalWrite(GREEN_PINS[sensorIndex], HIGH);
    digitalWrite(RED_PINS[sensorIndex],   LOW);
  }
}

// ════════════════════════════════════════════════════════════════
//  Door Control — Entry (D10)
//  CLOSED=0° confirmed working. OPEN=90° (was reversed, now fixed)
// ════════════════════════════════════════════════════════════════
void openEntryDoor() {
  if (!entryDoorOpen) {
    entryServo.write(ENTRY_DOOR_OPEN);
    entryDoorOpen = true;
    Serial.println("[ENTRY DOOR] >> OPENED");
  }
}

void closeEntryDoor() {
  if (entryDoorOpen) {
    entryServo.write(ENTRY_DOOR_CLOSED);
    entryDoorOpen = false;
    Serial.println("[ENTRY DOOR] >> CLOSED");
  }
}

// ════════════════════════════════════════════════════════════════
//  Door Control — Exit (D11)
//  Physically mounted in reverse — angles are flipped vs entry
// ════════════════════════════════════════════════════════════════
void openExitDoor() {
  if (!exitDoorOpen) {
    exitServo.write(EXIT_DOOR_OPEN);
    exitDoorOpen = true;
    Serial.println("[EXIT DOOR]  >> OPENED");
  }
}

void closeExitDoor() {
  if (exitDoorOpen) {
    exitServo.write(EXIT_DOOR_CLOSED);
    exitDoorOpen = false;
    Serial.println("[EXIT DOOR]  >> CLOSED");
  }
}

// ════════════════════════════════════════════════════════════════
//  Serial Command Parser
//
//  Commands FROM computer → Arduino:
//    "ENTRY_OPEN"  / "ENTRY_CLOSE"
//    "EXIT_OPEN"   / "EXIT_CLOSE"
// ════════════════════════════════════════════════════════════════
void handleSerialCommand() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if      (cmd == "ENTRY_OPEN")  openEntryDoor();
    else if (cmd == "ENTRY_CLOSE") closeEntryDoor();
    else if (cmd == "EXIT_OPEN")   openExitDoor();
    else if (cmd == "EXIT_CLOSE")  closeExitDoor();
    else if (cmd.startsWith("RESERVE_")) {
      int id = cmd.substring(8).toInt() - 1;
      if (id >= 0 && id < NUM_SENSORS) spotReserved[id] = true;
    }
    else if (cmd.startsWith("FREE_")) {
      int id = cmd.substring(5).toInt() - 1;
      if (id >= 0 && id < NUM_SENSORS) spotReserved[id] = false;
    }
    else {
      Serial.print("[WARN] Unknown command: ");
      Serial.println(cmd);
    }
  }
}

// ════════════════════════════════════════════════════════════════
//  Setup
// ════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(9600);

  // Ultrasonic pins
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(TRIG_PINS[i], OUTPUT);
    pinMode(ECHO_PINS[i], INPUT);
  }

  // LED pins — start all green (free)
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(GREEN_PINS[i], OUTPUT);
    pinMode(RED_PINS[i],   OUTPUT);
    digitalWrite(GREEN_PINS[i], HIGH);
    digitalWrite(RED_PINS[i],   LOW);
  }

  // Servos — start both doors closed
  entryServo.attach(ENTRY_SERVO_PIN);
  exitServo.attach(EXIT_SERVO_PIN);
  entryServo.write(ENTRY_DOOR_CLOSED);
  exitServo.write(EXIT_DOOR_CLOSED);

  Serial.println("=== Parking System Ready ===");
  Serial.println("------------------------------------------------------------");
}

// ════════════════════════════════════════════════════════════════
//  Loop
// ════════════════════════════════════════════════════════════════
void loop() {
  int freeSlots = 0;

  // ── 1. Read all sensors, update LEDs, send data ─────────────
  for (int i = 0; i < NUM_SENSORS; i++) {
    float distance = getDistance(TRIG_PINS[i], ECHO_PINS[i]);

    // OUT_OF_RANGE (-1) → treat as FREE (nothing detected)
    bool occupied = (distance > 0 && distance < OCCUPIED_THRESHOLD_CM);
    bool forceOccupied = occupied || spotReserved[i];

    // Only update LED on state change (avoids flicker)
    if (forceOccupied != slotOccupied[i]) {
      slotOccupied[i] = forceOccupied;
      setSlotLED(i, forceOccupied);
    }

    if (!forceOccupied) freeSlots++;

    // Always send distance for debugging + status
    // Format: "S1:23.4cm:FREE"  or  "S2:OUT_OF_RANGE:FREE"
    Serial.print("S");
    Serial.print(i + 1);
    Serial.print(":");
    if (distance < 0) Serial.print("OUT_OF_RANGE");
    else {
      Serial.print(distance, 1);
      Serial.print("cm");
    }
    Serial.print(":");
    Serial.println(forceOccupied ? "OCCUPIED" : "FREE");

    delay(30);
  }

  // ── 2. Send free slot summary ────────────────────────────────
  Serial.print("SLOTS:");
  Serial.println(freeSlots);
  Serial.println("----");

  // ── 3. Listen for door commands from backend ─────────────────
  handleSerialCommand();

  delay(500);
}