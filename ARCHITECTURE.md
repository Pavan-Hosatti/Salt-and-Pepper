# 🏗️ StoreOS System Architecture

## High-Level Architecture

StoreOS follows a **microservices architecture** with three decoupled layers communicating via REST APIs.

```
                    ┌─────────────────────────┐
                    │      STORE MANAGERS      │
                    │   (Voice / Dashboard)    │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     REACT FRONTEND       │
                    │   Port 5173 (Vite Dev)   │
                    │                          │
                    │  ┌──────────────────┐    │
                    │  │  Voice Agent     │    │
                    │  │  (Web Speech API)│    │
                    │  └──────────────────┘    │
                    │  ┌──────────────────┐    │
                    │  │  Dashboard UI    │    │
                    │  │  (React + Motion)│    │
                    │  └──────────────────┘    │
                    └────────────┬────────────┘
                                 │ HTTP/REST
                    ┌────────────▼────────────┐
                    │    EXPRESS.JS BACKEND     │
                    │      Port 3001           │
                    │                          │
                    │  ┌──────────────────┐    │
                    │  │  Alert Engine    │    │
                    │  │  Loss Calculator │    │
                    │  │  Auth (JWT)      │    │
                    │  └──────────────────┘    │
                    └───────┬─────────┬───────┘
                            │         │
               ┌────────────▼──┐  ┌───▼────────────┐
               │  MongoDB      │  │  Flask ML       │
               │  Atlas        │  │  Service        │
               │  (Database)   │  │  Port 5001      │
               └───────────────┘  └────────────────┘
```

## Data Flow

### 1. Silent Loss Detection Pipeline
```
SKU Data → Calculate (dailySales < 2 && stock > 20) → Loss = stock × cost × 0.02/hr
→ Generate SILENT_LOSS alert → Push to Alert Engine → Display on Dashboard
```

### 2. Decision Conflict Detection Pipeline
```
SKU Data → Detect (stock < reorderPoint && expiryHours < 8)
→ Calculate: savedIfDiscount vs lostIfIgnored
→ Generate CONFLICT alert with recommendation
→ Block auto-reorder → Present to operator
```

### 3. Cold Storage Risk Scoring Pipeline
```
Sensor Data (temp, utilization, expiring_count)
→ POST to ML Service (/predict)
→ Random Forest model scores risk 0-10
→ Generate override options with cost analysis
→ Display Thermal Matrix on Store Detail
```

### 4. Agentic AI Voice Pipeline
```
Mic Input → Web Speech API (recognition)
→ Transcript → Keyword matching (NLU)
→ Command routing (navigate/resolve/query)
→ Speech synthesis response
→ UI state update
```

## Database Schema

### Store Document
```json
{
  "_id": "store_01",
  "name": "Koramangala",
  "location": "Koramangala 4th Block, Bengaluru",
  "ordersPerHour": 42,
  "profitabilityScore": 64,
  "coldStorageTemp": 9,
  "coldStorageUsagePct": 91,
  "skus": [
    {
      "name": "Amul Milk 500ml",
      "stock": 8,
      "expiryHoursLeft": 3,
      "dailySales": 35,
      "costPrice": 28,
      "shelfSlot": "A1",
      "reorderPoint": 15
    }
  ]
}
```

### Alert Document
```json
{
  "storeId": "store_01",
  "storeName": "Koramangala",
  "type": "conflict",
  "severity": "critical",
  "sku": "Amul Milk 500ml",
  "message": "CONFLICT: Amul Milk 500ml — stock below reorder point AND expiring in 3h",
  "recommendation": "Run 20% flash discount to clear 8 units before expiry",
  "savedIfFollowed": 179.2,
  "lostIfIgnored": 224,
  "timeRemaining": 3
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | JWT authentication |
| `POST` | `/api/auth/signup` | User registration |
| `GET` | `/api/auth/demo` | Demo mode access |
| `GET` | `/api/stores` | List all store nodes |
| `GET` | `/api/stores/:id` | Store detail with SKUs |
| `GET` | `/api/alerts` | All active alerts |
| `GET` | `/api/loss` | Network-wide loss rate |
| `GET` | `/api/status` | System health status |
| `POST` | `/api/risk-score` | ML-powered risk scoring |
| `POST` | `/api/actions/resolve` | Resolve individual alert |
| `POST` | `/api/actions/resolve-all` | Global mitigation |

## Resilience & Fallback Strategy

- **MongoDB offline** → Automatic fallback to in-memory mock data
- **ML service offline** → Backend calculates rule-based risk score
- **Voice recognition fails** → Graceful error with retry prompt
- **Network errors** → Cached last-known-good state displayed

## Security

- JWT-based authentication with token expiry
- Protected routes on both frontend and backend
- Environment variable configuration for secrets
- No sensitive data exposed to client
