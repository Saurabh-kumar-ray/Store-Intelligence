from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.events import StoreEvent, Anomaly
from app.schemas.event import AnomalyResponse
from datetime import datetime, timedelta

class AnomalyEngine:
    async def detect_anomalies(self, session: AsyncSession, store_id: str) -> list[Anomaly]:
        anomalies = []
        
        # 1. Queue Spike Check
        # If queue joined events in last 10 mins > 2x avg of last hour
        now = datetime.utcnow()
        last_10m = now - timedelta(minutes=10)
        last_hour = now - timedelta(hours=1)
        
        recent_joins_query = select(func.count(StoreEvent.id))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "BILLING_QUEUE_JOIN", StoreEvent.timestamp >= last_10m))
        recent_joins = (await session.execute(recent_joins_query)).scalar() or 0
        
        hour_joins_query = select(func.count(StoreEvent.id))\
                .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "BILLING_QUEUE_JOIN", StoreEvent.timestamp >= last_hour))
        hour_joins = (await session.execute(hour_joins_query)).scalar() or 0
        avg_10m_in_hour = hour_joins / 6
        
        if recent_joins > (avg_10m_in_hour * 2.5) and recent_joins > 5:
            anomalies.append(Anomaly(
                store_id=store_id,
                type="Queue Spike",
                severity="WARN",
                description=f"Significant increase in queue joins: {recent_joins} in last 10m."
            ))

        # 2. Stale Feed Check (No events in last 5 minutes)
        last_event_query = select(StoreEvent.timestamp)\
            .filter(StoreEvent.store_id == store_id)\
            .order_by(StoreEvent.timestamp.desc())\
            .limit(1)
        last_event_ts = (await session.execute(last_event_query)).scalar()
        
        if not last_event_ts or (now - last_event_ts) > timedelta(minutes=5):
            anomalies.append(Anomaly(
                store_id=store_id,
                type="Stale Feed",
                severity="CRITICAL",
                description="No telemetry received from store cameras for over 5 minutes."
            ))

        return anomalies

anomaly_engine = AnomalyEngine()
