import pytest
from httpx import AsyncClient
from app.main import app
import uuid
from datetime import datetime

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "version": "1.0.0"}

@pytest.mark.asyncio
async def test_event_ingestion():
    event_data = {
        "store_id": "STORE_01",
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "ENTRY",
        "person_id": "track_123",
        "confidence": 0.95,
        "metadata": {"source": "cam_01"}
    }
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/events/ingest", json=event_data)
    assert response.status_code == 200
    data = response.json()
    assert data["person_id"] == "track_123"
    assert data["event_type"] == "ENTRY"

@pytest.mark.asyncio
async def test_metrics_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/stores/STORE_01/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "unique_visitors" in data
    assert "conversion_rate" in data
