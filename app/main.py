from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.api.routes import router
from app.api.images import router as image_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="AI Blog Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_router)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="app/templates")

app.include_router(router)

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
