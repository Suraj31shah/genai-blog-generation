from fastapi import APIRouter, HTTPException , Depends
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from app.api.auth import verify_firebase_token
from app.services.user_service import get_or_create_user

load_dotenv()

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