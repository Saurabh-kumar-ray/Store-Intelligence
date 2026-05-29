# Learning Notes: Engineering the Platform

As your mentor, I've prepared these notes so you understand *why* we wrote every single line of code.

---

## 1. Module: Backend Configuration (`app/core/config.py`)
### ❓ Why this exists
In a production app, you **never** hardcode passwords or URLs in your code. This module centralizes all settings.
### 🛠️ The Approach: Pydantic Settings
- We use Pydantic to "validate" our settings. If a required setting (like DB URL) is missing, the app won't even start. This prevents "silent failures".
### ⚖️ Choices
- **Alternative**: Using plain `os.environ`. 
- **Why Pydantic?**: It gives us "type safety" (e.g., Ensuring PORT is an integer, not a string).

---

## 2. Module: Database Models (`app/models/events.py`)
### ❓ Why this exists
This is the "Brain" of our data. It tells PostgreSQL how to organize tables.
### 🛠️ The Approach: SQLAlchemy (ORM)
- Instead of writing raw SQL like `CREATE TABLE...`, we use Python classes. This is much faster and less error-prone.
### ⚖️ Choices
- **Pros**: Easy to read, handles relations well.
- **Cons**: Slightly slower than raw SQL for billions of rows (but we optimize with indexes!).

---

## 3. Module: Metrics Engine (`app/engine/metrics.py`)
### ❓ Why this exists
Raw events like "ENTRY" are useless to a business manager. They want "Conversion Rate". This module does the math.
### 🛠️ The Approach: Aggregation logic
- We use SQL `COUNT` and `DISTINCT` to calculate totals. 
- **Edge Case Handled**: Division by zero! (If 0 people entered, conversion is 0, not an error).

---

## 4. Module: CV Inference Engine (`app/engine/inference.py`)
### ❓ Why this exists
This turns "raw pixels" into "data points".
### 🛠️ The Approach: YOLO11 + ByteTrack
- **Why YOLO11?**: Fastest and most accurate right now.
- **Why ByteTrack?**: It's amazing at "remembering" people even if they walk behind someone else for a second.

---

## 5. Module: Frontend Dashboard (`frontend/src/App.tsx`)
### ❓ Why this exists
Data is boring; dashboards are engaging. This is what the Purplle management team will actually see.
### 🛠️ The Approach: React + Shadcn Theme
- We used a "Glassmorphism" design (semi-transparent cards) because it feels "Modern" and "Premium".
- **Visual Choice**: We used **Recharts** because it's built for React and handles responsive resizing (Mobile/Desktop) automatically.

---

## 💡 Pro Interview Tip:
If an interviewer asks: *"What happens if your database goes down?"*
**Your Answer**: *"In this implementation, I've used Docker to ensure the DB stays up, but in a real-world scenario, I would add a 'Message Queue' like RabbitMQ. This would store events temporarily in memory so we don't lose data while the DB restarts."*
