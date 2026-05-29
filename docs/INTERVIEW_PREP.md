# Interview Preparation Guide: Purplle Challenge

Use this guide to master the concepts behind your project. These are exactly the types of questions a Senior Architect at Purplle would ask.

---

## 🏗️ 1. Architecture Questions

### Q1: "Why did you choose FastAPI over Flask or Django?"
- **Strong Answer**: "FastAPI is built on **Asynchronous (async/await)** principles. In retail intelligence, we get bursts of hundreds of events per second. FastAPI handles these 'concurrency' loads much better than traditional frameworks. Plus, it automatically validates our data using Pydantic, which reduces bugs."
- **Follow-up**: "How does Pydantic help?" -> "It ensures if a camera sends a 'confidence score' as a string instead of a number, the API rejects it before it even hits our database."

---

## 👁️ 2. Computer Vision Questions

### Q2: "What is the difference between Detection and Tracking?"
- **Strong Answer**: "Detection (YOLO11) happens in **every frame independently**. It says 'There is a person here.' Tracking (ByteTrack) happens **across frames**. It says 'The person who was at X in frame 1 is the same person now at Y in frame 2.' Without tracking, we can't calculate 'Dwell Time'."

### Q3: "What is Re-identification (ReID) and why do we need it?"
- **Strong Answer**: "ReID is about memory over long periods. If a customer leaves the store (out of camera view) and returns 10 minutes later, tracking would give them a NEW ID. ReID uses a 'Visual Signature' to realize it's the same person, allowing us to track 'Unique Visitors' correctly."

---

## 📊 3. Data & Metrics Questions

### Q4: "How do you calculate Store Conversion Rate?"
- **Strong Answer**: "It's the ratio of `PURCHASE` events to `ENTRY` events. In my implementation, I used SQL `COUNT(DISTINCT person_id)` to ensure we only count one entrance and one purchase per person per session."

### Q5: "What are 'Anomalies' in a retail context?"
- **Strong Answer**: "Deviations from the 'Normal'. For example:
  - **Queue Spike**: When more people are joining than leaving, leading to frustration.
  - **Dead Zone**: A high-value area of the store having 0 activity for hours (could mean a camera is blocked or the display is unattractive)."

---

## 🧨 4. Failure Scenarios (Critical!)

### "What if the camera feed is laggy or drops frames?"
- **Risk**: ByteTrack might lose the person and assign a new ID.
- **Solution**: We increase the 'Buffer' size in ByteTrack so it 'looks' for the person for a longer duration (e.g., 30 frames) before giving up.

### "What if two people walk very close to each other (Occlusion)?"
- **Risk**: The tracker might 'swap' their IDs (ID Switch).
- **Solution**: ByteTrack handles this by using 'Motion Prediction' (Kalman Filters) to guess where each person *should* be based on their speed.

---

## 📈 5. Scalability

### "How would you handle 10,000 stores?"
1. **Load Balancing**: Use Nginx to spread API requests across multiple backend servers.
2. **Database Partitioning**: Storing events in different physical tables based on the `store_id`.
3. **Redis Pub/Sub**: Instead of polling the DB, use Redis to broadcast alerts to the frontend in real-time.
