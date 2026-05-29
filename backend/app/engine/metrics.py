from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.events import StoreEvent, EventType
from app.schemas.event import StoreMetrics, FunnelStep
from datetime import datetime, timedelta

class MetricsEngine:
    async def get_store_metrics(self, session: AsyncSession, store_id: str) -> StoreMetrics:
        # Unique Visitors
        visitor_query = select(func.count(func.distinct(StoreEvent.person_id)))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "ENTRY"))
        unique_visitors = (await session.execute(visitor_query)).scalar() or 0
        
        # Purchases (for conversion rate)
        purchase_query = select(func.count(func.distinct(StoreEvent.person_id)))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "PURCHASE"))
        purchases = (await session.execute(purchase_query)).scalar() or 0
        
        conversion_rate = (purchases / unique_visitors * 100) if unique_visitors > 0 else 0.0
        
        # Avg Zone Dwell Time
        dwell_query = select(func.avg(StoreEvent.duration))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "ZONE_DWELL"))
        avg_dwell = (await session.execute(dwell_query)).scalar() or 0.0
        
        # Queue Depth (Current people in queue)
        join_query = select(func.count(StoreEvent.id))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "BILLING_QUEUE_JOIN"))
        # We'd subtract those who left the queue in a real scenario
        queue_depth = (await session.execute(join_query)).scalar() or 0
        
        # Abandonment Rate
        abandon_query = select(func.count(StoreEvent.id))\
            .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == "BILLING_QUEUE_ABANDON"))
        abandons = (await session.execute(abandon_query)).scalar() or 0
        
        joins = (await session.execute(join_query)).scalar() or 0
        abandonment_rate = (abandons / joins * 100) if joins > 0 else 0.0
        
        return StoreMetrics(
            unique_visitors=unique_visitors,
            conversion_rate=round(conversion_rate, 2),
            avg_zone_dwell_time=round(avg_dwell, 2),
            queue_depth=queue_depth,
            abandonment_rate=round(abandonment_rate, 2)
        )

    async def get_funnel(self, session: AsyncSession, store_id: str) -> list[FunnelStep]:
        steps = ["ENTRY", "ZONE_ENTER", "BILLING_QUEUE_JOIN", "PURCHASE"]
        labels = ["Store Entry", "Zone Visit", "Queue Join", "Purchase"]
        
        funnel = []
        base_count = 0
        
        for i, step in enumerate(steps):
            query = select(func.count(func.distinct(StoreEvent.person_id)))\
                .filter(and_(StoreEvent.store_id == store_id, StoreEvent.event_type == step))
            count = (await session.execute(query)).scalar() or 0
            
            if i == 0:
                base_count = count
            
            percentage = (count / base_count * 100) if base_count > 0 else 0.0
            funnel.append(FunnelStep(label=labels[i], count=count, percentage=round(percentage, 2)))
            
        return funnel

metrics_engine = MetricsEngine()
