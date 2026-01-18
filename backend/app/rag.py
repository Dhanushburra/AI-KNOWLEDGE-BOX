# import os
# from llama_cpp import Llama  # pyright: ignore[reportMissingImports]

# _model = None

# def _get_model():
#     global _model
#     if _model is None:
#         # Get absolute path to model file
#         base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#         model_path = os.path.join(base_dir, "models", "Phi-3-mini-4k-instruct-q4.gguf")
        
#         # Verify file exists
#         if not os.path.exists(model_path):
#             raise FileNotFoundError(f"Model file not found: {model_path}")
        
#         # Check file size (should be > 1MB for a valid GGUF)
#         file_size = os.path.getsize(model_path)
#         if file_size < 1024 * 1024:  # Less than 1MB
#             raise ValueError(f"Model file appears too small ({file_size} bytes). File may be corrupted.")
        
#         try:
#             _model = Llama(
#                 model_path=model_path,
#                 n_ctx=2048,
#                 n_threads=4,
#                 verbose=True  # Enable verbose for debugging
#             )
#         except Exception as e:
#             raise RuntimeError(f"Failed to load model from {model_path}. Error: {str(e)}. File size: {file_size} bytes. File may be corrupted or incomplete. Try re-downloading.")
    
#     return _model

# def ask_llm(question, chunks):
#     context = "\n".join(f"- {c}" for c in chunks)

#     prompt = f"""You are an assistant that answers questions using ONLY the context below.
# If the answer is not in the context, say "I don't know".

# Context:
# {context}

# Question:
# {question}
# """

#     model = _get_model()
#     response = model(prompt, max_tokens=256, stop=["\n\n"], echo=False, temperature=0.7)
    
#     return response['choices'][0]['text'].strip()

#------------------------------------------------------------------------------------------------

import os
# from llama_cpp import Llama  # pyright: ignore[reportMissingImports]
import google.generativeai as genai  # pyright: ignore[reportMissingImports]


# Initialize Gemini API
def _init_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    api_key = "AIzaSyBUzuZt-m-NtmTzrKaZYm93epH-RbxbGhk"
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)

def ask_llm(question, chunks):
    context = "\n".join(f"- {c}" for c in chunks)

    prompt = f"""You are an assistant that answers questions using ONLY the context below.
If the answer is not in the context, say "I don't know".

Context:
{context}

Question:
{question}
"""

    # Initialize Gemini on first call
    _init_gemini()
    
    # Use Gemini model: gemini-2.5-flash-lite
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        raise RuntimeError(f"Failed to generate response from Gemini: {str(e)}")