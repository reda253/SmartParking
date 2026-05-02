# Features Implemented

The full-stack Smart Parking system successfully achieves all the core objectives of managing physical spots virtually, synchronized over a serial protocol with Arduino.

## 1. Physical Hardware Syncing
- Implementation of ultrasonic sensors directly feeding their state (`libre` vs `occupee`) to a Python background daemon.
- Serial instructions sent back to Arduino for opening/closing entry and exit barriers (`ENTRY_OPEN`, `EXIT_OPEN`).

## 2. Dynamic Live Map (React)
- A highly polished dashboard allowing real-time visualization of whether a spot is currently free, occupied, or reserved.
- Auto-polling system in place pulling data efficiently from DB caches.

## 3. Conflict Registration & Logic
- Handled atomic PostgreSQL/MySQL transactions during booking conflicts. Users overlapping their clicks on the same 'free' spot encounter conflict resolution resulting in only one successful reservation.
- Time calculation for elapsed parking fees (`duration = exit_time - reservation.debut`).

## 4. Administrator Dashboard Let
- Live Map view allowing manual assignment/unassignment.
- "Sensors View" allowing raw insights into malfunctioning components from the physical build layer.
- Stats & KPI board aggregating actual usage vs generated revenue.

## Difficulties & Solutions
- **Serial Buffering Lag**: *Problem*: Arduino sent `FREE_1` rapidly without delay, leading to Python skipping messages. *Solution*: We optimized the loop using non-blocking queues and a strict 500ms `delay` with distinct terminators `\n`.
- **Database Threading Integrity**: *Problem*: Polling API views concurrent with serial writes caused locks. *Solution*: Implementing `select_for_update()` under `atomic` transaction context for spot assignment.
