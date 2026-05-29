import uuid
from datetime import datetime, timedelta
import random
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.events import StoreEvent, Anomaly

async def seed_db(session: AsyncSession):
    # Check if database is already seeded
    result = await session.execute(select(func.count(StoreEvent.id)))
    count = result.scalar() or 0
    if count > 0:
        return  # Already seeded
    
    print("Seeding database with realistic retail analytics events...")
    
    store_id = "STORE_01"
    now = datetime.utcnow()
    
    events_to_add = []
    
    # Seed 120 visitors to create a steady volume
    for i in range(120):
        person_id = f"customer_{i:03d}"
        visitor_time = now - timedelta(minutes=random.randint(5, 59))
        
        # 1. Store Entry
        events_to_add.append(StoreEvent(
            id=uuid.uuid4(),
            store_id=store_id,
            timestamp=visitor_time,
            event_type="ENTRY",
            person_id=person_id,
            confidence=0.92 + random.random() * 0.08
        ))
        
        # 2. Zone Enter (80% of visitors enter Aisle 4)
        if random.random() < 0.80:
            zone_time = visitor_time + timedelta(minutes=random.randint(1, 5))
            events_to_add.append(StoreEvent(
                id=uuid.uuid4(),
                store_id=store_id,
                timestamp=zone_time,
                event_type="ZONE_ENTER",
                person_id=person_id,
                confidence=0.88 + random.random() * 0.1,
                zone_id="aisle_4"
            ))
            
            # 3. Zone Dwell (average 250s / 4.2m)
            duration = float(random.randint(120, 380))
            dwell_time = zone_time + timedelta(seconds=duration)
            events_to_add.append(StoreEvent(
                id=uuid.uuid4(),
                store_id=store_id,
                timestamp=dwell_time,
                event_type="ZONE_DWELL",
                person_id=person_id,
                confidence=0.90 + random.random() * 0.08,
                zone_id="aisle_4",
                duration=duration
            ))
            
            # 4. Queue Join (35% join checkout queue)
            if random.random() < 0.35:
                queue_time = dwell_time + timedelta(minutes=random.randint(1, 3))
                events_to_add.append(StoreEvent(
                    id=uuid.uuid4(),
                    store_id=store_id,
                    timestamp=queue_time,
                    event_type="BILLING_QUEUE_JOIN",
                    person_id=person_id,
                    confidence=0.91 + random.random() * 0.08,
                    zone_id="checkout_queue"
                ))
                
                # 5. Purchase (85% conversion) vs Abandon (15%)
                if random.random() < 0.85:
                    purchase_time = queue_time + timedelta(minutes=random.randint(1, 4))
                    events_to_add.append(StoreEvent(
                        id=uuid.uuid4(),
                        store_id=store_id,
                        timestamp=purchase_time,
                        event_type="PURCHASE",
                        person_id=person_id,
                        confidence=0.95 + random.random() * 0.05
                    ))
                else:
                    abandon_time = queue_time + timedelta(minutes=random.randint(1, 2))
                    events_to_add.append(StoreEvent(
                        id=uuid.uuid4(),
                        store_id=store_id,
                        timestamp=abandon_time,
                        event_type="BILLING_QUEUE_ABANDON",
                        person_id=person_id,
                        confidence=0.85 + random.random() * 0.1,
                        zone_id="checkout_queue"
                    ))
                    
    # Bulk save events
    session.add_all(events_to_add)
    await session.commit()
    print(f"Database successfully seeded with {len(events_to_add)} events.")
