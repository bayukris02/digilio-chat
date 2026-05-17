# Digilio AI-Agentic ERP: DevOps & Operations Guide

This document outlines the differences between Development and Production environments, the system's operational ports, and instructions on how to start and stop the services. It serves as a quick reference guide if the service goes down.

## 1. Environment Differences

The system operates differently depending on the environment, both technically and in terms of business logic.

### A. Technical & Infrastructure Differences
| Component | Development Mode | Production Mode |
| :--- | :--- | :--- |
| **Frontend** | Runs via `next dev`. Enables Hot Module Replacement (HMR). Slower, shows error overlays. | Runs via `next build && next start`. Statically compiled, highly optimized and fast. |
| **Backend** | Runs via `uvicorn --reload`. Single worker process. Restarts automatically on file changes. | Runs via `gunicorn` with multiple workers. Stable for handling concurrent requests. |
| **Security/Ports**| Core infrastructure ports (5432, 11434, 6379, etc.) are open to the host for debugging. | Infrastructure ports are **closed** to the host (internal Docker network only). Only HTTP/HTTPS ports (80/443) are exposed. |
| **Network** | Accessible via HTTP (e.g., `http://localhost:9090`). | Runs behind a Reverse Proxy (Nginx/Traefik) with SSL (HTTPS). |

### B. Business Logic Differences (Digilio Specific)
| Component | Sandbox Mode (Development) | Go-Live Mode (Production) |
| :--- | :--- | :--- |
| **AI Role** | **Architect / Consultant** | **UI Operator** |
| **Blueprint** | Dynamic and editable. User can create new modules and map dummy data. | **Locked.** Schema cannot be changed. |
| **Data Safety** | Isolated environment (safe to break). | Live transactional data. AI cannot bypass strict business rules. |

---

## 2. Port Allocations

The following ports are currently in use by the system:

| Service | Port | Description |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | `9090` | The main user interface. (Moved from 3000 to avoid conflicts). |
| **Backend (FastAPI)** | `9005` | The core API and NLP routing engine. |
| **Ollama (LLM)** | `11434` | Local LLM Engine running Llama 3 8B. |
| **PostgreSQL** | `5432` | Relational database with pgvector. |
| **Redis** | `6379` | In-memory datastore for sessions. |
| **Meilisearch** | `7700` | Search engine for master data. |
| **MinIO** | `9000` / `9001` | Object storage and UI console. |

---

## 3. How to Run the System (Development Mode)

If the server restarts or the services go down, follow these steps to bring everything back up in Development Mode.

### Step 1: Start the Infrastructure (Docker)
Ensure Docker is running and start the core databases and Ollama.
```bash
cd /root/digilio-chat
docker compose up -d
```
*Wait a few moments for the containers to fully start.*

### Step 2: Start the Backend (FastAPI)
To ensure the backend stays alive even if your SSH session closes, run it inside a `screen` session.
```bash
# Clean up any stuck ports
fuser -k 9005/tcp || true

# Start backend in a detached screen named 'digilio-backend'
screen -dmS digilio-backend bash -c "cd /root/digilio-chat/backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 9005"
```
*To view backend logs live: `screen -r digilio-backend` (Press `Ctrl+A`, then `D` to exit).*

### Step 3: Start the Frontend (Next.js)
Similarly, start the frontend inside a `screen` session on port `9090`.
```bash
# Clean up any stuck ports
fuser -k 9090/tcp || true

# Start frontend in a detached screen named 'digilio-frontend'
screen -dmS digilio-frontend bash -c "cd /root/digilio-chat/frontend && ./node_modules/.bin/next dev -p 9090 -H 0.0.0.0"
```
*To view frontend logs live: `screen -r digilio-frontend` (Press `Ctrl+A`, then `D` to exit).*

### Step 4: Accessing the System
Create an SSH Tunnel from your local machine to the server:
```bash
ssh -L 9090:localhost:9090 -L 9005:localhost:9005 root@46.250.226.232
```
Then open your browser to: `http://localhost:9090`

---

## 4. How to Stop the System

To gracefully shut down the development environment:

```bash
# 1. Kill the Frontend and Backend screens
screen -S digilio-frontend -X quit
screen -S digilio-backend -X quit

# 2. Stop the Docker infrastructure
cd /root/digilio-chat
docker compose stop
```