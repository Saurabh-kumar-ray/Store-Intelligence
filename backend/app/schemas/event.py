from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any, List
from enum import Enum

class EventType(str, Enum):
    ENTRY = "ENTRY"
    EXIT = "EXIT"
    REENTRY = "REENTRY"
    ZONE_ENTER = "ZONE_ENTER"
    ZONE_EXIT = "ZONE_EXIT"
    ZONE_DWELL = "ZONE_DWELL"
    BILLING_QUEUE_JOIN = "BILLING_QUEUE_JOIN"
    BILLING_QUEUE_ABANDON = "BILLING_QUEUE_ABANDON"
    PURCHASE = "PURCHASE"

class EventCreate(BaseModel):
    id: UUID = Field(default_factory=lambda: UUID(int=0)) # Will be generated if not provided
    store_id: str
    timestamp: datetime
    event_type: EventType
    person_id: str
    confidence: float = Field(ge=0, le=1)
    zone_id: Optional[str] = None
    duration: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class EventResponse(BaseModel):
    id: UUID
    store_id: str
    timestamp: datetime
    event_type: EventType
    person_id: str
    confidence: float
    zone_id: Optional[str] = None
    duration: Optional[float] = None
    
    class Config:
        from_attributes = True

class StoreMetrics(BaseModel):
    unique_visitors: int
    conversion_rate: float
    avg_zone_dwell_time: float
    queue_depth: int
    abandonment_rate: float

class FunnelStep(BaseModel):
    label: str
    count: int
    percentage: float

class AnomalySeverity(str, Enum):
    INFO = "INFO"
    WARN = "WARN"
    CRITICAL = "CRITICAL"

class AnomalyResponse(BaseModel):
    id: UUID
    timestamp: datetime
    type: str
    severity: AnomalySeverity
    description: str
    metadata: Optional[Dict[str, Any]] = None
