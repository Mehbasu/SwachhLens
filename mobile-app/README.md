# SwachhLens Citizen Mobile Application (Expo / React Native)

SwachhLens Citizen Mobile App is an approachable, civic-tech mobile application built for municipal citizens of Patna to instantly report waste issues, overflowing bins, plastic accumulation, and drain blockages directly to city sanitation authorities with AI vision geotagging.

---

## Features

- **Home Screen**: Welcome hero card, quick civic impact stats (Submitted, In Progress, Resolved), eco points score, recent reports preview.
- **Capture / Report Screen**: Camera capture (`expo-image-picker`) and gallery selector, auto GPS geotagging (`expo-location`) with manual pin adjustment, category chips, volume picker, optional citizen remark.
- **AI Submission Confirmation Screen**: Simulated 1.5s SwachhLens AI Vision analysis, category & volume verification, confidence score, and generated tracking ID (`RPT-2026-XXXX`).
- **My Reports Screen**: Full listing of all citizen reports (8 mock history entries + newly submitted session reports), status filter tabs (`Submitted`, `In Progress`, `Resolved`).
- **Report Detail Screen**: Full photo view, metadata, AI confidence rating, and 4-step real-time resolution timeline (`Submitted` → `Acknowledged` → `In Progress` → `Resolved`).
- **Notifications Screen**: Real-time alerts on municipal crew assignments, resolution verification, and eco reward points.
- **Profile Screen**: Citizen impact metrics, total eco points, Patna Municipal Corporation helpline (155304).

---

## Tech Stack & Architecture

- **React Native with Expo**
- **React Navigation** (Bottom Tabs + Native Stack)
- **`expo-image-picker`** for camera and gallery photo picking
- **`expo-location`** for GPS geotagging
- **React Context (`ReportsContext`)** for local runtime state management
- **Mock API Service (`src/services/api.js`)** pre-configured for future Axios backend swap

---

## Running the Mobile App

1. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. Run on Android/iOS/Web:
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Press `w` for Web Preview
