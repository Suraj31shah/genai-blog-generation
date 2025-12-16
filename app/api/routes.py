from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class BlogRequest(BaseModel):
    prompt: str

@router.post("/generate-blog")
def generate_blog(data: BlogRequest):
    topic = data.prompt.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": "You are a professional blog writer who writes SEO-friendly blog posts in Markdown."
            },
            {
                "role": "user",
                "content": f"""
Write a comprehensive, engaging blog post about: {topic}

Requirements:
- Attention-grabbing title
- Strong introduction
- Headings & subheadings
- Practical insights
- SEO-friendly language
- Strong conclusion
- 600–800 words
- Markdown format
"""
            }
        ],
        "temperature": 0.7,
        "max_tokens": 900
    }

    response = requests.post(
        GROQ_API_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    result = response.json()
    blog = result["choices"][0]["message"]["content"]

    return {"blog": blog}
