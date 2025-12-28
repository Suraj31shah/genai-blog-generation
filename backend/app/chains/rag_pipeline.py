from fastapi import APIRouter, HTTPException , Depends
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from app.api.auth import verify_firebase_token
from app.services.user_service import get_or_create_user

load_dotenv()