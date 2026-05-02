from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction as db_transaction
from django.db.models import Sum
from datetime import timedelta
import math
import time
from .models import Place, Reservation, Transaction, Utilisateur, Tarif, Alerte
from .serializers import PlaceSerializer, ReservationSerializer
from .serial_comm import send_command

# ----------------- AUTHENTICATION ROUTES (Empty for Teammate) ----------------- #
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    # TODO: Teammate to implement user registration logic
    return Response({"message": "Register endpoint (not implemented)"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    # TODO: Teammate to implement user login logic
    return Response({"message": "Login endpoint (not implemented)"}, status=status.HTTP_501_NOT_IMPLEMENTED)

# ----------------- PARKING SPOTS ----------------- #
@api_view(['GET'])
@permission_classes([AllowAny])
def get_spots(request):
    """ Fetch all spots status (read from db which is updated by serial thread) """
    places = Place.objects.all()
    serializer = PlaceSerializer(places, many=True)
    return Response(serializer.data)

# ----------------- RESERVATION & TRANSACTIONS ----------------- #
@api_view(['POST'])
@permission_classes([AllowAny])
def reserve_spot(request):
    """ Logic to reserve a spot """
    place_id = request.data.get('place_id')
    utilisateur_id = request.data.get('utilisateur_id')
    hours = int(request.data.get('hours', 1))

    if not place_id or not utilisateur_id:
        return Response({"error": "place_id and utilisateur_id are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with db_transaction.atomic():
            place = Place.objects.select_for_update().get(id=place_id)
            if place.statut != 'libre':
                return Response({"error": f"Place is currently {place.statut}"}, status=status.HTTP_409_CONFLICT)
            
            user, _ = Utilisateur.objects.get_or_create(id=utilisateur_id, defaults={'username': f'tempuser_{utilisateur_id}'})
            
            # Create Reservation
            debut = timezone.now()
            fin = debut + timedelta(hours=hours)
            
            reservation = Reservation.objects.create(
                utilisateur_id=user,
                place_id=place,
                tarif_id=place.tarif_id,
                debut=debut,
                fin=fin,
                statut='active',
                montant=0  # Finalized on exit
            )
            
            place.statut = 'reservee'
            place.save()
            
            if place.id_sensor:
                send_command(f"RESERVE_{place.id_sensor.id}")
                
            if Place.objects.filter(statut='libre').count() == 0:
                Alerte.objects.create(
                    type='parking_plein',
                    entite_id=1,
                    entite_type='barriere',
                    message='Le parking est complet suite à une réservation.'
                )
            
            return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)
            
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_reservations(request):
    user_id = request.query_params.get('utilisateur_id')
    if user_id:
        reservations = Reservation.objects.filter(utilisateur_id=user_id)
    else:
        reservations = Reservation.objects.all()
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def cancel_reservation(request):
    """ Cancel active reservation before entry """
    utilisateur_id = request.data.get('utilisateur_id')
    if not utilisateur_id:
        return Response({"error": "utilisateur_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        with db_transaction.atomic():
            reservation = Reservation.objects.select_for_update().filter(utilisateur_id=utilisateur_id, statut='active').first()
            if not reservation:
                return Response({"error": "No active reservation found"}, status=status.HTTP_404_NOT_FOUND)
                
            reservation.statut = 'annulee'
            reservation.save()
            
            place = reservation.place_id
            place.statut = 'libre'
            place.save()
            
            if place.id_sensor:
                send_command(f"FREE_{place.id_sensor.id}")
                
            return Response({"message": "Reservation cancelled successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ----------------- BARRIER CONTROLS (Arduino Communication) ----------------- #
@api_view(['POST'])
@permission_classes([AllowAny])
def entry_gate(request):
    """ Open entry barrier if user has a reservation """
    utilisateur_id = request.data.get('utilisateur_id')
    if not utilisateur_id:
        return Response({"error": "utilisateur_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
    reservation = Reservation.objects.filter(utilisateur_id=utilisateur_id, statut='active').first()
    if not reservation:
        return Response({"error": "No active reservation found for this user"}, status=status.HTTP_404_NOT_FOUND)

    # Let Arduino Open the Entry Gate
    success = send_command("ENTRY_OPEN")
    if success:
        # Update debut time to actual entry time
        reservation.debut = timezone.now()
        reservation.save()
        
        if Place.objects.filter(statut='libre').count() == 0:
            Alerte.objects.create(
                type='parking_plein',
                entite_id=1,
                entite_type='barriere',
                message='Capacité maximale atteinte (entrée barrière).'
            )
            
        time.sleep(3)
        send_command("ENTRY_CLOSE")
        return Response({"message": "Entry Gate Opened", "status": "200_barrier_opened"}, status=status.HTTP_200_OK)
        
    return Response({"error": "Failed to communicate with Arduino"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def exit_gate(request):
    """ Process exit: calculate fee, check out, open exit barrier """
    utilisateur_id = request.data.get('utilisateur_id')
    if not utilisateur_id:
        return Response({"error": "utilisateur_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        with db_transaction.atomic():
            reservation = Reservation.objects.select_for_update().filter(utilisateur_id=utilisateur_id, statut='active').first()
            if not reservation:
                return Response({"error": "No active reservation found for this user"}, status=status.HTTP_404_NOT_FOUND)

            # Calculate actual time spent
            exit_time = timezone.now()
            duration = exit_time - reservation.debut
            hours_spent = math.ceil(duration.total_seconds() / 3600.0)
            
            if hours_spent < 1:
                hours_spent = 1 # Minimum 1 hour charge
                
            fee = hours_spent * reservation.tarif_id.prix_heure
            
            # Generate Transaction
            Transaction.objects.create(
                reservation_id=reservation,
                montant=fee,
                statut_paiement='paye'
            )
            
            # Close reservation
            reservation.statut = 'expiree'
            reservation.montant = fee
            reservation.fin = exit_time
            reservation.save()
            
            # Free the spot (if the Arduino ultrasonic sensor reads it as empty, the threading script will ensure it goes to 'libre')
            # But we set it manually just in case
            place = reservation.place_id
            place.statut = 'libre'
            place.save()
            
            if place.id_sensor:
                send_command(f"FREE_{place.id_sensor.id}")
            
            success = send_command("EXIT_OPEN")
            if success:
                time.sleep(3)
                send_command("EXIT_CLOSE")
                return Response({"message": "Exit Gate Opened", "fee_amount": fee}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Saved transaction but Arduino failed to open barrier", "fee_amount": fee}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def manual_gate(request):
    """ Manual override for admins to control doors via frontend """
    command = request.data.get('command')
    if command in ["ENTRY_OPEN", "ENTRY_CLOSE", "EXIT_OPEN", "EXIT_CLOSE"]:
        success = send_command(command)
        if success:
            return Response({"message": f"Command {command} sent"}, status=status.HTTP_200_OK)
    return Response({"error": "Bad command or Arduino offline"}, status=status.HTTP_400_BAD_REQUEST)

# ----------------- DASHBOARD / ADMIN ----------------- #
@api_view(['GET'])
@permission_classes([AllowAny])
def get_stats(request):
    """ Return revenue & occupations """
    total_revenue = Transaction.objects.filter(statut_paiement='paye').aggregate(Sum('montant'))['montant__sum'] or 0
    occupied_count = Place.objects.filter(statut__in=['occupee', 'reservee']).count()
    free_count = Place.objects.filter(statut='libre').count()
    
    return Response({
        "revenue": float(total_revenue), 
        "occupations": occupied_count,
        "free_places": free_count
    }, status=status.HTTP_200_OK)

