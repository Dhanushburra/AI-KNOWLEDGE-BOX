import json
from datetime import datetime, timezone
from app.db import conn, cursor
from app.utils import chunk_text
from app.embeddings import embed

def ingest_item(item_type, content):
    # Store UTC time with 'Z' suffix so JavaScript parses it correctly as UTC
    timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    cursor.execute(
        "INSERT INTO items (type, content, created_at) VALUES (?, ?, ?)",
        (item_type, content, timestamp)
    )
    item_id = cursor.lastrowid

    chunks = chunk_text(content)

    for chunk in chunks:
        emb = embed(chunk)
        cursor.execute(
            "INSERT INTO chunks (item_id, text, embedding) VALUES (?, ?, ?)",
            (item_id, chunk, json.dumps(emb))
        )

    conn.commit()