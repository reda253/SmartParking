import serial
import time

PORT = "" #write your port here
BAUD = 9600

try:
    ser = serial.Serial(PORT, BAUD, timeout=1)
    print(f"Connected to {PORT}")
    time.sleep(2)  # wait for Arduino to reset
    while True:
        line = ser.readline().decode('utf-8').strip()
        if line:
            print(f"Received: {line}")
except serial.SerialException as e:
    print(" error: {e}")
except KeyboardInterrupt:
    print("Stopped...")
    ser.close()