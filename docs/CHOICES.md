# Engineering Choices

## 1. Detection Model: YOLO11
- **Rationale**: Currently the state-of-the-art in the YOLO family (Ultralytics). It offers the best accuracy-to-latency ratio, which is critical for processing multiple video streams in real-time.
- **Benefits**: Native support for various export formats (TensorRT, OpenVINO) and integrated tracking modules.

## 2. Tracking: ByteTrack
- **Rationale**: Chosen for its "Detection-to-Track" paradigm where low-score detections are not discarded but used to maintain track continuity in cluttered scenes (crowded retail floors).
- **Benefits**: Highly efficient; doesn't require a dedicated appearance model for every track, reducing computational overhead.

## 3. Re-Identification: OSNet (TorchReID)
- **Rationale**: Omni-Scale Network (OSNet) is designed to learn multi-scale feature representations. In retail, where cameras are often mounted high, capturing features at different scales (e.g., shoe color vs. shirt pattern) is vital.
- **Benefits**: Lightweight yet powerful; handles "re-entry" scenarios where a customer leaves the frame and returns later.

## 4. Backend: FastAPI + SQLAlchemy (Async)
- **Rationale**: Retail intelligence generates a high volume of events. FastAPI’s asynchronous capabilities allow the system to handle ingestion bursts without blocking.
- **Benefits**: Automatic Swagger documentation, Pydantic validation, and high performance.

## 5. Storage: PostgreSQL + Redis
- **Rationale**: PostgreSQL provides relational integrity for historic analytics and funnel data. Redis handles the high-frequency writes required for heatmaps and real-time track state.
- **Benefits**: Standard, reliable, and horizontally scalable.

## 6. Frontend: React + Tailwind + Vite
- **Rationale**: Rapid development and premium aesthetics. Vite provides an extremely fast developer experience.
- **Benefits**: Modular component architecture for complex dashboards.
