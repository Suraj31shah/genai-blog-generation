from fastapi import Header, HTTPException, status
from firebase_admin import auth
from app.firebase import db

def verify_firebase_token(authorization: str = Header(...)):
    """
    Expects header:
    Authorization: Bearer <firebase_id_token>
    """

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = authorization.split(" ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
