from rest_framework import serializers
from .models import Utilisateur, Tarif, Sensor, Place, Reservation, Transaction, Alerte

class UtilisateurSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'name', 'first_name', 'last_name', 'telephone', 'role', 'date_joined']

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.username

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
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='utilisateur_id.email', read_only=True)
    place_numero = serializers.IntegerField(source='place_id.numero', read_only=True)
    prix_heure = serializers.DecimalField(source='tarif_id.prix_heure', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Reservation
        fields = '__all__'

    def get_user_name(self, obj):
        u = obj.utilisateur_id
        full = f"{u.first_name} {u.last_name}".strip()
        return full or u.username

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'

class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = '__all__'
