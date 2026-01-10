from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def call_groq(messages, temperature=0.7, max_tokens=500):
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=response.text)

    return response.json()["choices"][0]["message"]["content"]

def extract_keywords(topic: str):
    messages = [
        {
            "role": "system",
            "content": "You are an SEO expert."
        },
        {
            "role": "user",
            "content": f"""
Extract 8–12 SEO-relevant keywords for a blog on this topic.

Topic: {topic}

Rules:
- Mix short-tail and long-tail keywords
- Return ONLY a comma-separated list
"""
        }
    ]

    return call_groq(messages, max_tokens=200)

def generate_outline(topic: str, keywords: str):
    messages = [
        {
            "role": "system",
            "content": "You are a professional blog strategist."
        },
        {
            "role": "user",
            "content": f"""
Create a detailed blog outline.

Topic: {topic}
Keywords: {keywords}

Rules:
- Use Markdown
- H1 for title
- H2 for main sections
- Logical flow from intro to conclusion
"""
        }
    ]

    return call_groq(messages, max_tokens=400)

def generate_section(topic, section, keywords, tone, language):
    messages = [
        {
            "role": "system",
            "content": f"You are a {tone.lower()} blog writer writing in {language}."
        },
        {
            "role": "user",
            "content": f"""
Write a detailed section for the blog.

Topic: {topic}
Section: {section}
Keywords: {keywords}

Rules:
- 150–250 words
- Markdown format
- Natural keyword usage
"""
        }
    ]

    return call_groq(messages, max_tokens=350)

def extract_sections(outline: str):
    return [
        line.replace("##", "").strip()
        for line in outline.splitlines()
        if line.startswith("## ")
    ]

def seo_polish(content: str):
    messages = [
        {
            "role": "system",
            "content": "You are an SEO optimization expert."
        },
        {
            "role": "user",
            "content": f"""
Improve the following blog for SEO and readability.

Rules:
- Improve flow
- Improve keyword placement
- Keep Markdown formatting

Content:
{content}
"""
        }
    ]

    return call_groq(messages, max_tokens=500)

TONE_GUIDELINES = {
    "Professional": """
- Formal and authoritative language
- No slang
- Clear structure
- Objective, informative tone
""",
    "Casual": """
- Friendly and conversational language
- Use simple words
- Light, engaging style
- Can use rhetorical questions
""",
    "Technical": """
- Highly technical language
- Use domain-specific terminology
- Explain concepts precisely
- Assume knowledgeable audience
""",
    "Marketing": """
- Persuasive and energetic
- Benefit-driven language
- Engaging and action-oriented
- Emphasize value and outcomes
"""
}

class BlogRequest(BaseModel):
    prompt: str
    tone: str = "Professional"
    language: str = "English"

@router.post("/generate-blog")
def generate_blog(data: BlogRequest):
    topic = data.prompt.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    # ✅ data is valid here
    tone_rules = TONE_GUIDELINES.get(
        data.tone,
        TONE_GUIDELINES["Professional"]
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": f"""
You are a blog writer.

STRICT writing tone rules:
{tone_rules}

If the tone is not followed, the output is incorrect.
"""
            },
            {
                "role": "user",
                "content": f"""
Write a comprehensive blog post about: {topic}

Language: {data.language}

Requirements:
- 600–800 words
- Markdown format
- Clear headings & subheadings
"""
            }
        ],
        "temperature": 0.8,
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

class RegenerateRequest(BaseModel):
    text: str
    action: str

ACTION_PROMPTS = {
    "rewrite": "Rewrite the following text clearly and professionally:",
    "expand": "Expand the following text with more detail:",
    "shorten": "Shorten the following text without losing meaning:",
    "seo": "Improve the SEO of the following text:",
    "grammar": "Fix grammar and improve clarity:",
    "translate": "Translate the following text to English:",
}

@router.post("/regenerate-section")
def regenerate_section(data: RegenerateRequest):
    base_prompt = ACTION_PROMPTS.get(data.action)

    if not base_prompt:
        raise HTTPException(status_code=400, detail="Invalid action")

    prompt = f"""
{base_prompt}

TEXT:
{data.text}

Return only the rewritten content in HTML.
"""

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are an expert editor."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 400
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    result = response.json()

    return {
        "result": result["choices"][0]["message"]["content"]
    }