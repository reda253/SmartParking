# Test Scenarios
| Scenario ID | Definition | Input Action | Expected Result | Actual Result |
|---|---|---|---|---|
| TS-01 | Basic Reservation | User clicks on Spot A01, selects "1 hour", submits | Spot changes to orange "Reserved", toast appears. Database writes reservation record. | Pass |
| TS-02 | Physical Overwrite | Admins puts physical object on unreserved Spot A01 | Python reads sensor, spot turns red "Occupied" in frontend. | Pass |
| TS-03 | Conflict Error | User B tries to reserve Spot A01 exactly while A is processing | Django locks row. User B receives 409 Conflict Error. | Pass |
| TS-04 | Enter Gate | User taps "Simulate Entry" | Backend issues 'ENTRY_OPEN' to serial, Arduino servo triggers 90deg rotation. | Pass |
| TS-05 | Auto Calculate | User taps "Checkout" after 45 minutes | Minimum fee threshold engaged, 1 hour cost returned. | Pass |
| TS-06 | Parking Full | Last spot is reserved | System logs alert. Frontend map presents "Parking Full" banner. | Pass |
| TS-07 | Join Queue | User joins queue when parking is full | Backend adds user to `FileAttente`. Success toast appears. | Pass |
| TS-08 | Notification | Spot becomes free (exit/cancel) | Backend triggers `notify_queue`. System logs mock SMS/Email to waitlisted user. | Pass |
| TS-09 | Admin Control | Admin opens entry gate manually | Command `ENTRY_OPEN` sent to serial. Door opens without active reservation. | Pass |
| TS-10 | Sensor Failure | Hardware disconnected | Admin Dashboard shows "DEFAILLANT" and last read timestamp is old. | Pass |
