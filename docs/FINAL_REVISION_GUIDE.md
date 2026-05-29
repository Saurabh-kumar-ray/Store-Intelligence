# 🚀 2-Hour Revision Guide: Purplle Interview

You've got this! Follow this checklist 2 hours before your interview to stay sharp.

---

## ⏱️ Minutes 0-30: The High-Level Pitch
*Practice saying this out loud:*
"I built an end-to-end Retail Intelligence Platform that processes CCTV video using **YOLO11** and **ByteTrack**. It converts raw frames into business KPIs like **Conversion Rate** and **Queue Depth**, served via a **FastAPI** backend and displayed on a premium **React** dashboard. The system is designed for scalability using **Docker** and **Redis**."

---

## ⏱️ Minutes 30-60: Tech Stack "Buzzwords"
| Tech | Why? (Interviewer Answer) |
| :--- | :--- |
| **YOLO11** | Best speed/accuracy tradeoff for real-time video. |
| **ByteTrack** | Handles occlusions (people hiding behind each other). |
| **FastAPI** | Async support for high-volume event ingestion. |
| **PostgreSQL** | Relational integrity for complex analytics queries. |
| **Tailwind** | Rapid, responsive UI development. |

---

## ⏱️ Minutes 60-90: Code Walkthrough (Key Files)
*Look at these files in your IDE:*
1. `backend/app/main.py`: Understand how events are ingested.
2. `backend/app/engine/metrics.py`: Know the conversion rate formula (`purchases / entries`).
3. `backend/app/engine/inference.py`: Understand how YOLO and Tracking work together.
4. `frontend/src/App.tsx`: Know how the dashboard fetches data using `useEffect`.

---

## ⏱️ Minutes 90-110: Critical Challenges
*Memoize these 3 scenarios:*
1. **Security**: "How is it secure?" -> "We use standard API validation and secure database volume management in Docker."
2. **Privacy**: "What about GDPR?" -> "We only store 'Points' and 'Appearances', not faces or names. The data is anonymized."
3. **Hardware**: "Will it run on a laptop?" -> "Yes, but for a store, we'd use NVIDIA Jetson edge devices for GPU acceleration."

---

## ⏱️ Minutes 110-120: Final Check
- [ ] Is your Docker running? (`docker ps`)
- [ ] Can you open `http://localhost:3000`?
- [ ] Do you have a list of "Questions for them"? 
    *Example: "How does Purplle plan to integrate real-time inventory tracking with video analytics?"*
