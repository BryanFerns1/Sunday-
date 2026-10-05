import base64
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings
from backend.app.models.request_models import OutputArtefactType

client = TestClient(app)

# Minimal valid 1x1 PNG for multipart upload tests
TINY_PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    # When frontend/dist is built, "/" serves the SPA; otherwise it returns JSON status.
    if response.headers.get("content-type", "").startswith("application/json"):
        data = response.json()
        assert data["status"] == "OPERATIONAL"
        assert data["problem_statement"]

def test_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["airgap_ready"] is True

def test_get_parameters_and_formats():
    resp_params = client.get("/api/transform/parameters")
    assert resp_params.status_code == 200
    assert "audiences" in resp_params.json()
    assert "languages" in resp_params.json()

    resp_formats = client.get("/api/transform/formats")
    assert resp_formats.status_code == 200
    formats = resp_formats.json()["formats"]
    assert len(formats) >= 7

def test_ingest_templates():
    response = client.get("/api/ingest/templates")
    assert response.status_code == 200
    templates = response.json()["templates"]
    assert len(templates) >= 3

def test_upload_image_ingest(monkeypatch):
    """POST /api/v1/ingest/upload-image extracts text + metadata from an image."""
    # Force offline fallback path so the test is deterministic without an API key
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")

    response = client.post(
        "/api/v1/ingest/upload-image",
        files={"file": ("credential_certificate.png", TINY_PNG_BYTES, "image/png")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["filename"] == "credential_certificate.png"
    assert data["extracted_text"].strip()
    metadata = data["metadata"]
    assert metadata["vision_processed"] is True
    assert metadata["mime_type"] == "image/png"

def test_upload_image_rejects_unsupported_format(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")

    response = client.post(
        "/api/v1/ingest/upload-image",
        files={"file": ("chart.gif", TINY_PNG_BYTES, "image/gif")},
    )
    assert response.status_code == 400
    assert "Unsupported image format" in response.json()["detail"]

def test_full_transformation_all_formats():
    payload = {
        "source_title": "APT41 Operation Test",
        "source_content": "Sensors detected severe anomalies in telemetry relays. VPN vulnerability exploited. Threat actor APT41 confirmed.",
        "source_type": "text",
        "parameters": {
            "selected_formats": [
                "video_package",
                "linkedin_post",
                "twitter_thread",
                "advisory",
                "infographic",
                "executive_summary",
                "presentation",
                "sop_incident",
                "press_release",
                "whitepaper"
            ],
            "audience": "Cybersecurity Analysts & Threat Hunters",
            "tone": "Critical & High Alert",
            "language": "English",
            "detail_level": "Standard (Comprehensive Overview)",
            "objective": "Alert, Warn & Mitigate Threat",
            "security_classification": "CONFIDENTIAL"
        }
    }
    response = client.post("/api/transform", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "request_id" in data
    assert data["security_classification"] == "CONFIDENTIAL"
    assert len(data["generated_artefacts"]) == 10
    assert "advisory" in data["generated_artefacts"]
    assert "video_package" in data["generated_artefacts"]
    assert "presentation" in data["generated_artefacts"]

def test_video_package_contains_all_five_sub_components():
    """VIDEO deliverable must contain all 5 required sub-components."""
    payload = {
        "source_title": "Video Package Test",
        "source_content": "Threat telemetry indicates coordinated exploitation of SCADA gateways requiring immediate advisory.",
        "source_type": "text",
        "parameters": {
            "selected_formats": ["video_package"],
            "audience": "Cybersecurity Analysts & Threat Hunters",
            "tone": "Critical & High Alert",
            "language": "English",
            "detail_level": "Standard (Comprehensive Overview)",
            "objective": "Alert, Warn & Mitigate Threat",
            "security_classification": "CONFIDENTIAL"
        }
    }
    response = client.post("/api/transform", json=payload)
    assert response.status_code == 200
    video = response.json()["generated_artefacts"]["video_package"]

    # 1. Full Script & Narration Text
    assert video["narration_full_text"].strip()
    # 2. Detailed Scene-by-Scene Storyboard
    assert len(video["scenes"]) >= 1
    scene = video["scenes"][0]
    assert scene["camera_cue"]
    assert scene["narration_script"]
    # 3. Visual Recommendations & Shot Types
    assert video["visual_recommendations_and_shot_types"].strip()
    # 4. Subtitles / Closed Captions (Timestamped)
    assert "-->" in video["subtitles_srt"]
    # 5. On-Screen Graphics & Motion Design Directions
    assert video["motion_design_directions"].strip()

def test_refine_endpoint():
    payload = {
        "artefact_type": "advisory",
        "current_content": {
            "title": "Advisory Title",
            "executive_summary": "Original text"
        },
        "refinement_instruction": "Add urgent warning for aerospace sector"
    }
    response = client.post("/api/transform/refine", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_export_pptx_and_zip():
    presentation_payload = {
        "export_format": "pptx",
        "artefacts": {
            "presentation": {
                "deck_title": "Test Deck",
                "deck_subtitle": "Test Subtitle",
                "slides": [
                    {
                        "slide_number": 1,
                        "title": "Executive Summary",
                        "bullet_points": ["Point 1", "Point 2"],
                        "speaker_notes": "Opening note"
                    }
                ]
            }
        }
    }
    resp_pptx = client.post("/api/export/pptx", json=presentation_payload)
    assert resp_pptx.status_code == 200
    assert len(resp_pptx.content) > 1000

    zip_payload = {
        "export_format": "zip",
        "artefacts": {
            "advisory": {"title": "Test", "executive_summary": "Test"},
            "presentation": {"deck_title": "Test", "slides": []}
        },
        "meta": {"source_title": "Test Package", "security_classification": "RESTRICTED"}
    }
    resp_zip = client.post("/api/export/zip", json=zip_payload)
    assert resp_zip.status_code == 200
    assert len(resp_zip.content) > 1000
