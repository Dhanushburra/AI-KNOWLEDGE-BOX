import json
import numpy as np
from app.db import cursor
from app.embeddings import embed

def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def semantic_search(question, top_k=3):
    q_emb = embed(question)

    cursor.execute("SELECT item_id, text, embedding FROM chunks")
    rows = cursor.fetchall()

    scored = []
    for item_id, text, emb_json in rows:
        emb = np.array(json.loads(emb_json))
        score = cosine(q_emb, emb)
        scored.append((score, item_id, text))

    scored.sort(reverse=True, key=lambda x: x[0])
    return scored[:top_k]
