# StoreOS — Dark Store Decision Intelligence Platform

## 🚀 What It Does

StoreOS is a **B2B operational intelligence platform** for dark-store franchise managers running 10-minute quick-commerce infrastructure. It acts as the invisible "brain" behind dark stores, constantly monitoring inventory, cold storage, expiry risk, profitability, and operational conflicts.

**One-line positioning:** *StoreOS turns invisible operational leakage into visible, time-sensitive action.*

The platform tells managers:
- **What is going wrong** — Silent loss detection across SKUs
- **How much money is being lost right now** — Live animated ₹/hr ticker
- **What action to take in the next 2 hours** — AI-powered recommendations
- **What happens if they ignore it** — Projected loss calculations

## ✨ Why It's Useful

Every dark store already knows *what* to order. StoreOS tells the manager **what those decisions are costing in real time.** Traditional inventory systems track stock levels — StoreOS tracks the *financial bleeding* caused by poor shelf utilization, expiring inventory, and cold storage failures.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + TailwindCSS + Framer Motion + Recharts + i18next |
| **Backend** | Node.js + Express + MongoDB + Mongoose + JWT + bcrypt |
| **ML Service** | Python + Flask + Custom Risk Scoring Engine |
| **Database** | MongoDB Atlas (with automatic fallback to mock data) |
| **Auth** | JWT-based authentication with demo mode |
| **i18n** | English, Hindi, Kannada |

## 🏗️ Architecture

```
Frontend (Vite :5173) → Backend (Express :3001) → ML Service (Flask :5001)
                                  ↓
                            MongoDB Atlas
                        (fallback: mock JSON)
```

### Key Features
1. **Silent Loss Detector** — Identifies SKUs bleeding money silently
2. **Decision Conflict Resolver** — Detects when reorder logic conflicts with expiry windows
3. **Action Timer** — Live countdown for every alert with escalation
4. **Cold Storage Risk Scorer** — ML-powered risk assessment with ranked alternatives

### Fallback System
- **Database offline?** → Automatically switches to demo mode with mock data
- **ML service offline?** → Express runs the same scoring logic locally as backup
- UI shows badges indicating fallback status

## 🏃‍♂️ How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm

### 1. Clone & Setup

```bash
git clone https://github.com/Pavan-Hosatti/Salt-and-Pepper.git
cd Salt-and-Pepper
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`

### 3. ML Service

```bash
cd ml
pip install -r requirements.txt
python app.py
```

Runs on `http://localhost:5001`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Demo Account
- **Email:** demo@storeos.ai
- **Password:** demo123

Or click "Continue with Demo Account" on the login page.

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
ML_URL=http://localhost:5001
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

### ML (`ml/.env`)
```
PORT=5001
```

## 🚢 Deployment

- **Frontend**: Deploy to Vercel (`npm run build` generates static assets)
- **Backend**: Deploy to Railway/Render
- **ML**: Deploy to Railway/Render as a Python service

## 👥 Team

**Salt and Pepper** — Vibeathon 2026 @ GCEM
