import math
import re
from typing import List, Optional
import httpx
from ..config import settings

class EmbeddingService:
    VECTOR_DIM = 64
    
    @classmethod
    async def get_embedding(cls, text: str) -> List[float]:
        if settings.is_ai_live:
            try:
                return await cls._get_gemini_embedding(text)
            except Exception as e:
                print(f"[EmbeddingService] Gemini embedding failed, using local hash vectorizer: {e}")
                
        return cls._compute_local_vector(text)

    @classmethod
    async def _get_gemini_embedding(cls, text: str) -> List[float]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text[:1000]}]}
                }
            )
            data = resp.json()
            return data["embedding"]["values"][:cls.VECTOR_DIM]

    @classmethod
    def _compute_local_vector(cls, text: str) -> List[float]:
        """Deterministic 64-dim unit-normalized term frequency / n-gram vector."""
        vec = [0.0] * cls.VECTOR_DIM
        cleaned = re.sub(r'[^a-z0-9\s]', ' ', text.lower())
        tokens = cleaned.split()
        if not tokens:
            return vec

        # Token frequencies & character 3-grams
        for t in tokens:
            h = hash(t) % cls.VECTOR_DIM
            vec[h] += 1.0
            for i in range(len(t) - 2):
                tri = t[i:i+3]
                h_tri = hash(tri) % cls.VECTOR_DIM
                vec[h_tri] += 0.3

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    @classmethod
    def cosine_similarity(cls, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2:
            return 0.5
        min_len = min(len(vec1), len(vec2))
        dot = sum(vec1[i] * vec2[i] for i in range(min_len))
        norm1 = math.sqrt(sum(vec1[i] * vec1[i] for i in range(min_len)))
        norm2 = math.sqrt(sum(vec2[i] * vec2[i] for i in range(min_len)))
        if norm1 <= 0 or norm2 <= 0:
            return 0.5
        val = dot / (norm1 * norm2)
        # Scale to 0..1
        return max(0.0, min(1.0, (val + 1.0) / 2.0))
