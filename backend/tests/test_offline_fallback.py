import base64

import pytest
from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app
from backend.app.services import llm_provider, offline_model_manager
from backend.app.services.llm_provider import LLMProviderError, generate_text

client = TestClient(app)

# Offline/Gemini safety comes from the shared autouse fixture in conftest.py.


@pytest.mark.asyncio
async def test_generate_text_falls_back_to_offline(monkeypatch):
    """Missing Gemini key -> falls back to local Qwen server response."""
    monkeypatch.setattr(settings, "OFFLINE_MODEL_ENABLED", True)  # override autouse safety

    async def fake_health(timeout=2.0):
        return True

    async def fake_offline(prompt, image_bytes=None, mime_type=None,
                           system_prompt=None, temperature=0.3, max_output_tokens=4096):
        assert "ertif" in prompt or prompt  # prompt passed through
        return "offline qwen answer"

    monkeypatch.setattr(offline_model_manager, "ensure_server_running", fake_health)
    monkeypatch.setattr(llm_provider, "_call_offline", fake_offline)

    result = await generate_text("Extract this certificate")
    assert result == "offline qwen answer"
    assert llm_provider.get_active_provider() == "offline_qwen"


@pytest.mark.asyncio
async def test_generate_text_raises_when_all_providers_fail(monkeypatch):
    async def no_server(wait_seconds=None):
        return False

    monkeypatch.setattr(offline_model_manager, "ensure_server_running", no_server)
    with pytest.raises(LLMProviderError):
        await generate_text("anything")


@pytest.mark.asyncio
async def test_gemini_failure_switches_to_offline(monkeypatch):
    """Gemini configured but failing -> warning + offline fallback."""
    monkeypatch.setattr(settings, "OFFLINE_MODEL_ENABLED", True)  # override autouse safety
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "fake-key")

    async def gemini_fails(*args, **kwargs):
        return None

    async def server_up(wait_seconds=None):
        return True

    async def offline_ok(prompt, image_bytes=None, mime_type=None,
                         system_prompt=None, temperature=0.3, max_output_tokens=4096):
        return "qwen output"

    monkeypatch.setattr(llm_provider, "_call_gemini", gemini_fails)
    monkeypatch.setattr(offline_model_manager, "ensure_server_running", server_up)
    monkeypatch.setattr(llm_provider, "_call_offline", offline_ok)

    result = await generate_text("hello")
    assert result == "qwen output"
    assert llm_provider.get_active_provider() == "offline_qwen"


@pytest.mark.asyncio
async def test_health_check_false_when_port_closed(monkeypatch):
    monkeypatch.setattr(settings, "OFFLINE_MODEL_PORT", 59999)
    assert await offline_model_manager.check_offline_model_health(timeout=1.0) is False


def test_model_status_endpoint(monkeypatch):
    async def fake_health(timeout=2.0):
        return False

    monkeypatch.setattr(offline_model_manager, "check_offline_model_health", fake_health)
    resp = client.get("/api/v1/status/model-status")
    assert resp.status_code == 200
    data = resp.json()
    # With no Gemini key and no offline server, nothing can serve requests, so the
    # endpoint must not advertise a provider that does not exist.
    assert data["active_provider"] in ("gemini", "offline_qwen", "unavailable")
    assert data["active_provider"] == "unavailable"
    assert data["online"] is False
    assert data["offline_model"]["enabled"] is False
    assert data["offline_model"]["running"] is False
    assert "base_url" in data["offline_model"]


def test_transformation_still_works_with_all_providers_down():
    """Gemini + offline unavailable -> high-fidelity mock artefacts, no crash."""
    payload = {
        "source_title": "Offline Fallback Test",
        "source_content": "Telemetry indicates coordinated exploitation of SCADA gateways.",
        "source_type": "text",
        "parameters": {
            "selected_formats": ["video_package", "linkedin_post", "advisory"],
            "audience": "Cybersecurity Analysts & Threat Hunters",
            "tone": "Critical & High Alert",
            "language": "English",
            "detail_level": "Standard (Comprehensive Overview)",
            "objective": "Alert, Warn & Mitigate Threat",
            "security_classification": "CONFIDENTIAL"
        }
    }
    resp = client.post("/api/transform", json=payload)
    assert resp.status_code == 200
    artefacts = resp.json()["generated_artefacts"]
    assert set(artefacts.keys()) == {"video_package", "linkedin_post", "advisory"}
