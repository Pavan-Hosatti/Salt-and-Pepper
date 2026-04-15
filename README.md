<div align="center">

# 🧠 StoreOS — Autonomous Operational Intelligence for Quick-Commerce

**Real-time loss detection, AI-driven conflict resolution, and voice-controlled autonomous operations for dark-store logistics networks.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 📌 Problem Statement

India's quick-commerce dark stores lose **₹2–5 Lakhs/month** per node due to:
- **Silent inventory loss** — overstocked perishables rot unnoticed
- **Decision conflicts** — reorder systems clash with expiry timelines
- **Manual cold-chain monitoring** — thermal anomalies detected hours too late
- **Language barriers** — store managers operate in regional languages, not English dashboards

**StoreOS eliminates these losses autonomously.**

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                │
│  Mission Control UI • Voice Agent • Real-time Sync   │
├──────────────────────────────────────────────────────┤
│                   BACKEND (Express.js)                │
│  REST API • Alert Engine • Loss Calculator • Auth    │
├──────────────────────────────────────────────────────┤
│              ML SERVICE (Flask + Python)              │
│  Cold Storage Risk Scoring • Predictive Analytics    │
├──────────────────────────────────────────────────────┤
│                  DATABASE (MongoDB Atlas)             │
│  Stores • SKUs • Alerts • Action Logs • Users        │
└──────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 🔴 Silent Loss Detection Engine
Identifies inventory items that are **bleeding money silently** — high stock, low velocity, approaching expiry. Calculates real-time ₹/hr drain rate per SKU.

### 2. ⚡ Decision Conflict Resolution
Detects when the **reorder system contradicts expiry data** (e.g., "reorder Milk" vs "Milk expires in 2 hours"). Recommends optimal action: flash discount, transfer, or accept loss.

### 3. ❄️ Cold Storage Thermal Matrix
ML-powered risk scoring (0–10) for cold storage units. Monitors temperature, utilization, and expiring item count. Provides cognitive override options with cost/savings analysis.

### 4. 🤖 Agentic AI Voice Interface
Hands-free operational control via **voice commands**:
- *"Show me critical alerts"* → Routes to alert dashboard
- *"Monitor Koramangala"* → Deep-dives into node telemetry
- *"Resolve all"* → Initiates global mitigation protocols
- Supports **English, Hindi, and Kannada**

### 5. 📊 Network-Wide Operational Dashboard
Real-time overview of all dark-store nodes with live loss ticker, priority intervention banners, and per-node health indicators.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 | Mission Control UI |
| **Animation** | Framer Motion | Micro-interactions & transitions |
| **Voice** | Web Speech API | Speech recognition & synthesis |
| **i18n** | react-i18next | Multilingual support (EN/HI/KN) |
| **Backend** | Express.js, Node.js 18+ | REST API, business logic |
| **ML Service** | Flask, Python 3.11+ | Risk scoring models |
| **Database** | MongoDB Atlas | Persistent storage |
| **Auth** | JWT | Secure session management |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas URI (or use built-in demo mode)

### Installation

```bash
# Clone the repository
git clone https://github.com/Pavan-Hosatti/Salt-and-Pepper.git
cd Salt-and-Pepper

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your MongoDB URI
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev

# ML Service (new terminal)
cd ml
pip install -r requirements.txt
python app.py
```

### Environment Variables

```env
# backend/.env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
ML_SERVICE_URL=http://localhost:5001
PORT=3001
```

---

## 📁 Project Structure

```
Salt-and-Pepper/
├── frontend/                # React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── TopBar.jsx          # Navigation & status indicators
│   │   │   ├── LossTicker.jsx      # Real-time loss counter
│   │   │   ├── StoreCard.jsx       # Node overview cards
│   │   │   ├── AlertCard.jsx       # Alert display with actions
│   │   │   ├── SKUTable.jsx        # Inventory telemetry feed
│   │   │   ├── ColdStoragePanel.jsx # Thermal matrix display
│   │   │   ├── VoiceAgent.jsx      # Agentic AI voice interface
│   │   │   └── CountdownTimer.jsx  # Expiry countdown
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Authentication portal
│   │   │   ├── NetworkOverview.jsx # Main dashboard
│   │   │   ├── Alerts.jsx          # Alert control room
│   │   │   └── StoreDetail.jsx     # Deep node telemetry
│   │   ├── context/         # Theme provider (dark/light)
│   │   ├── locales/         # i18n translations (en/hi/kn)
│   │   └── api.js           # Axios API configuration
│   └── index.html
│
├── backend/                 # Express.js REST API
│   ├── routes/
│   │   ├── auth.js          # JWT authentication
│   │   ├── stores.js        # Store CRUD & loss calculation
│   │   ├── alerts.js        # Alert generation engine
│   │   └── ml.js            # ML service proxy
│   ├── models/              # MongoDB schemas
│   ├── data/                # Mock data for demo mode
│   └── index.js             # Server entry point
│
├── ml/                      # Python ML microservice
│   ├── app.py               # Flask server
│   └── requirements.txt     # Python dependencies
│
└── README.md
```

---

## 🎯 Demo Flow

1. **Login** → Use demo mode or create an account
2. **Network Overview** → See all 5 dark-store nodes with live loss rates
3. **Voice Command** → Click mic, say "Show me critical alerts"
4. **Alerts Dashboard** → View conflicts, silent losses, expiry warnings
5. **Voice Command** → "Monitor Koramangala" → Deep-dive into node
6. **Store Detail** → SKU inventory, thermal matrix, cognitive overrides
7. **Voice Command** → "Resolve all" → Autonomous global mitigation

---

## 👥 Team

**Salt & Pepper** — Built at Hackathon 2026

---

## 📄 License

This project is built for educational and hackathon demonstration purposes.
