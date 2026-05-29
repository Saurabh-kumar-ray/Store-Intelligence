# Code Explained: Every Class and Every Line

As your mentor, let's walk through your codebase. I'll explain the most important files line-by-line.

---

## 🐍 Backend: `backend/app/main.py`
This is your **Entry Point**. It's the traffic controller for your API.

### Line-by-Line Breakdown:
- **Lines 1-8**: We import FastAPI and SQLAlchemy. These are our building blocks.
- **Lines 20-25**: `lifespan` function. This is a "Setup" block. It tells the app: "Before you start, make sure the database tables exist."
- **Lines 43-58**: `ingest_event` function.
  - **Data Flow**: `React JSON` → `Pydantic Validation` → `SQLAlchemy Model` → `Postgres DB`.
  - **Decision**: We use `uuid.uuid4()` to ensure every event is unique.
  - **Edge Case**: If the sensor sends a bad timestamp, Pydantic catches it before it breaks our math.

---

## 📈 Analytics: `backend/app/engine/metrics.py`
This is the **Brain**. It turns raw data into wisdom.

### Logic & Decisions:
- **Function `get_store_metrics`**:
  - We use `func.distinct(StoreEvent.person_id)`. 
  - **Why?**: Because Person #123 might walk past the entrance 5 times. We only want to count them as **1 Unique Visitor**.
  - **Data Flow**: `SQL queries` → `Math logic` → `Pydantic Schema response`.
  - **Scalability**: For millions of rows, we added an `index=True` in our model for `store_id` to make these queries 100x faster.

---

## 👁️ CV Logic: `backend/app/engine/inference.py`
This is the **Eyes**. It turns video into events.

### Line-by-Line Architecture:
- **`self.model = YOLO(model_path)`**: Loads the neural network.
- **`results = self.model.track(...)`**: This single line does two things:
  1. Finds people.
  2. Remembers who they are (Tracking).
- **`if track_id not in self.tracks`**: This is a **State Change Detector**.
  - **Why?**: A person exists in 30 frames per second. We don't want 30 "ENTRY" events! We only want ONE when we first see them.
  - **Edge Case**: What if a person walks out and back? The ReID logic (OSNet) should merge their IDs so we don't count them twice.

---

## ⚛️ Frontend: `frontend/src/App.tsx`
This is the **Face**. It shows the results.

### Key Logic:
- **`useEffect` with `setInterval`**:
  - **Data Flow**: Every 10 seconds, browser asks API for fresh metrics.
  - **Why not WebSockets?**: While we included WS code, polling (setInterval) is much simpler for a "Challenge" project and very robust.
- **`<ResponsiveContainer>`**:
  - **Decision**: This makes the charts resize automatically. If the interviewer opens it on a tablet, it still looks perfect!
