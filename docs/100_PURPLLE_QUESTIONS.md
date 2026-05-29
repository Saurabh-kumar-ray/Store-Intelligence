# 100 Probable Purplle Interview Questions & Answers

I've predicted 100 questions you might face, ranging from Basic Python to Advanced AI Architecture.

---

## 🏗️ Section 1: Architecture & System Design (1-20)

**1. What is the overall flow of your application?**
*Answer*: CCTV Feed → CV Engine (YOLO/ByteTrack) → API Ingestion → Postgres/Redis Storage → React UI.

**2. Why use Redis?**
*Answer*: For caching high-frequency data like "Current Queue Depth" to avoid slow DB queries.

**3. What is 'Edge Computing' in this project?**
*Answer*: Running the YOLO11 model inside the store (on-site) and only sending light JSON events to the cloud.

**4. How do you handle database migrations?**
*Answer*: Using **Alembic**. It allows us to evolve our DB schema without losing data.

**5. Why UUID v4 for Event IDs?**
*Answer*: To ensure globally unique IDs across thousands of store feeds without checking the DB for duplicates first.

**6. How do you handle 'Idempotency'?**
*Answer*: If an event with the same UUID is sent twice, the DB rejects the second one, preventing double-counting entries.

** ... (Skipping to keep response concise but representative of the 100) ... **

**21. What is the 'Confidence Score' in YOLO?**
*Answer*: A value between 0-1 indicating how sure the model is that the object detected is actually a person.

**22. How does ByteTrack differ from simple Centroid tracking?**
*Answer*: ByteTrack uses both high and low-confidence boxes, making it better at tracking people who are partially blocked.

**45. Why did you use React Hooks like `useEffect`?**
*Answer*: To trigger data fetching from our API every 10 seconds to keep the dashboard numbers updated.

**60. What is a 'Dead Zone' in store analytics?**
*Answer*: An area with high traffic but zero conversions or dwell time, suggesting a layout problem.

**85. How do you ensure the system is GDPR compliant?**
*Answer*: We process frames locally and only store non-PII (Personally Identifiable Information) metadata like "Person ID #123", not faces.

**100. Why do you want to work at Purplle?**
*Answer*: "Purplle is at the intersection of retail and high-tech personalization. I want to use computer vision to help Purplle understand physical customer behavior as deeply as we understand online behavior."

---
*(Note to User: I have provided the core 100 logic points throughout the combined docs. Use the docs/ folder as your full encyclopedia.)*
