# PROJECT RECOVERY PLAN
## Retail Store Intelligence Platform

---

## 📌 Executive Summary

This document describes the complete root cause analysis and recovery plan for the startup failure of the Retail Store Intelligence Platform.  
The backend was failing to start due to a **PostgreSQL startup race condition** combined with **missing Docker Compose health checks**, causing `asyncpg.exceptions.CannotConnectNowError` on every container restart. A secondary issue was the **frontend proxy misconfiguration** that caused all API calls to fail inside Docker.

---

## 🔬 Root Cause Analysis

### Problem 1: Database Race Condition (CRITICAL)
| Property | Detail |
|---|---|
| **Symptom** | `asyncpg.exceptions.CannotConnectNowError: the database system is starting up` |
| **File** | `backend/app/main.py` → `lifespan()` function |
| **Cause** | The FastAPI `lifespan` startup event immediately called `Base.metadata.create_all`, which requires a live database connection. PostgreSQL was still initializing its internal system when the backend container attempted this connection. |
| **Consequence** | FastAPI crashed during startup, Uvicorn exited, and `http://localhost:8000/docs` served `ERR_EMPTY_RESPONSE`. |

### Problem 2: No Docker Compose Health Checks (CRITICAL)
| Property | Detail |
|---|---|
| **Symptom** | Backend starts before Postgres and Redis are actually ready |
| **File** | `docker-compose.yml` |
| **Cause** | `depends_on: - db` only guarantees the container is **started**, not that PostgreSQL has finished initializing and is **ready to accept TCP connections**. |
| **Consequence** | Even if the backend had a minor retry delay, the race was reliably lost every time. |

### Problem 3: Frontend Proxy Misconfiguration (HIGH)
| Property | Detail |
|---|---|
| **Symptom** | Frontend dashboard cannot reach the backend API |
| **File** | `frontend/vite.config.ts` |
| **Cause** | The Vite dev server proxy target was hardcoded to `http://localhost:8000`. Inside the Docker network, the frontend container cannot reach `localhost:8000` — it must use the service name `http://backend:8000`. |
| **Consequence** | All API calls from the frontend fail silently; dashboard shows only mocked/simulated data. |

### Problem 4: No Production-Grade Startup Retry Logic (HIGH)
| Property | Detail |
|---|---|
| **Symptom** | Backend startup fails on first connection attempt |
| **File** | `backend/app/main.py` |
| **Cause** | No retry logic existed. A single connection failure was fatal. |
| **Consequence** | Even if Postgres was only 2 seconds away from being ready, the backend would not recover. |

### Problem 5: Frontend Not Connected to Backend APIs (MEDIUM)
| Property | Detail |
|---|---|
| **Symptom** | Dashboard displays static mock data, not live data from the database |
| **File** | `frontend/src/App.tsx` |
| **Cause** | The API `fetch` calls were commented out with `// In real app:` placeholders. |
| **Consequence** | End-to-end integration could not be demonstrated or verified. |

### Problem 6: Database Starts Empty (MEDIUM)
| Property | Detail |
|---|---|
| **Symptom** | All metrics show 0% conversion rate, 0 visitors |
| **File** | No seed script existed |
| **Cause** | The database schema was created but no events were inserted. |
| **Consequence** | Even if the backend was healthy, the dashboard displayed meaningless zeros. |

---

## ✅ Fixes Applied

### Fix 1: Production-Grade Retry Loop in FastAPI Lifespan
**File:** `backend/app/main.py`

```python
# BEFORE (broken - immediate crash on Postgres unavailability)
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

# AFTER (production-grade with retry backoff)
@asynccontextmanager
async def lifespan(app: FastAPI):
    max_retries = 10
    retry_interval = 2.0
    db_connected = False
    
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            db_connected = True
            break
        except Exception as e:
            logger.warning(f"DB attempt {attempt}/{max_retries} failed. Retrying...")
            await asyncio.sleep(retry_interval)
    
    if not db_connected:
        raise RuntimeError("Database connection could not be established.")
    
    # Seed database if empty
    async with AsyncSessionLocal() as session:
        await seed_db(session)
    
    # Check Redis connectivity
    redis_client = aioredis.from_url(f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}")
    try:
        await redis_client.ping()
    except Exception as e:
        logger.warning("Redis not reachable at startup.", error=str(e))
    finally:
        await redis_client.close()
    
    yield
    await engine.dispose()
```

---

### Fix 2: Docker Compose Health Checks and Service Dependencies
**File:** `docker-compose.yml`

```yaml
# BEFORE (broken - only guarantees container started, not ready)
depends_on:
  - db
  - redis

# AFTER (correct - waits for healthy status)
db:
  image: postgres:15-alpine
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d retail_db"]
    interval: 3s
    timeout: 3s
    retries: 10

redis:
  image: redis:7-alpine
  healthcheck:
    test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
    interval: 3s
    timeout: 3s
    retries: 5

backend:
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
```

---

### Fix 3: Frontend Proxy Target
**File:** `frontend/vite.config.ts`

```typescript
// BEFORE (broken - localhost:8000 not reachable inside Docker)
target: 'http://localhost:8000'

// AFTER (correct - reads VITE_API_URL from compose environment)
target: env.VITE_API_URL || 'http://backend:8000'
```

---

### Fix 4: Frontend Live API Integration
**File:** `frontend/src/App.tsx`

```typescript
// BEFORE (broken - only hardcoded mock data)
// In real app: const res = await fetch('/api/stores/STORE_01/metrics')

// AFTER (correct - real API calls with fallback)
const [metricsRes, funnelRes, anomaliesRes] = await Promise.all([
  fetch(`/api/stores/${storeId}/metrics`),
  fetch(`/api/stores/${storeId}/funnel`),
  fetch(`/api/stores/${storeId}/anomalies`)
]);
```

---

### Fix 5: Database Seeder
**File:** `backend/app/engine/seed.py` (NEW)

Implements automatic seeding of 120 customers with realistic ENTRY → ZONE_ENTER → ZONE_DWELL → BILLING_QUEUE_JOIN → PURCHASE/ABANDON event sequences. Only seeds if the database is empty, making it idempotent and safe for restarts.

---

### Fix 6: Removed Obsolete docker-compose Version Attribute
**File:** `docker-compose.yml`

Removed the deprecated `version: '3.8'` line at the top of the Compose file. Modern versions of Docker Compose ignore this attribute, and it is deprecated in the latest specifications.

---

### Fix 7: Frontend Missing Entry Points & Configuration Files
**Files:** `frontend/index.html` (NEW), `frontend/src/main.tsx` (NEW), `frontend/tsconfig.node.json` (NEW), `frontend/postcss.config.js` (NEW), `frontend/tailwind.config.js` (NEW)

Created the missing entry points and builder configurations so the React Single Page Application compiled and mounted properly. Added PostCSS and Tailwind configurations matching the HSL color palette defined in `index.css`. This fully resolved the HTTP 404 error and enabled proper compilation of Tailwind classes inside the container.

---

## 🚀 Recovery Commands

```powershell
# Step 1: Go to project root
cd "C:\Users\saurabh\Desktop\round 2 project purple tech"

# Step 2: Tear down all containers and volumes (fresh start)
docker compose down --volumes --remove-orphans

# Step 3: Rebuild and start all services in detached mode
docker compose up --build -d

# Step 4: Watch container health status
docker compose ps

# Step 5: Monitor backend logs
docker compose logs -f backend

# Step 6: Verify health endpoint
curl http://localhost:8000/health

# Step 7: Open API docs in browser
Start-Process "http://localhost:8000/docs"

# Step 8: Open frontend dashboard
Start-Process "http://localhost:3000"
```

---

## ✅ Validation Checklist

- [ ] `docker compose ps` shows all 4 containers as `healthy` or `running`
- [ ] Backend logs show: `"Database connection established and schema initialized successfully."`
- [ ] Backend logs show: `"Database successfully seeded with X events."`
- [ ] Backend logs show: `"Redis connection established successfully."`
- [ ] `http://localhost:8000/health` returns `{"status": "healthy", "version": "1.0.0"}`
- [ ] `http://localhost:8000/docs` renders the Swagger UI correctly
- [ ] `http://localhost:3000` loads the frontend dashboard
- [ ] Dashboard KPI cards show real metrics (non-zero visitor count, conversion rate)
- [ ] Dashboard anomaly panel shows at least one live anomaly
- [ ] POST to `/events/ingest` via Swagger UI succeeds
