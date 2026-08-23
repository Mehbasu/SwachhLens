# SwachhLens 🌍 📸

**An AI-powered, scalable civic waste management platform — mobile reporting for citizens, intelligent triage dashboard for authorities.**

Built for **THE TECHNOVA CHALLENGE**. SwachhLens empowers citizens to report waste using just their smartphones, while giving municipal officers and commissioners a real-time command dashboard to prioritize complaints, dispatch teams, and track resolution.

---

## 🚀 Live Demo

- **Admin Dashboard (Firebase Hosting):** [https://swachhlens-8ba8b.web.app](https://swachhlens-8ba8b.web.app)
- **Backend API (Render):** [https://swachhlens-jnu9.onrender.com](https://swachhlens-jnu9.onrender.com)
- **Mobile App:** Run locally using Expo Go (see below).

---

## 🚀 Core Features

### For Citizens (Mobile App)
- 📷 **Photo-based complaint filing** — point, shoot, submit.
- 📍 **Auto GPS tagging** — precise location captured on submission.
- 🔁 **AI Deduplication** — prevents flooding the system with the same hotspot.

### For Inspectors (Web Dashboard)
- 🗺️ **Live Map** — automatically centers on the officer's assigned jurisdiction on login.
- 🔔 **Real-time Notifications** — bell icon polls the backend for new complaints; red dot appears for unseen, clears on open.
- 🏷️ **Priority Triage** — complaints sorted by a 0-100 AI priority score (volume × category × crowd multiplier).
- 🔍 **Filter & Search** — filter by category, status, priority range; search by address or ID.
- 🎨 **Theme System** — Light / Dark / System theme with full UI adaptation.

### For Commissioners (Admin Panel)
- 👮 **Jurisdiction Assignment** — assign State → District → City to pending officers.
- ✅ **One-click Assign** — cascading dropdowns prevent invalid selections.

---

## 🤖 AI Pipeline

| Step | Technology | What it does |
|------|-----------|-------------|
| Vision Classification | Google Gemini 2.5 Flash (+ Groq Llama 3.2 fallback) | Classifies waste type from photo |
| Volume Estimation | Gemini | Compares waste to scene scale references |
| Priority Scoring | Custom formula | Urgency = f(category, volume, duplicates) |
| Action Recommendation | Rule-based | "Dispatch 10-wheeler with hazmat protocol" |
| Deduplication | GPS + category + time threshold | Flags near-duplicate reports |
| Reverse Geocoding | LocationIQ API | Resolves GPS → State/District/City |

---

## 🔒 Security & Privacy

- **Jurisdiction Scoping** — inspectors can only view complaints in their assigned area.
- **Firebase Auth** — Google OAuth + JWT; tokens never stored beyond session.
- **Server-side Geocoding** — client-supplied location is discarded; GPS coordinates are always resolved server-side.
- **Secrets** — all API keys (Gemini, Groq, LocationIQ, Firebase Admin SDK, Postgres) live exclusively as environment variables on production servers.

---

## 🛠️ Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Mobile App | React Native (Expo) | Local/APK |
| Web Dashboard | React + Vite + Tailwind CSS v4 | Firebase Hosting |
| Backend API | Python (FastAPI) | Render |
| Database | PostgreSQL | Render |
| AI Engine | Google Gemini 2.5 Flash Vision + Groq fallback | - |
| Auth | Firebase Authentication | Firebase |
| Maps | Leaflet + OpenStreetMap (Nominatim geocoding) | - |

---

## ⚙️ Getting Started (Local Development)

### Prerequisites
- Node.js ≥ 18, Python ≥ 3.10, Git

### 1. Clone
```bash
git clone https://github.com/Mehbasu/SwachhLens.git
cd SwachhLens
```

### 2. Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GEMINI_API_KEY="your_gemini_key"
GROQ_API_KEY="your_groq_key"
LOCATIONIQ_API_KEY="your_locationiq_key"
PG_URI="postgresql://localhost:5432/SwachhLens"
```

Place your Firebase Admin SDK JSON at `backend/firebase-adminsdk.json` (**never commit this file**).

Run:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Dashboard
```bash
cd dashboard
npm install
```

Create `dashboard/.env`:
```env
VITE_API_BASE_URL=http://localhost:8001
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

Run:
```bash
npm run dev
```

### 4. Mobile App
```bash
cd mobile-app
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## 📁 Project Structure

```text
SwachhLens/
├── backend/               # FastAPI server
│   ├── routes/            # auth.py, complaints.py
│   ├── services/          # AI, priority, dedup, upload
│   ├── models/            # Pydantic schemas
│   └── db/                # PostgreSQL layer
├── dashboard/             # React/Vite web dashboard
│   └── src/
│       ├── components/    # Navbar, MapView, ComplaintTable…
│       ├── hooks/         # useNotifications (real-time polling)
│       ├── pages/         # DashboardHome, LoginPage, AdminPanel…
│       └── services/      # api.js (Axios client)
└── mobile-app/            # Expo React Native citizen app
    └── src/screens/       # Login, Signup, Home, Report
```

---

## 🤝 Contributing

PRs welcome. Please open an issue first to discuss significant changes.
