# Database Design & ERD

## 1. Entity Relationship Diagram (ERD)
The system uses a relational schema designed to maintain integrity across users, spots, and financial transactions.

```mermaid
erDiagram
    UTILISATEUR ||--o{ RESERVATION : makes
    PLACE ||--o{ RESERVATION : allocated_to
    SENSOR ||--|| PLACE : monitors
    TARIF ||--o{ PLACE : applies_to
    TARIF ||--o{ RESERVATION : defaults_to
    RESERVATION ||--|| TRANSACTION : generates
    UTILISATEUR ||--o{ FILE_ATTENTE : joins

    UTILISATEUR {
        int id
        string email
        string password
        string role
        string telephone
    }
    FILE_ATTENTE {
        int id
        int utilisateur_id
        datetime date_demande
        string statut
    }
    PLACE {
        int id
        int numero
        string statut
        int sensor_id
        int tarif_id
    }
    SENSOR {
        int id
        string statut
        bool valeur
        datetime derniere_lecture
    }
    RESERVATION {
        int id
        datetime debut
        datetime fin
        string statut
        decimal montant
    }
    TRANSACTION {
        int id
        int reservation_id
        decimal montant
        datetime date_paiement
    }
```

## 2. SQL Schema
While Django handles the schema via `manage.py migrate`, the underlying SQL logic is equivalent to:

```sql
CREATE TABLE parking_sensor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    statut VARCHAR(20),
    valeur BOOLEAN,
    derniere_lecture DATETIME
);

CREATE TABLE parking_place (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER UNIQUE,
    statut VARCHAR(20),
    id_sensor_id INTEGER UNIQUE REFERENCES parking_sensor(id),
    tarif_id_id INTEGER REFERENCES parking_tarif(id)
);

-- (Simplified representation)
```

## 3. Data Seeding
We use the `seed_db.py` script to populate the initial environment:
- **Tarifs**: Standard (10.0 MAD/h).
- **Sensors**: 4 Active sensors.
- **Places**: 4 Linked spots (A101 - A104).
