# SwachhLens Dashboard

The SwachhLens Dashboard is the central command center for municipal waste management. It provides a real-time, AI-powered overview of waste complaints, priority triage, and sanitation squad dispatch monitoring.

## Features

- **Live System Feed**: Real-time updates as new complaints are submitted and classified by AI.
- **KPI Summary**: Quick metrics on total reports, pending, in-progress, resolved, and urgent complaints.
- **Live Geolocation Map**: Visual map displaying waste complaints categorized by priority and status.
- **Urgent Priority Queue**: A dedicated queue for high-priority complaints that require immediate action (e.g., hazardous waste or severe blockage).
- **Sanitation Analytics**: Insights into complaint trends over 30 days, category breakdown, and status distribution.
- **Complaint Management**: View detailed complaint information, modify statuses, and assign teams to resolve issues.

## Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The dashboard will be available at `http://localhost:5173`. Make sure the backend server is running on `http://localhost:8000` for data to load properly.
