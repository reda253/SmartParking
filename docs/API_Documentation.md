# SmartParking API Documentation

## Auth
| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/api/auth/register/` | POST | Register a new user | `{ "email": "...", "password": "...", "name": "...", "role": "user" }` |
| `/api/auth/login/` | POST | Authenticate a user | `{ "email": "...", "password": "..." }` |

## Parking Spots & Sensors
| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/api/spots/` | GET | Retrieve all parking spots & their live status | None |
| `/api/sensors/` | GET | Retrieve all sensor states for admin dashboard | None |

## reservations
| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/api/reserve/` | POST | Reserve a parking spot for a given amount of hours | `{ "place_id": 1, "utilisateur_id": 1, "hours": 2 }` |
| `/api/reservations/` | GET | Retrieve reservation history | None (Optional `?utilisateur_id=` query string) |
| `/api/cancel/` | POST | Cancel an active reservation | `{ "utilisateur_id": 1 }` |
| `/api/join_queue/` | POST | Join the waiting list when parking is full | `{ "utilisateur_id": 1 }` |

## Gate Control
| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/api/entry/` | POST | Simulate car entering the parking (starts actual reservation session) | `{ "utilisateur_id": 1 }` |
| `/api/exit/` | POST | Simulate car exiting the parking, generates a transaction | `{ "utilisateur_id": 1 }` |
| `/api/manual_gate/` | POST | Admin endpoint to manually open/close gates | `{ "command": "ENTRY_OPEN" }` |

## Stats
| Endpoint | Method | Description | Payload Format |
|---|---|---|---|
| `/api/stats/` | GET | Retrieve KPI metrics (revenue, free vs occupied spots count) | None |
