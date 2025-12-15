from fastapi import APIRouter

router = APIRouter(prefix="/api")

@router.post("/generate-blog")
def generate_blog(prompt: str):
    # Replace with LLM call later
    generated_blog = f"""
    ## {prompt}

    This is an AI-generated blog about **{prompt}**.
    It is clean, informative, and SEO-friendly.
    """

    return {"blog": generated_blog}
