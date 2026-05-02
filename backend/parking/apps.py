from django.apps import AppConfig
import sys

class ParkingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'parking'

    def ready(self):
        # We start the background thread only if this is NOT a management command (like migrate, runserver's reload loop, etc.)
        # Normally runserver starts two processes (one for hot-reload), we can check 'runserver' in sys.argv
        if 'runserver' in sys.argv:
            try:
                from .serial_comm import init_serial
                init_serial()
            except ImportError:
                pass
