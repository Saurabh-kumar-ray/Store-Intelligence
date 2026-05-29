from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
import uuid
import asyncio
import sys
import os
import redis.asyncio as aioredis
from datetime import datetime
from typing import List

from app.core.config import settings
from app.models.base import Base
from app.models.events import StoreEvent, Anomaly
from app.schemas.event import EventCreate, EventResponse, StoreMetrics, FunnelStep, AnomalyResponse
from app.engine.metrics import metrics_engine
from app.engine.anomaly import anomaly_engine
from app.core.logging import setup_logging, logger

setup_logging()

# Check if running in a test suite
IS_TESTING = "pytest" in sys.modules or os.getenv("TESTING") == "true"

# Database setup
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    max_retries = 10 if not IS_TESTING else 2
    retry_interval = 2.0 if not IS_TESTING else 0.5
    db_connected = False
    
    logger.info("Starting up retail platform backend...")
    
    # 1. Verify and Connect to Postgres with retry backoff
    for attempt in range(1, max_retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database connection established and schema initialized successfully.")
            db_connected = True
            break
        except Exception as e:
            logger.warning(
                f"Database connection attempt {attempt}/{max_retries} failed. Retrying in {retry_interval}s...",
                error=str(e)
            )
            await asyncio.sleep(retry_interval)
            
    if not db_connected:
        if IS_TESTING:
            logger.warning("Database connection failed, but proceeding anyway because we are in testing mode.")
        else:
            logger.error("Failed to connect to the database after maximum retries. Shutting down.")
            raise RuntimeError("Database connection could not be established.")
    else:
        # Seed the database if empty
        try:
            from app.engine.seed import seed_db
            async with AsyncSessionLocal() as session:
                await seed_db(session)
        except Exception as e:
            logger.error("Failed to seed database on startup.", error=str(e))

    # 2. Verify Redis Connectivity
    redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}"
    redis_client = aioredis.from_url(redis_url)
    try:
        await redis_client.ping()
        logger.info("Redis connection established successfully.")
    except Exception as e:
        logger.warning("Failed to connect to Redis on startup.", error=str(e))
    finally:
        await redis_client.close()

    yield
    logger.info("Shutting down retail platform backend...")
    await engine.dispose()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# REST Endpoints
@app.post("/events/ingest", response_model=EventResponse)
async def ingest_event(event_in: EventCreate, db: AsyncSession = Depends(get_db)):
    db_event = StoreEvent(
        id=uuid.uuid4() if event_in.id.int == 0 else event_in.id,
        store_id=event_in.store_id,
        timestamp=event_in.timestamp,
        event_type=event_in.event_type.value,
        person_id=event_in.person_id,
        confidence=event_in.confidence,
        zone_id=event_in.zone_id,
        duration=event_in.duration,
        metadata_json=event_in.metadata
    )
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

@app.get("/stores/{id}/metrics", response_model=StoreMetrics)
async def get_metrics(id: str, db: AsyncSession = Depends(get_db)):
    return await metrics_engine.get_store_metrics(db, id)

@app.get("/stores/{id}/funnel", response_model=List[FunnelStep])
async def get_funnel_data(id: str, db: AsyncSession = Depends(get_db)):
    return await metrics_engine.get_funnel(db, id)

@app.get("/stores/{id}/anomalies", response_model=List[AnomalyResponse])
async def get_anomalies(id: str, db: AsyncSession = Depends(get_db)):
    anomalies = await anomaly_engine.detect_anomalies(db, id)
    # Convert models to schemas
    return [AnomalyResponse(
        id=a.id, 
        timestamp=a.timestamp or datetime.utcnow(), 
        type=a.type, 
        severity=a.severity, 
        description=a.description
    ) for a in anomalies]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# WebSocket for live updates
@app.websocket("/ws/store/{store_id}")
async def websocket_endpoint(websocket: WebSocket, store_id: str):
    await websocket.accept()
    try:
        while True:
            # In a real app, you'd use Redis Pub/Sub to trigger this
            # For now, we'll just poll or send a heartbeat
            await asyncio.sleep(5)
            await websocket.send_json({"type": "HEARTBEAT", "content": "Live feed active"})
    except Exception:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
