from sentence_transformers import SentenceTransformer  # pyright: ignore[reportMissingImports]

_model = None

def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def embed(text: str):
    model = _get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()