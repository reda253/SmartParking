# Smart Parking System

> An IoT-based intelligent parking management system built with Arduino, Flask, React.js, and MySQL.  
> School project — Arduino & Embedded Systems module.

---

##  Project Overview

The **Smart Parking System** automates the detection, reservation, and management of parking spots in real time. Ultrasonic sensors mounted at each spot continuously detect vehicle presence and report to a central server. Users can reserve spots online through a web dashboard, and servo-controlled barriers manage entry and exit — all decisions made server-side, never by the Arduino alone.

### Key Features

- **Real-time spot detection** via HC-SR04 ultrasonic sensors
- **Interactive web dashboard** showing live spot status (free / occupied / reserved)
- **Online reservation system** with conflict detection and time-based billing
- **Servo-controlled barriers** for entry and exit, triggered by Flask
- **Admin panel** with occupancy stats and daily revenue
- **Alert system** when the parking is full
- **MySQL database** for reservations, users, transactions, and audit logs

### System Architecture

```
[HC-SR04 Sensors] ──► [Arduino UNO] ──► USB Serial ──► [Flask Backend]
                       [Servo Motors] ◄──                      │
                       [LEDs per spot]                         ▼
                                                         [MySQL Database]
                                                               │
                                                               ▼
                                                     [React.js Dashboard]
```

| Layer       | Technology               |
|-------------|--------------------------|
| Hardware    | Arduino UNO, HC-SR04, Servo motors, LEDs |
| Serial comm | USB Serial (9600 baud)   |
| Backend     | Python 3, Flask, PyMySQL |
| Database    | MySQL                    |
| Frontend    | React.js (Vite)          |

---

## 🗂️ Repository Structure

```
SmartParking/
├── arduino/
├── backend/
│   ├── test_serial.py          # test serial arduino with flask
│   ├── requirements.txt        # Python dependencies
├── frontend/
│  
├── sql/ # Database schema & seed data
│            
├── .gitignore
└── README.md
```

---

## 🌿 Branch Strategy

We follow a structured branching model. **Never push directly to `main`.**

| Branch       | Owner        | Purpose |
|--------------|--------------|---------|
| `main`       | All (merge)  | Stable, production-ready code only. Updated at end of each sprint via PR from `dev`. |
| `dev`        | All          | Integration branch. All feature branches merge here first. Default working branch. |
| `hardware`   | Member 1     | Arduino `.ino` code, wiring tests, sensor calibration. |
| `backend`    | Members 1–3  | Flask API, serial reader, DB helpers, business logic. |
| `frontend`   | Members 4–5  | React dashboard, reservation UI, admin panel. |

### Workflow

```bash
# Always start from dev
git checkout "your working branch"
git pull origin "your working branch"

# if you want to add a feature, Create your feature branch
git checkout -b feature/your-feature-name

# Work, commit, push
git add .
git commit -m "feat: describe what you did"
git push -u origin feature/your-feature-name

# Open a Pull Request on GitHub: feature → dev
```



---

## ⚙️ How to Run

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+
- Arduino IDE
- Arduino UNO connected via USB

---

### 1. Clone the repository

```bash
git clone https://github.com/reda253/SmartParking.git
cd SmartParking
```


### 2. Backend (Flask)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt



Start the Flask server:

```bash
python app.py
```

> Flask runs on `http://localhost:5000` by default.

---

### 4. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> React runs on `http://localhost:5173` by default.

---

### 5. Arduino

1. Open `arduino/smart_parking.ino` in the **Arduino IDE**
2. Connect your Arduino UNO via USB
3. Select the correct **Board** and **Port** under `Tools`
4. Upload the sketch
5. Open **Serial Monitor** at 9600 baud to verify JSON output:

```json
{"spot1":0,"spot2":1,"spot3":0}
```

---

### 6. Verify serial connection (Python test)

```bash
cd backend
python test_serial.py
```

Expected output:
```
Connected to COM3
Received: {"spot1":0,"spot2":1,"spot3":0}
```



## 📄 License

This project was developed as part of a school assignment. All rights reserved by the project team.
