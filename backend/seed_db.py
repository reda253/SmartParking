import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from parking.models import Place, Sensor, Tarif

def seed_data():
    # 1. Create a default Tarif
    tarif, _ = Tarif.objects.get_or_create(
        type_place='standard',
        defaults={'prix_heure': 10.0, 'description': 'Tarif Standard'}
    )
    print(f"Created/Found Tarif: {tarif.type_place}")

    # 2. Create 4 Places linked to 4 Sensors
    for i in range(1, 5):
        # Ensure sensor exists
        sensor, _ = Sensor.objects.get_or_create(id=i, defaults={'statut': 'actif'})
        
        # Create Place
        place, created = Place.objects.get_or_create(
            numero=100 + i,
            defaults={'id_sensor': sensor, 'tarif_id': tarif, 'statut': 'libre'}
        )
        if created:
            print(f"Created Place {place.numero} linked to Sensor {sensor.id}")
        else:
            print(f"Place {place.numero} already exists.")

if __name__ == "__main__":
    seed_data()
