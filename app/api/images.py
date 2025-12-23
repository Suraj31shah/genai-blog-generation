from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter(prefix="/api/images")

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

@router.get("/")
def fetch_images(query: str, per_page: int = 12):
    if not query:
        raise HTTPException(status_code=400, detail="Query required")

    url = "https://api.pexels.com/v1/search"
    headers = {
        "Authorization": PEXELS_API_KEY
    }
    params = {
        "query": query,
        "per_page": per_page
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Image fetch failed")

    data = response.json()

    images = [
        {
            "id": img["id"],
            "thumbnail": img["src"]["medium"],
            "original": img["src"]["large"],
            "photographer": img["photographer"]
        }
        for img in data.get("photos", [])
    ]

    return {"images": images}
