from django.urls import path
from . import views

urlpatterns = [
    # Auth (Teammate implementation pending)
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),

    # Spots & Reservations
    path('spots/', views.get_spots, name='get_spots'),
    path('sensors/', views.get_sensors, name='get_sensors'),
    path('reserve/', views.reserve_spot, name='reserve_spot'),
    path('join_queue/', views.join_queue, name='join_queue'),
    path('reservations/', views.get_reservations, name='get_reservations'),
    path('cancel/', views.cancel_reservation, name='cancel_reservation'),
    
    # Gate control
    path('manual_gate/', views.manual_gate, name='manual_gate'),
    path('entry/', views.entry_gate, name='entry_gate'),
    path('exit/', views.exit_gate, name='exit_gate'),

    # Dashboard Stats
    path('stats/', views.get_stats, name='get_stats'),

    # Admin dashboard
    path('users/', views.list_users, name='list_users'),
    path('admin/force_status/', views.admin_force_place_status, name='admin_force_place_status'),
    path('admin/clear_reservation/', views.admin_clear_place_reservation, name='admin_clear_place_reservation'),
    path('admin/toggle_sensor/', views.admin_toggle_sensor, name='admin_toggle_sensor'),
]
