# Technology Basics & Advanced Concepts

Hello! Here is a focused guide on the tools we used, explained for an interview setting.

---

## 1. FastAPI
- **Basics**: A modern Python framework for building APIs.
- **Advanced**: It uses **Pydantic** for data validation and **Starlette** for the underlying web logic.
- **Interview Level**: "How does FastAPI handle high concurrency?" -> "It uses **ASCI (Asynchronous Server Gateway Interface)**, allowing it to handle thousands of connections while waiting for 'IO bound' tasks like database queries."

---

## 2. PostgreSQL
- **Basics**: A relational database (SQL) that stores data in tables.
- **Advanced**: We use **Indexing** on `store_id` and `timestamp`. An index is like a book's table of contents; it helps the DB find data without reading every single row.
- **Interview Level**: "What is ACID?" -> "Atomicity, Consistency, Isolation, Durability. It's why our data remains safe even if the power goes out during an event write."

---

## 3. YOLO11
- **Basics**: "You Only Look Once". It's an algorithm that detects objects in a single pass of the image.
- **Advanced**: It utilizes a **Backbone** (to extract features), a **Neck** (to combine them), and a **Head** (to make predictions). YOLO11 is "Anchor-free", meaning it predicts centers of objects directly rather than comparing them to fixed boxes.
- **Interview Level**: "Why YOLO over R-CNN?" -> "YOLO is 'One-stage'. It's much faster, making it suitable for real-time video, whereas R-CNN is 'Two-stage' and slower."

---

## 4. Docker
- **Basics**: "Containers" that package your code and its dependencies.
- **Advanced**: **Docker Compose** orchestrates multiple containers. Our `db`, `redis`, `backend`, and `frontend` all talk to each other inside a private virtual network created by Docker.
- **Interview Level**: "Why use Docker for a Purplle challenge?" -> "It guarantees that 'It works on my machine' means 'It works on your machine'. The environment is identical for everyone."
