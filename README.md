# Retail Store Intelligence Platform

A production-grade platform for extracting retail metrics from CCTV using YOLO11, ByteTrack, and FastAPI.

## Tech Stack
- **AI**: YOLO11 (Detection/Tracking), ByteTrack, OSNet (ReID)
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Redis
- **Frontend**: React, TypeScript, Tailwind, Recharts
- **DevOps**: Docker, Docker Compose

## Quick Start
1. **Clone the repo**
2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
3. **Access the Dashboard**: `http://localhost:3000`
4. **API Documentation**: `http://localhost:8000/docs`

## Key Metrics
- **Unique Visitors**: Tracked across sessions using ReID embeddings.
- **Conversion Rate**: Ratio of store entries to successful purchases.
- **Queue Depth**: Real-time monitoring of billing area occupancy.
- **Zone Heatmaps**: Popularity and dwell time analysis by department.

## Directory Structure
- `/backend`: FastAPI service and CV Inference Engine logic.
- `/frontend`: React dashboard with real-time updates.
- `/docs`: System design and engineering decision logs.
- `/scripts`: Utility scripts for model management.

## Testing
Run backend tests:
```bash
cd backend
pytest
```
