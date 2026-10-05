"""Shared test safety: never spawn llamafile or hit real AI APIs during tests."""

import pytest

from backend.app.config import settings
from backend.app.services import llm_provider


@pytest.fixture(autouse=True)
def deterministic_providers(monkeypatch):
    """Disable offline auto-spawn and real Gemini calls for every test."""
    monkeypatch.setattr(settings, "OFFLINE_MODEL_ENABLED", False)
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    llm_provider._state["active_provider"] = "gemini"
    llm_provider._state["gemini_last_failure"] = 0.0
    llm_provider._state["fallback_warned"] = False
    yield
