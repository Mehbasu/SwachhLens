# SwachhLens Backend API

The backend REST API for **SwachhLens**, an AI-powered civic waste management complaint and municipal response system. Built with Python, FastAPI, MongoDB, and Pydantic.

---

## Features

- **Automated AI Vision Classification (Stubbed)**: Analyzes uploaded waste images to detect category, volume, and confidence scores.
- **Geospatial Duplicate Detection**: Uses Haversine formula to identify open complaints within **100m** and **24 hours** with matching categories.
- **Smart Priority Scoring (0–100)**: Dynamically calculates complaint urgency based on waste volume, category hazard level, proximity to sensitive zones (hospitals/schools), and duplicate report frequency.
- **Operational Rules Engine**: Generates targeted action recommendations for municipal crews.
- **Hotspot Heatmap Aggregation**: Groups complaints into ~100m grid clusters with average priority scores.
- **Analytics & Reporting**: Summarizes total complaints, status breakdowns, category distributions, and high-priority urgent cases.

---

## Tech Stack

- **Framework**: Python 3.12+ with FastAPI
- **Database**: MongoDB (via PyMongo / Motor) with automatic local persistent fallback
- **Validation**: Pydantic v2
- **Storage**: Multipart file upload handling to local `/uploads` directory (ready for Cloudinary / AWS S3 integration)

---

## Directory Structure

```
backend/
├── main.py                          # FastAPI application entry point
├── routes/
│   └── complaints.py                # Endpoints for complaints & analytics
├── services/
│   ├── ai_service.py                # Waste classification AI vision stub
│   ├── duplicate_service.py         # Haversine & timestamp duplicate detection
│   ├── priority_service.py          # Priority scoring engine (0-100)
│   ├── recommendation_service.py    # Operational recommendation rules
│   └── upload_service.py            # Local image file upload handler
├── models/
│   └── complaint.py                 # Pydantic schemas (Complaint, StatusUpdate, Hotspot, Analytics)
├── db/
│   └── database.py                  # MongoDB database manager with local fallback
├── uploads/                         # Stored image files directory
├── seed_data.py                     # Initial database seeding script (18 complaints)
├── test_backend.py                  # Test suite verifying all endpoints
├── .env.example                     # Environment configuration template
├── requirements.txt                 # Python dependencies
└── README.md                        # Setup instructions & API documentation
```

---

## Setup & Running Locally

### 1. Environment Setup

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env` contents:
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=swachhlens_db
PORT=8000
HOST=0.0.0.0
BASE_URL=http://localhost:8000
```

### 4. Seed Mock Data

Populate the database with 18 realistic Patna-based waste complaints:

```bash
python seed_data.py
```

### 5. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## API Endpoints & Curl Examples

### 1. Health Check
`GET /health`

```bash
curl -X GET "http://localhost:8000/health"
```

**Response (`200 OK`)**:
```json
{
  "status": "ok"
}
```

---

### 2. Submit a Complaint
`POST /complaints`

Accepts multipart form data with image file and location metadata.

```bash
curl -X POST "http://localhost:8000/complaints" \
  -F "image=@sample_waste.jpg" \
  -F "lat=25.6260" \
  -F "lng=85.1120" \
  -F "comment=Medical syringes dumped near hospital lane" \
  -F "address=Kurji Holy Family Hospital Lane, Patna" \
  -F "category=hazardous_waste" \
  -F "volume=small"
```

**Response (`201 Created`)**:
```json
{
  "id": "COMP-2026-019",
  "image_url": "http://localhost:8000/uploads/complaint_a1b2c3d4e5f6.jpg",
  "category": "hazardous_waste",
  "volume": "small",
  "priority_score": 95.0,
  "status": "submitted",
  "gps": { "lat": 25.626, "lng": 85.112 },
  "address": "Kurji Holy Family Hospital Lane, Patna",
  "timestamp": "2026-08-15T10:00:00Z",
  "comment": "Medical syringes dumped near hospital lane",
  "reporter_comment": "Medical syringes dumped near hospital lane",
  "recommended_action": "URGENT: Hazardous Bio-Medical Waste Hazmat Team Dispatch",
  "is_duplicate": false,
  "duplicate_of": null,
  "assigned_team": null,
  "ai_confidence": 94.5
}
```

---

### 3. List Complaints
`GET /complaints`

Supports filtering by `status`, `category`, `min_priority`, and sorting by `priority` or `date`.

```bash
# List all complaints sorted by priority descending
curl -X GET "http://localhost:8000/complaints?sort_by=priority&sort_order=desc"

# Filter by category and status
curl -X GET "http://localhost:8000/complaints?category=overflowing_bin&status=submitted"
```

**Response (`200 OK`)**:
```json
[
  {
    "id": "COMP-2026-001",
    "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
    "category": "overflowing_bin",
    "volume": "large",
    "priority_score": 92.0,
    "status": "submitted",
    "gps": { "lat": 25.6093, "lng": 85.1235 },
    "address": "Boring Road Crossing, near Axis Bank, Patna",
    "timestamp": "2026-08-13T09:15:00Z",
    "comment": "Commercial street bin overflowing onto pedestrian path.",
    "reporter_comment": "Commercial street bin overflowing onto pedestrian path.",
    "recommended_action": "Dispatch Heavy Compactor Truck + 3 Sanitation Workers",
    "is_duplicate": false,
    "duplicate_of": null,
    "assigned_team": "Patna West Ward 14 Sanitation Unit",
    "ai_confidence": 96.0
  }
]
```

---

### 4. Get Complaint Details
`GET /complaints/{id}`

```bash
curl -X GET "http://localhost:8000/complaints/COMP-2026-001"
```

**Response (`200 OK`)**:
```json
{
  "id": "COMP-2026-001",
  "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
  "category": "overflowing_bin",
  "volume": "large",
  "priority_score": 92.0,
  "status": "submitted",
  "gps": { "lat": 25.6093, "lng": 85.1235 },
  "address": "Boring Road Crossing, near Axis Bank, Patna",
  "timestamp": "2026-08-13T09:15:00Z",
  "comment": "Commercial street bin overflowing onto pedestrian path.",
  "reporter_comment": "Commercial street bin overflowing onto pedestrian path.",
  "recommended_action": "Dispatch Heavy Compactor Truck + 3 Sanitation Workers",
  "is_duplicate": false,
  "duplicate_of": null,
  "assigned_team": "Patna West Ward 14 Sanitation Unit",
  "ai_confidence": 96.0
}
```

---

### 5. Update Complaint Status & Assigned Team
`PATCH /complaints/{id}/status`

```bash
curl -X PATCH "http://localhost:8000/complaints/COMP-2026-001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "assigned_team": "Patna Rapid Response Unit 1"
  }'
```

**Response (`200 OK`)**:
```json
{
  "id": "COMP-2026-001",
  "status": "in_progress",
  "assigned_team": "Patna Rapid Response Unit 1",
  "...": "all other fields preserved"
}
```

---

### 6. Get Hotspot Aggregations
`GET /complaints/hotspots`

Groups complaints into ~100m clusters for GIS/Heatmap visualization.

```bash
curl -X GET "http://localhost:8000/complaints/hotspots"
```

**Response (`200 OK`)**:
```json
[
  {
    "lat": 25.609,
    "lng": 85.124,
    "count": 2,
    "avg_priority": 90.5
  },
  {
    "lat": 25.611,
    "lng": 85.144,
    "count": 1,
    "avg_priority": 96.0
  }
]
```

---

### 7. Get Analytics Summary
`GET /analytics/summary`

```bash
curl -X GET "http://localhost:8000/analytics/summary"
```

**Response (`200 OK`)**:
```json
{
  "total": 18,
  "by_status": {
    "submitted": 10,
    "in_progress": 4,
    "resolved": 4
  },
  "by_category": {
    "overflowing_bin": 4,
    "garbage_dump": 3,
    "drain_blockage": 3,
    "construction_debris": 2,
    "plastic_waste": 2,
    "organic_waste": 2,
    "hazardous_waste": 1,
    "e_waste": 1
  },
  "urgent_count": 6
}
```

---

## Testing

Run the automated test suite:

```bash
python test_backend.py
```
