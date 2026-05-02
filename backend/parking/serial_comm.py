import threading
import time
import serial
from .models import Sensor, Place
from django.db import transaction

SERIAL_PORT = "/dev/ttyACM0"
BAUD_RATE = 9600

# Global serial connection
ser = None
running = False

def init_serial():
    global ser, running
    if ser is not None and ser.is_open:
        return
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        running = True
        print(f"✅ Connected to Arduino on {SERIAL_PORT}")
        
        # Start background reading thread
        t = threading.Thread(target=read_serial_loop, daemon=True)
        t.start()
    except serial.SerialException as e:
        print(f"❌ Failed to connect to Arduino on {SERIAL_PORT}: {e}")

def read_serial_loop():
    global ser, running
    while running and ser and ser.is_open:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                process_serial_line(line)
        except Exception as e:
            print(f"⚠️ Error reading serial: {e}")
            time.sleep(2)
        time.sleep(0.1)

def process_serial_line(line):
    # Example lines:
    # "S1:12.5cm:FREE" or "S1:OUT_OF_RANGE:FREE" or "S1:8.0cm:OCCUPIED"
    # "SLOTS:3"
    # "----"
    if line.startswith("S") and ":" in line:
        parts = line.split(":")
        if len(parts) >= 3:
            sensor_name = parts[0] # e.g. "S1"
            distance_str = parts[1] # e.g. "12.5cm"
            status_str = parts[2] # "FREE" or "OCCUPIED"
            
            try:
                # Assuming id maps to sensor_name digit (1 to 4)
                s_id = int(sensor_name.replace("S", ""))
                is_occupied = (status_str == "OCCUPIED")
                
                # Update DB asynchronously but be careful of threading constraints with Django ORM
                # We use transaction.atomic to ensure DB consistency
                with transaction.atomic():
                    # Get or create Sensor
                    sensor, _ = Sensor.objects.get_or_create(id=s_id, defaults={'statut': 'actif'})
                    sensor.valeur = is_occupied
                    sensor.save()
                    
                    # Update related Place if exists
                    try:
                        place = Place.objects.get(id_sensor=sensor)
                        # Don't overwrite 'reservee' blindly, just update if libre/occupee
                        if place.statut in ['libre', 'occupee']:
                            place.statut = 'occupee' if is_occupied else 'libre'
                            place.save()
                    except Place.DoesNotExist:
                        pass
                
            except Exception as e:
                print(f"Error parsing/saving {line}: {e}")

def send_command(command_str):
    global ser
    if ser and ser.is_open:
        try:
            ser.write((command_str + '\n').encode('utf-8'))
            print(f"Sent to Arduino: {command_str}")
            return True
        except serial.SerialException as e:
            print(f"Failed sending {command_str}: {e}")
            return False
    else:
        print(f"Warning: Serial not open. Trying to send {command_str}")
        return False
