from flask import Blueprint, request
from app.common.decorators import require_auth
from app.common.responses import created_response
from app.common.errors import ValidationError
from app.common.upload import save_uploaded_media

uploads_bp = Blueprint("uploads", __name__, url_prefix="/api/v1/uploads")

@uploads_bp.route("", methods=["POST"])
@require_auth
def upload_file():
    if "file" not in request.files:
        raise ValidationError("No 'file' provided in multipart upload.")
    
    file = request.files["file"]
    subfolder = request.form.get("subfolder", "general").strip()
    media_type = request.form.get("media_type", "image").strip()

    # Sanitize subfolder
    if subfolder not in ("events", "blogs", "projects", "avatars", "general"):
        subfolder = "general"

    url = save_uploaded_media(file, subfolder=subfolder, media_type=media_type)
    return created_response(
        data={"url": url, "filename": file.filename},
        message="File uploaded successfully."
    )
