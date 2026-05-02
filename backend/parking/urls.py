from django.urls import path
from . import views

urlpatterns = [
    # Auth (Teammate implementation pending)
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),

    # Spots & Reservations
    path('spots/', views.get_spots, name='get_spots'),
    path('reserve/', views.reserve_spot, name='reserve_spot'),
    path('reservations/', views.get_reservations, name='get_reservations'),
    path('cancel/', views.cancel_reservation, name='cancel_reservation'),
    
    # Gate control
    path('manual_gate/', views.manual_gate, name='manual_gate'),
    path('entry/', views.entry_gate, name='entry_gate'),
    path('exit/', views.exit_gate, name='exit_gate'),

    # Dashboard Stats
    path('stats/', views.get_stats, name='get_stats'),
]
