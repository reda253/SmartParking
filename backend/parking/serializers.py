from rest_framework import serializers
from .models import Utilisateur, Tarif, Sensor, Place, Reservation, Transaction, Alerte

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'nom', 'telephone', 'role']

class TarifSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarif
        fields = '__all__'

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class PlaceSerializer(serializers.ModelSerializer):
    sensor = SensorSerializer(source='id_sensor', read_only=True)
    tarif = TarifSerializer(source='tarif_id', read_only=True)
    
    class Meta:
        model = Place
        fields = ['id', 'numero', 'statut', 'sensor', 'tarif']

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = '__all__'
