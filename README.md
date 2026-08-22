# SwachhLens 🌍 📸

**An AI-powered, scalable mobile solution for crowdsourced waste management and evidence-based cleanup action.**

Built for **THE TECHNOVA CHALLENGE**, SwachhLens empowers citizens to report unwanted, overflowed, or misplaced waste using just their smartphones, while providing municipal authorities with an intelligent dashboard to prioritize and dispatch cleanup teams efficiently.

---

## 🚀 The Solution

SwachhLens requires **no dedicated hardware investments** (like expensive IoT smart bins). Instead, it relies on the devices citizens already own and a powerful cloud infrastructure, directly addressing the core requirements of the Technova Challenge:

### 📍 1. Where are waste hotspots forming?
*   **Geospatial Aggregation:** Our backend groups complaints within ~100m grids using latitude and longitude to pinpoint exact hotspots.
*   **Analytics Dashboard:** Tracks performance and waste density at the granular Ward level.

### 🗑️ 2. What type of waste is present?
*   **AI Vision Classification:** Uses Google Gemini (with Groq API as a fallback) to analyze citizen-submitted photos and instantly classify waste into exactly 8 categories: `overflowing_bin`, `garbage_dump`, `plastic_waste`, `construction_debris`, `organic_waste`, `e_waste`, `hazardous_waste`, or `drain_blockage`.

### ⚖️ 3. How much waste volume needs to be cleared?
*   **Contextual Volume Estimation:** The AI doesn't just guess; it compares the waste region to visible scale references in the photo (like vehicles, curbs, or people) to accurately categorize the issue as `small`, `medium`, `large`, or `very_large`. It even provides explicit "Reasoning" text for full transparency.

### 🚚 4. Which cleanup team should be dispatched?
*   **Operational Recommendations:** Our `recommendation_service` translates AI classifications into actionable insights (e.g., "Dispatch a 10-wheeler truck with hazmat protocols").
*   **Admin Assignment:** Commissioners can manually review and assign specific teams to open tickets.

### 🔄 5. Is this a duplicate complaint?
*   **AI Deduplication:** A smart algorithm compares GPS proximity, waste category, and time threshold. Duplicate reports are flagged automatically, preventing authorities from dispatching two trucks to the same location.

### 🚨 6. Which complaints need urgent escalation?
*   **Dynamic Priority Scoring (0-100):** If a complaint is hazardous (like medical waste), massive in volume, or reported repeatedly by many citizens (triggering a crowd-sourcing multiplier), its priority score spikes dynamically.

### 📊 7. How should limited resources be prioritized?
*   **Triage First:** The Inspector Dashboard defaults to sorting by Priority Score, guaranteeing that the most urgent and dangerous hotspots are addressed before minor aesthetic issues.

---

## 🔒 Data Ethics & Privacy
*   **Jurisdiction Scoping:** A strict security model ensures that an inspector in Patna cannot view complaints from Kashmir. Access is gated meticulously by State > District > City > Ward. 
*   **Secure API Handling:** All API keys (Gemini, Groq, LocationIQ) are stored exclusively in the backend `.env` file, fully protected from the client side.

---

## 🛠️ Tech Stack
*   **Mobile App (Citizen UI):** React Native (Expo) - Captures photos, precise GPS coordinates, and timestamps.
*   **Web Dashboard (Inspector/Admin UI):** React (Vite) - Features advanced sorting, priority filtering, and Admin approval flows.
*   **Backend API:** Python (FastAPI) - Highly scalable REST architecture.
*   **Database:** MongoDB - Flexible NoSQL storage for complex JSON payloads.
*   **AI Engine:** Google Gemini 2.5 Flash Vision (Primary) & Groq Llama 3.2 Vision (Fallback).

---

## ⚙️ Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv (source venv/bin/activate on Mac/Linux, or venv\Scripts\activate on Windows)
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY="your_gemini_key"
GROQ_API_KEY="your_groq_key"
LOCATIONIQ_API_KEY="your_locationiq_key"
```
Run the server:
```bash
uvicorn main:app --reload
```

### 2. Dashboard Setup
```bash
cd dashboard
npm install
npm run dev
```

### 3. Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```
