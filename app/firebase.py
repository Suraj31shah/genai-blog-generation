import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

key_path = os.path.join(BASE_DIR, "firebase_key.json")

cred = credentials.Certificate(key_path)

# Prevent multiple initialization
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
