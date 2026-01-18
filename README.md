# RAG Knowledge Base

A production-style web application for saving notes and URLs, then querying them using Retrieval-Augmented Generation (RAG). The system uses a FastAPI backend and a React frontend, with local embeddings and a cloud LLM for answer generation.

---

## Features

* Content ingestion: save text notes or URLs (page content is fetched automatically)
* Semantic search using embeddings-based similarity
* RAG pipeline with AI-generated answers and source context
* Local embeddings using `sentence-transformers` (free and offline)
* Google Gemini API for LLM-based answer generation

---

## Tech Stack

* Backend: FastAPI, SQLite, sentence-transformers, Google Gemini API
* Frontend: React, Vite
* Database: SQLite with JSON-based embeddings storage
* Deployment: Docker / Docker Compose or local development

---

## Design Decisions and Tradeoffs

### 1. Chunking Strategy

Fixed-size, word-based chunks (300 words) with a 50-word overlap.

- Overlap helps preserve context across chunk boundaries
- Fast processing without complex parsing logic

Tradeoffs:

- Simple to implement and use
- Does not adapt to document structure

---

### 2. Vector Storage

SQLite with embeddings stored as JSON arrays.

- Single-file database, easy to manage and back up
- Straightforward cosine similarity computation using NumPy

Tradeoffs:

- Not optimized for high-dimensional vector operations
- Performance degrades beyond a few thousand chunks

---

### 3. Embeddings

Local `sentence-transformers` model (`all-MiniLM-L6-v2`).

- No API costs for embeddings
- Fast enough on CPU for small to medium workloads

Tradeoffs:

- Requires an initial model download (~90 MB)
- Slower than hosted embedding APIs for very large batches

---

### 4. LLM Choice

Google Gemini 2.5 Flash Lite via API.

- Lightweight and cost-effective
- Good balance between speed and response quality

Tradeoffs:

- Requires an API key and internet access
- Subject to API quotas and limits

Alternative: A fully local LLM for offline usage. This was not chosen due to large model sizes and slower inference on CPU.

---

### 5. Database Schema

Decision: Separate `items` and `chunks` tables, with embeddings stored as JSON.

- Normalized structure (one item maps to multiple chunks)
- Clear separation of data

Tradeoffs:

- JSON parsing overhead during similarity search
- Not optimal for vector-heavy workloads

---

### 6. Architecture

Decision: Monolithic setup where frontend and backend are deployed together.

Rationale:

* Simple deployment and local development
* Fewer moving parts for an MVP
* No inter-service networking complexity

Tradeoffs:

* Easy to run and test
* Single deployment unit
* Frontend and backend are tightly coupled
* Independent scaling is not possible

At scale: Split frontend and backend into separate services or containers with proper service discovery.

---

### 7. Error Handling

Decision: Basic error handling using HTTP status codes and FastAPI defaults.

Rationale:

- Keeps the app simple
- Errors are logged for debugging

Tradeoffs:

- Clear and readable error responses
- Limited retry or recovery logic
- No advanced monitoring or alerting

---

## Getting Started

### Prerequisites

* Python 3.9 or newer
* Node.js 18 or newer
* Docker
---

## Deployment Options

### Option 1: Docker-Based Deployment

1. Clone the repository
2. Build and start the application:

```
docker compose up --build
```

4. Access the application:

* Backend: [http://localhost:8000]
* Frontend: [http://localhost:5173]

This approach avoids local dependency issues and keeps the environment consistent.

---

### Option 2: Local Development Setup

Use this approach if you want full control or need to debug locally.

#### Backend

```
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
export GEMINI_API_KEY=your_gemini_api_key_here
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://localhost:5173] and will proxy API requests to the backend.

---