import httpx
from bs4 import BeautifulSoup

def chunk_text(text, size=300, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), size - overlap):
        chunks.append(" ".join(words[i:i+size]))
    return chunks

async def fetch_url_text(url: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch URL: {url}, status code: {resp.status_code}")
        soup = BeautifulSoup(resp.text, "html.parser")
        return soup.get_text(separator=" ", strip=True)
