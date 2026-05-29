# Debugging Guide: Troubleshooting the Platform

Don't panic! Here is how you solve the most common issues like a pro engineer.

---

## 1. Backend: "Connection Refused" (Database Error)
- **Why it happens**: The FastAPI app is trying to talk to PostgreSQL, but Postgres hasn't finished starting up or is off.
- **How to fix**: 
  1. Check if the container is running: `docker ps`.
  2. Check the logs: `docker logs <db_container_id>`.
  3. Ensure the `POSTGRES_USER` and `PASSWORD` in `.env` match the ones in `docker-compose.yml`.

---

## 2. CV: "No Detections Found"
- **Why it happens**: Often a path issue or a missing model file.
- **How to fix**: 
  1. Verify `yolo11n.pt` is in the `backend/` folder.
  2. Check if the image resolution is too high (YOLO defaults to 640px).
  3. Inspect logs for: `torch.cuda.is_available() == False`. If you have no GPU, it might be very slow!

---

## 3. Frontend: "Blank Screen / Forever Loading"
- **Why it happens**: The React app can't reach the API (CORS issue or wrong URL).
- **How to fix**: 
  1. Open Chrome DevTools (`F12`) -> **Console**. Look for red text.
  2. If it says `CORS Error`: Ensure `CORSMiddleware` in `main.py` is configured to allow `*` (any origin).
  3. Check **Network** tab in DevTools: Is the request to `http://localhost:8000/metrics` returning 404 or 500?

---

## 4. Metrics: "0% Conversion Rate"
- **Why it happens**: Logic error or missing data.
- **How to fix**: 
  1. Check the DB directly: `SELECT * FROM store_events WHERE event_type = 'PURCHASE';`.
  2. If the table is empty, the "Purchase Trigger" logic in your CV code isn't firing.
  3. Check the `engine/metrics.py` for any division-by-zero blocks.

---

## 💡 Pro Testing Approach
Before you submit, do a "Smoke Test":
1. Open the API docs: `http://localhost:8000/docs`.
2. Use the "Try it out" button on `POST /events/ingest`.
3. Send a test JSON.
4. Immediately check the `GET /metrics` endpoint. If the numbers increased, your system is working!
