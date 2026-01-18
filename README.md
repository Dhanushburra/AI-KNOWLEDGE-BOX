# RAG Knowledge Base

A production-style web application for saving notes/URLs and querying them with RAG (Retrieval-Augmented Generation). Built with FastAPI backend and React frontend.

## Features

- **Content Ingestion**: Save text notes or URLs (automatically fetches page content)
- **Semantic Search**: Find relevant content using embeddings-based similarity search
- **RAG Pipeline**: Get AI-powered answers with source citations
- **Local Embeddings**: Uses `sentence-transformers` for free, offline embeddings
- **Gemini LLM**: Uses Google Gemini API for answer generation

## Tech Stack

- **Backend**: FastAPI, SQLite, sentence-transformers, Google Gemini API
- **Frontend**: React, Vite
- **Database**: SQLite with JSON embeddings storage
- **Deployment**: Docker Compose

---

## Design Decisions & Tradeoffs

### 1. Chunking Strategy

**Decision**: Fixed-size word-based chunks (300 words) with 50-word overlap

**Rationale**: 
- Simple and predictable chunk sizes
- Overlap ensures context isn't lost at chunk boundaries
- Fast processing without complex semantic boundary detection

**Tradeoffs**:
- ✅ Simple to implement and understand
- ✅ Consistent chunk sizes make embeddings comparable
- ❌ May split sentences/paragraphs mid-thought
- ❌ Doesn't adapt to document structure

**At Scale**: Consider sentence/paragraph-aware chunking (LangChain text-splitters) or semantic chunking for better context preservation.

---

### 2. Vector Storage

**Decision**: SQLite with embeddings stored as JSON arrays

**Rationale**:
- Single-file database, easy to backup/deploy
- No additional services needed
- Sufficient for single-user use case
- Simple cosine similarity calculation with NumPy

**Tradeoffs**:
- ✅ Zero infrastructure overhead
- ✅ Persistent storage out-of-the-box
- ✅ Easy debugging (can inspect with sqlite3 CLI)
- ❌ Full-table scans for similarity search (O(n))
- ❌ Not optimized for high-dimensional vector operations
- ❌ Limited to thousands of chunks efficiently

**At Scale**: Migrate DB (Pinecone, Weaviate, Qdrant) or PostgreSQL with pgvector extension for better performance.

---

### 3. Embeddings

**Decision**: Local `sentence-transformers` model (`all-MiniLM-L6-v2`)

**Rationale**:
- No API costs for embeddings
- Works offline
- Fast on CPU
- Good quality for general text similarity

**Tradeoffs**:
- ✅ Free and unlimited
- ✅ No network latency
- ✅ No API rate limits
- ❌ First-time download (~90MB model)
- ❌ Slower than API embeddings for very large batches
- ❌ Less specialized than domain-specific models

**At Scale**: Batch processing, GPU acceleration, or API-based embeddings for better throughput.

---

### 4. LLM Choice

**Decision**: Google Gemini 2.5 Flash Lite via API

**Rationale**:
- Lightweight, cost-effective model
- Good balance of speed and quality
- API-based (no local model deployment complexity)

**Tradeoffs**:
- ✅ Fast responses
- ✅ Lower cost than larger models
- ✅ No local GPU requirements
- ❌ Requires API key and internet connection
- ❌ API per request

**Alternative Considered**: Local LLM (llama.cpp) for complete offline functionality, but requires large model files and slower inference.

---

### 5. Database Schema

**Decision**: Separate `items` and `chunks` tables with JSON embeddings

**Rationale**:
- Normalized structure (items → chunks)
- Easy to query items independently
- Embeddings stored as JSON for simplicity

**Tradeoffs**:
- ✅ Clean separation of concerns
- ✅ Can update/delete items and cascade to chunks
- ❌ JSON parsing overhead for similarity search
- ❌ Not optimal for vector operations

**At Scale**: Consider specialized vector column types or separate embedding storage.

---

### 6. Architecture

**Decision**: Monolithic Docker container with both frontend and backend

**Rationale**:
- Single deployment unit
- Simpler for local development
- No network complexity between services

**Tradeoffs**:
- ✅ Easy to deploy and test
- ✅ Single container to manage
- ❌ Tightly coupled services
- ❌ Can't scale services t Scale**: Separate containers/services with proper service discovery for independent scaling.

---

### 7. Error Handling

**Decision**: Basic error handling with HTTP status codes

**Rationale**:
- Simple and clear for MVP
- FastAPI provides good error handling defaults
- Logging for debugging

**Tradeoffs**:
- ✅ Simple implementation
- ✅ Clear error messages for users
- ❌ Not comprehensive error recovery
- ❌ Limited retry logic

**At Scale**: Implement retry logic, circuit breakers, and comprehensive error monitoring.

---

## What Breaks at Scale

1. **Vector Search**: O(n) linear scan becomes slow with >100k chunks → Need indexed vector DB
2. **Embedding Generation**: Sequential processing slow → Need batch/async processing
3. **SQLite**: Concurrent writes limited → Need PostgreSQL or proper database
4. **Single Container**: Can't scale services independently → Need microservices
5. **No Caching**: Repeated queries hit DB/LLM → Need Redis/caching layer
6. **No Authentication**: Singlemulti-user support

---

## Production Considerations

- **Vector DB**: Migrate to Pinecone/Weaviate/Qdrant
- **Database**: PostgreSQL with pgvector
- **Caching**: Redis for frequently accessed items
- **Monitoring**: Logging, metrics, error tracking
- **Rate Limiting**: Protect API endpoints
- **Authentication**: Multi-user support
- **Async Processing**: Background jobs for ingestion
- **CDN**: Serve frontend assets via CDN

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Docker & Docker Compose (optional, for containerized deployment)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

---

## Local Development

### 1. Backend Setup

cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install google-generativeai

# Set environment variable
export GEMINI_API_KEY=your_gemini_api_key_here

# Run the server
uvicorn app.main:app --reload --port 8000

