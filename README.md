# SmartParking - Group X

Welcome to the **SmartParking** project by Group X!

## Architecture
- **Backend**: Python (Django + Django REST Framework) processing logic, SQL storage, and serial bridging.
- **Hardware**: Arduino controlling ultrasonic sensors and servo motors (barriers) via CP2102/Serial.
- **Frontend**: React + Vite providing modern responsive UX.

## 1. Setup Instructions
- Python >= 3.10
- Node.js >= 18

### Step 1: Database Setup
We use Django's built-in models and seeding instead of manual SQL files for consistency.
1. `cd backend`
2. `python manage.py makemigrations parking`
3. `python manage.py migrate`
4. *(Optional)* We provide seed data generation through:
   `python manage.py shell` -> import local models and run create logic if needed.

### Step 2: Backend Running
1. `pip install -r requirements.txt`
2. `python manage.py runserver 0.0.0.0:8000`

### Step 3: Frontend Running
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Navigate to `http://localhost:5173` to access the application.

## Test Scenarios & Features
You can find our full documentation for API configurations, tests, and scenarios inside the `docs/` folder:
- [API Documentation](docs/API_Documentation.md)
- [Test Scenarios](docs/Test_Scenarios.md)
- [Features Implemented](docs/Features_Implemented.md)
