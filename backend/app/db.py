import sqlite3
from datetime import datetime

conn = sqlite3.connect("data.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    content TEXT,
    created_at TEXT
)
""")

# Add timestamp column to existing table if it doesn't exist
try:
    cursor.execute("ALTER TABLE items ADD COLUMN created_at TEXT")
except sqlite3.OperationalError:
    pass  # Column already exists

cursor.execute("""
CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    text TEXT,
    embedding TEXT
)
""")

conn.commit()