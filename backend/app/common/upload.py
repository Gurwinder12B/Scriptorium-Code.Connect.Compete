import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from app.common.errors import ValidationError

ALLOWED_IMAGE_EXTS = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_VIDEO_EXTS = {"mp4", "webm"}

# Magic byte signatures for genuine image/video format verification
MAGIC_SIGNATURES = {
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "gif": [b"GIF87a", b"GIF89a"],
    "webp": [b"RIFF"],
    "mp4": [b"\x00\x00\x00", b"ftyp"],
    "webm": [b"\x1a\x45\xdf\xa3"],
}

def is_allowed_file(filename: str, media_type: str = "image") -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    if media_type == "image":
        return ext in ALLOWED_IMAGE_EXTS
    elif media_type == "video":
        return ext in ALLOWED_VIDEO_EXTS
    elif media_type == "any":
        return ext in (ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS)
    return False

def verify_file_signature(stream, ext: str) -> bool:
    """Read first 16 bytes to verify genuine file signature matches extension."""
    ext = ext.lower()
    signatures = MAGIC_SIGNATURES.get(ext)
    if not signatures:
        return True  # If unknown signature, fallback to extension check
    
    stream.seek(0)
    header = stream.read(16)
    stream.seek(0)
    
    for sig in signatures:
        if sig in header:
            return True
    return False

def save_uploaded_media(file_storage, subfolder: str = "general", media_type: str = "image") -> str:
    """
    Validates, renames, and saves an uploaded file safely.
    Returns the public relative URL (e.g. '/uploads/events/safe-name.png').
    """
    if not file_storage or not file_storage.filename:
        raise ValidationError("No file provided for upload.")

    original_filename = file_storage.filename
    if not is_allowed_file(original_filename, media_type):
        allowed = ALLOWED_IMAGE_EXTS if media_type == "image" else (ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS)
        raise ValidationError(f"Invalid file type. Allowed extensions: {', '.join(allowed)}.")

    ext = original_filename.rsplit(".", 1)[1].lower()
    if not verify_file_signature(file_storage.stream, ext):
        raise ValidationError(f"File contents do not match expected format for .{ext}.")

    upload_root = current_app.config.get("UPLOAD_FOLDER", os.path.join(os.getcwd(), "uploads"))
    target_dir = os.path.join(upload_root, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    # Generate safe unique filename
    safe_name = secure_filename(original_filename)
    unique_prefix = uuid.uuid4().hex[:12]
    final_filename = f"{unique_prefix}_{safe_name}"
    final_path = os.path.join(target_dir, final_filename)

    file_storage.save(final_path)

    # Return web-accessible URL path
    return f"/uploads/{subfolder}/{final_filename}"

