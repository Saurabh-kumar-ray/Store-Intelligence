from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from .base import Base

class EventType(str, enum.Enum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"
    REENTRY = "REENTRY"
    ZONE_ENTER = "ZONE_ENTER"
    ZONE_EXIT = "ZONE_EXIT"
    ZONE_DWELL = "ZONE_DWELL"
    BILLING_QUEUE_JOIN = "BILLING_QUEUE_JOIN"
    BILLING_QUEUE_ABANDON = "BILLING_QUEUE_ABANDON"
    PURCHASE = "PURCHASE"

class StoreEvent(Base):
    __tablename__ = "store_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    event_type = Column(String, index=True)
    person_id = Column(String, index=True)
    confidence = Column(Float)
    zone_id = Column(String, nullable=True)
    duration = Column(Float, nullable=True) # Dwell time in seconds
    metadata_json = Column(JSON, nullable=True)

class AnomalySeverity(str, enum.Enum):
    INFO = "INFO"
    WARN = "WARN"
    CRITICAL = "CRITICAL"

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    type = Column(String)  # Queue Spike, Conversion Drop, etc.
    severity = Column(String)
    description = Column(String)
    metadata_json = Column(JSON, nullable=True)
