# STARTUP DEBUG GUIDE
## Retail Store Intelligence Platform

> **Purpose**: Step-by-step debugging guide for startup failures. Follow each section in order.

---

## 🧭 Quick Orientation

| URL | What it does |
|---|---|
| `http://localhost:8000/health` | Confirms backend is alive |
| `http://localhost:8000/docs` | Swagger UI — interactive API documentation |
| `http://localhost:3000` | Frontend Dashboard |
| `http://localhost:5432` | PostgreSQL (accessible via psql or pgAdmin) |
| `http://localhost:6379` | Redis |

---

## 🔍 Step 1 — Are Containers Running?

```powershell
docker compose ps
```

**Expected output:**

| Container | Status |
|---|---|
| `round2projectpurpletech-db-1` | `Up (healthy)` |
| `round2projectpurpletech-redis-1` | `Up (healthy)` |
| `round2projectpurpletech-backend-1` | `Up` or `Up (healthy)` |
| `round2projectpurpletech-frontend-1` | `Up` |

**If any container shows `Exit 1`:**
→ Jump to Step 2.

**If containers show `starting` for more than 60 seconds:**
→ Something is wrong. Run `docker compose logs <service-name>` to inspect.

---

## 🔍 Step 2 — Inspect Backend Startup Logs

```powershell
docker compose logs backend --tail 100
```

### ✅ Healthy startup looks like:
```
INFO:     Started server process [8]
INFO:     Waiting for application startup.
{"event": "Starting up retail platform backend...", "level": "info"}
{"event": "Database connection established and schema initialized successfully.", "level": "info"}
Seeding database with realistic retail analytics events...
Database successfully seeded with 376 events.
{"event": "Redis connection established successfully.", "level": "info"}
INFO:     Application startup complete.
```

### ❌ If you see: `asyncpg.exceptions.CannotConnectNowError`
- **Cause**: Backend started before Postgres was ready.
- **Fix**: Ensure `docker-compose.yml` has `healthcheck` on the `db` service and the backend `depends_on` uses `condition: service_healthy`.
- **Quick fix**: `docker compose restart backend`

### ❌ If you see: `ConnectionRefusedError: [Errno 111] Connect call failed`
- **Cause**: Wrong hostname or port in environment variables.
- **Fix**: Confirm `POSTGRES_SERVER=db` (not `localhost`) is set in the backend's `environment` block in `docker-compose.yml`.

### ❌ If you see: `RuntimeError: Database connection could not be established.`
- **Cause**: Postgres health check never passed and all 10 retries were exhausted.
- **Fix**: Check Postgres logs — `docker compose logs db --tail 50`

### ❌ If you see: `ModuleNotFoundError: No module named 'app.engine.seed'`
- **Cause**: `seed.py` file is missing from `backend/app/engine/`.
- **Fix**: Verify the file exists at `backend/app/engine/seed.py`.

---

## 🔍 Step 3 — Inspect Database Logs

```powershell
docker compose logs db --tail 50
```

### ✅ Healthy Postgres looks like:
```
LOG:  database system is ready to accept connections
```

### ❌ If you see: `FATAL: database "retail_db" does not exist`
- **Cause**: Volume data is corrupted or `POSTGRES_DB` mismatch.
- **Fix**:
  ```powershell
  docker compose down --volumes
  docker compose up -d
  ```

### ❌ If you see `pg_isready` failing in health check output:
- **Cause**: Postgres is initializing and hasn't accepted connections yet.
- **Fix**: This is normal during first boot. Wait 10-15 seconds. If it doesn't recover, increase `retries` in the healthcheck.

---

## 🔍 Step 4 — Inspect Redis Logs

```powershell
docker compose logs redis --tail 20
```

### ✅ Healthy Redis looks like:
```
Ready to accept connections
```

---

## 🔍 Step 5 — Test the Backend API Directly

```powershell
# Test health
curl http://localhost:8000/health

# Test metrics endpoint
curl http://localhost:8000/stores/STORE_01/metrics

# Test funnel endpoint
curl http://localhost:8000/stores/STORE_01/funnel

# Test anomalies endpoint
curl http://localhost:8000/stores/STORE_01/anomalies
```

### ❌ If you get: `curl: (7) Failed to connect to localhost port 8000`
- The backend container is not running.
- Run `docker compose ps` and check the backend status.

---

## 🔍 Step 6 — Test the Frontend

Open `http://localhost:3000` in a browser.

### ❌ If you get a 404 error (Not Found) in the browser:
- **Cause**: The Vite application is missing key entry points (`index.html`, `src/main.tsx`) or typescript configurations.
- **Fix**: Verify the following files exist in `frontend/`:
  - `frontend/index.html` (Vite HTML shell)
  - `frontend/src/main.tsx` (React root bootstrapper)
  - `frontend/tsconfig.node.json` (tsconfig builder config)
  - `frontend/postcss.config.js` and `frontend/tailwind.config.js` (Tailwind configurations)
- **Check compile logs**: `docker compose logs frontend`
- **Solution**: Restart the frontend container if new files were created after booting:
  ```powershell
  docker compose restart frontend
  ```

### ❌ If KPI cards show all zeros:
- The frontend is connected to the backend, but the database seeder may not have run.
- Run: `docker compose logs backend | grep "Seeding"`
- If seeding failed, restart the backend: `docker compose restart backend`

### ❌ If browser console shows: `Failed to fetch /api/stores/...`
- **Cause**: Vite proxy is not routing to the backend correctly.
- **Fix**: Confirm `VITE_API_URL=http://backend:8000` is in the frontend's `environment` block in `docker-compose.yml`.


---

## 🛠️ Nuclear Option: Full Clean Restart

If all else fails, perform a complete clean rebuild:

```powershell
# Stop everything and delete all volumes (CAUTION: deletes all DB data)
docker compose down --volumes --remove-orphans

# Remove cached layers for a clean build
docker compose build --no-cache

# Start fresh
docker compose up -d

# Watch logs in real-time
docker compose logs -f
```

---

## 🧪 Smoke Test (30-Second Verification)

After startup, run these 4 checks in order:

```powershell
# 1. Health check
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"1.0.0"}

# 2. Metrics
curl http://localhost:8000/stores/STORE_01/metrics
# Expected: JSON with unique_visitors > 0

# 3. Ingest a test event
curl -X POST http://localhost:8000/events/ingest `
  -H "Content-Type: application/json" `
  -d '{"store_id":"STORE_01","timestamp":"2024-01-01T10:00:00","event_type":"ENTRY","person_id":"test_debug_01","confidence":0.99}'

# 4. Check docs
Start-Process "http://localhost:8000/docs"
```

---

## 📊 Useful Docker Commands

```powershell
# Watch live logs for all services
docker compose logs -f

# Watch only backend logs
docker compose logs -f backend

# Restart just the backend (no rebuild)
docker compose restart backend

# Open a shell inside the backend container
docker exec -it round2projectpurpletech-backend-1 bash

# Connect to Postgres directly
docker exec -it round2projectpurpletech-db-1 psql -U postgres -d retail_db

# Check event count in DB
docker exec -it round2projectpurpletech-db-1 psql -U postgres -d retail_db -c "SELECT event_type, COUNT(*) FROM store_events GROUP BY event_type;"
```
