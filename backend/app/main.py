from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from dotenv import load_dotenv
import os

# Load .env file (looks in parent directory first, then app directory)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    # Try app directory
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI(title="Mini RAG App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)