import threading
import time
import serial
from .models import Sensor, Place, Reservation
from django.db import transaction
from django.utils import timezone

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
        
        # Sync current reservations to Arduino on startup
        threading.Thread(target=sync_reservations_to_arduino, daemon=True).start()
        
        # Start background reading thread
        t = threading.Thread(target=read_serial_loop, daemon=True)
        t.start()
    except serial.SerialException as e:
        print(f"❌ Failed to connect to Arduino on {SERIAL_PORT}: {e}")

def sync_reservations_to_arduino():
    """ Send RESERVE commands for all currently active reservations """
    time.sleep(2) # Wait for Arduino to boot
    active_reservations = Reservation.objects.filter(statut='active')
    for res in active_reservations:
        place = res.place_id
        if place.id_sensor:
            send_command(f"RESERVE_{place.id_sensor.id}")

def cleanup_expired_reservations():
    """ Mark reservations as expired and free spots if needed """
    now = timezone.now()
    expired = Reservation.objects.filter(statut='active', fin__lt=now)
    if expired.exists():
        with transaction.atomic():
            for res in expired:
                res.statut = 'expiree'
                res.save()
                place = res.place_id
                # If it was still in 'reservee' (user never showed up), free it
                if place.statut == 'reservee':
                    place.statut = 'libre'
                    place.save()
                    if place.id_sensor:
                        send_command(f"FREE_{place.id_sensor.id}")
        print(f"🧹 Cleaned up {expired.count()} expired reservations.")

def read_serial_loop():
    global ser, running
    last_cleanup = 0
    while running and ser and ser.is_open:
        try:
            # Periodic cleanup
            current_time = time.time()
            if current_time - last_cleanup > 30: # Every 30 seconds
                cleanup_expired_reservations()
                last_cleanup = current_time

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
    if line.startswith("S") and ":" in line:
        parts = line.split(":")
        if len(parts) >= 3:
            sensor_name = parts[0]
            status_str = parts[2]
            
            try:
                s_id = int(sensor_name.replace("S", ""))
                is_occupied = (status_str == "OCCUPIED")
                
                with transaction.atomic():
                    sensor, _ = Sensor.objects.get_or_create(id=s_id, defaults={'statut': 'actif'})
                    sensor.valeur = is_occupied
                    sensor.save()
                    
                    try:
                        place = Place.objects.select_for_update().get(id_sensor=sensor)
                        
                        # Logic to determine new status
                        # Check if there's an active reservation
                        has_active_res = Reservation.objects.filter(place_id=place, statut='active').exists()
                        
                        if has_active_res:
                            # If it's reserved, it can be 'reservee' (waiting) or 'occupee' (arrived)
                            new_statut = 'occupee' if is_occupied else 'reservee'
                        else:
                            # No reservation: follow physical sensor
                            new_statut = 'occupee' if is_occupied else 'libre'
                            
                        if place.statut != new_statut:
                            old_statut = place.statut
                            place.statut = new_statut
                            place.save()
                            
                            # Self-healing: if DB was 'reservee' but no active res, and we set to 'libre',
                            # ensure Arduino also knows it's free (light green)
                            if old_statut == 'reservee' and new_statut == 'libre':
                                send_command(f"FREE_{s_id}")
                                
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
