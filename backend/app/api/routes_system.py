from fastapi import APIRouter
from backend.app.config import settings
from backend.app.services.transformation_service import transformation_service
from backend.app.services import offline_model_manager
from backend.app.services.llm_provider import get_provider_status

router = APIRouter(prefix="/system", tags=["System"])
status_router = APIRouter(prefix="/status", tags=["System"])

@router.get("/health")
def health_check():
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "organization": settings.ORGANIZATION,
        "problem_id": settings.PROBLEM_ID,
        "mode": settings.DEFAULT_MODEL_PROVIDER,
        "providers_active": {
            "gemini": has_gemini,
            "openai": has_openai,
            "ollama": True,
            "mock_defense_engine": True
        },
        "airgap_ready": True
    }

@status_router.get("/model-status")
async def model_status():
    """Reports which inference provider is active: Gemini (online) or Qwen (offline fallback)."""
    running = await offline_model_manager.check_offline_model_health()
    payload = get_provider_status()
    payload["offline_model"]["running"] = running

    # Report the provider that can actually serve requests right now. Without a
    # GEMINI_API_KEY the cached "gemini" label is misleading.
    active = payload["active_provider"]
    if not payload["gemini_configured"] and active != "offline_qwen":
        active = "offline_qwen" if running else "unavailable"

    payload["active_provider"] = active
    payload["online"] = active == "gemini"
    return payload

@router.get("/history")
def get_session_history():
    return {"history": transformation_service.get_history()}

@router.delete("/history")
def clear_session_history():
    from backend.app.services.transformation_service import TRANSFORMATION_HISTORY
    TRANSFORMATION_HISTORY.clear()
    return {"status": "cleared"}
