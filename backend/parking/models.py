from django.db import models
from django.contrib.auth.models import AbstractUser

class Utilisateur(AbstractUser):
    # Extending Django's user
    ROLES = [
        ('user', 'User'),
        ('admin', 'Admin')
    ]
    telephone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLES, default='user')
    # nom, email, password, etc. are already in AbstractUser

class Tarif(models.Model):
    TYPES = [
        ('standard', 'Standard'),
        ('handicap', 'Handicap'),
        ('VIP', 'VIP')
    ]
    type_place = models.CharField(max_length=20, choices=TYPES, default='standard')
    prix_heure = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

class Sensor(models.Model):
    STATUTS = [
        ('actif', 'Actif'),
        ('defaillant', 'Defaillant')
    ]
    statut = models.CharField(max_length=20, choices=STATUTS, default='actif')
    derniere_lecture = models.DateTimeField(auto_now=True)
    valeur = models.BooleanField(default=False) # True if occupied

class Place(models.Model):
    STATUTS = [
        ('libre', 'Libre'),
        ('occupee', 'Occupee'),
        ('reservee', 'Reservee')
    ]
    numero = models.IntegerField(unique=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='libre')
    id_sensor = models.OneToOneField(Sensor, on_delete=models.SET_NULL, null=True, blank=True)
    tarif_id = models.ForeignKey(Tarif, on_delete=models.CASCADE)

class Reservation(models.Model):
    STATUTS = [
        ('active', 'Active'),
        ('expiree', 'Expiree'),
        ('annulee', 'Annulee')
    ]
    utilisateur_id = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    place_id = models.ForeignKey(Place, on_delete=models.CASCADE)
    tarif_id = models.ForeignKey(Tarif, on_delete=models.CASCADE)
    barriere_id = models.IntegerField(default=1) # Virtual identifier for barrier
    debut = models.DateTimeField()
    fin = models.DateTimeField()
    statut = models.CharField(max_length=20, choices=STATUTS, default='active')
    montant = models.DecimalField(max_digits=10, decimal_places=2)

class Transaction(models.Model):
    STATUTS = [
        ('paye', 'Paye'),
        ('en_attente', 'En Attente')
    ]
    reservation_id = models.OneToOneField(Reservation, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateTimeField(auto_now_add=True)
    statut_paiement = models.CharField(max_length=20, choices=STATUTS, default='en_attente')

class Alerte(models.Model):
    TYPES = [
        ('parking_plein', 'Parking Plein'),
        ('sensor_defaillant', 'Sensor Defaillant')
    ]
    ENTITES = [
        ('barriere', 'Barriere'),
        ('sensor', 'Sensor')
    ]
    type = models.CharField(max_length=30, choices=TYPES)
    entite_id = models.IntegerField()
    entite_type = models.CharField(max_length=20, choices=ENTITES)
    message = models.CharField(max_length=255)
    date_alerte = models.DateTimeField(auto_now_add=True)
    vue = models.BooleanField(default=False)
