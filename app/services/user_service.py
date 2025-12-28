from app.firebase import db
from datetime import datetime

def get_or_create_user(decoded_token: dict):
    """
    If user exists -> return user
    If not -> create user
    """

    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    name = decoded_token.get("name")
    picture = decoded_token.get("picture")

    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if user_doc.exists:
        return user_doc.to_dict()

    user_data = {
        "uid": uid,
        "email": email,
        "name": name,
        "picture": picture,
        "provider": "google",
        "created_at": datetime.utcnow()
    }

    user_ref.set(user_data)
    return user_data
