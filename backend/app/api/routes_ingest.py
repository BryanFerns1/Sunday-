import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.ingestion_service import ingestion_service
from backend.app.services.template_service import get_all_templates, get_template_by_id
from backend.app.models.request_models import IngestUrlRequest

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

SUPPORTED_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

@router.post("/upload-image")
async def upload_image_and_analyze(file: UploadFile = File(...)):
    """
    Accepts an uploaded document/certificate image (.png, .jpg, .jpeg, .webp),
    and passes file bytes directly to Ingestion Service for Gemini Vision multimodal analysis.
    """
    filename = file.filename or "uploaded_image.png"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in SUPPORTED_IMAGE_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{ext}'. Supported formats: {', '.join(sorted(SUPPORTED_IMAGE_EXTS))}"
        )

    try:
        content_bytes = await file.read()
        if not content_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        extracted_text, metadata = await ingestion_service.parse_image(
            filename=filename,
            content_bytes=content_bytes,
            mime_type=file.content_type
        )

        return {
            "status": "success",
            "filename": filename,
            "extracted_text": extracted_text,
            "metadata": metadata
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze image with vision model: {str(e)}")

@router.post("/file")
async def ingest_uploaded_file(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        extracted_text, metadata = ingestion_service.parse_file(file.filename, content_bytes)
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_text": extracted_text,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded file: {str(e)}")

@router.post("/url")
async def ingest_url_content(req: IngestUrlRequest):
    try:
        text, metadata = await ingestion_service.parse_url(req.url)
        return {
            "status": "success",
            "extracted_text": text,
            "metadata": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch content from URL: {str(e)}")

@router.get("/templates")
def list_available_templates():
    return {"templates": get_all_templates()}

@router.get("/templates/{template_id}")
def fetch_single_template(template_id: str):
    return get_template_by_id(template_id)
