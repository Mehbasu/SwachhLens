import os
import uuid
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(file: UploadFile, base_url: str = "") -> str:
    """
    Saves an uploaded image file locally to the /uploads directory.
    Returns the image URL.
    This service layer allows easily swapping local storage for AWS S3 / Cloudinary.
    """
    ext = os.path.splitext(file.filename or "")[1]
    if not ext or ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        ext = ".jpg"
    
    filename = f"complaint_{uuid.uuid4().hex[:12]}{ext.lower()}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    content = file.file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    relative_url = f"/uploads/{filename}"
    if base_url:
        return f"{base_url.rstrip('/')}{relative_url}"
    return relative_url
