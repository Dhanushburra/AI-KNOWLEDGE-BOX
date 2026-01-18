from fastapi import APIRouter, HTTPException
from app.models import IngestRequest, QueryRequest
from app.ingest import ingest_item
from app.search import semantic_search
from app.rag import ask_llm
from app.utils import fetch_url_text
from app.db import cursor

router = APIRouter()

@router.post("/ingest")
async def ingest(req: IngestRequest):
    content = req.content

    if req.type == "url":
        content = await fetch_url_text(req.content)

    ingest_item(req.type, content)
    return {"status": "ok"}

@router.get("/items")
def items():
    cursor.execute("SELECT id, type, content, created_at FROM items ORDER BY id DESC")
    return cursor.fetchall()

@router.post("/query")
def query(req: QueryRequest):
    results = semantic_search(req.question)

    if not results:
        return {"answer": "No data available", "sources": []}

    chunks = [r[2] for r in results]
    answer = ask_llm(req.question, chunks)

    sources = [{"item_id": r[1], "text": r[2]} for r in results]

    return {"answer": answer, "sources": sources}