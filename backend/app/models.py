from pydantic import BaseModel
from typing import List

class IngestRequest(BaseModel):
    type: str  # "note" or "url"
    content: str

class QueryRequest(BaseModel):
    question: str

class Source(BaseModel):
    text: str
    item_id: int

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
