"""Unified LLM provider: Gemini primary, local Llamafile (Qwen3-4B) fallback."""

import base64
import logging
import re
import time
from typing import Optional

import httpx

from backend.app.config import settings
from backend.app.services import offline_model_manager

logger = logging.getLogger("llm_provider")

GEMINI_MODEL_CASCADE = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
# Complete <think>...</think> blocks, plus any trailing block left unterminated by a
# truncated response.
_THINK_BLOCK = re.compile(r"<think>.*?</think>", re.DOTALL)
_THINK_BLOCK_OPEN = re.compile(r"<think>.*\Z", re.DOTALL)


def _strip_reasoning(text: str) -> str:
    """Removes Qwen thinking traces from a completion."""
    return _THINK_BLOCK_OPEN.sub("", _THINK_BLOCK.sub("", text)).strip()


class LLMProviderError(RuntimeError):
    """Raised when both the primary (Gemini) and offline (Qwen) providers fail."""


_state = {
    "active_provider": "gemini",  # "gemini" | "offline_qwen"
    "gemini_last_failure": 0.0,   # epoch seconds of the last Gemini failure
    "fallback_warned": False,
}


def get_active_provider() -> str:
    return _state["active_provider"]


def _gemini_in_cooldown() -> bool:
    """True while we trust the recent Gemini failure and skip retrying it."""
    return (time.time() - _state["gemini_last_failure"]) < settings.GEMINI_COOLDOWN_SEC


def _build_openai_messages(prompt, image_bytes, mime_type, system_prompt):
    """Builds OpenAI-compatible chat messages (supports multimodal image parts)."""
    content = []
    if image_bytes:
        mime = mime_type if (mime_type and mime_type.startswith("image/")) else "image/png"
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}})
    content.append({"type": "text", "text": prompt})
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": content})
    return messages


async def _call_gemini(prompt, image_bytes=None, mime_type=None, system_prompt=None,
                       temperature=0.3, max_output_tokens=4096, json_mode=False) -> Optional[str]:
    """Calls the Gemini API, cascading across models. Returns text or None on any failure."""
    full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    for model_name in GEMINI_MODEL_CASCADE:
        url = (f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}"
               f":generateContent?key={settings.GEMINI_API_KEY}")
        parts = []
        if image_bytes:
            mime = mime_type if (mime_type and mime_type.startswith("image/")) else "image/png"
            parts.append({"inline_data": {"mime_type": mime,
                                          "data": base64.b64encode(image_bytes).decode("utf-8")}})
        parts.append({"text": full_prompt})
        generation_config = {"temperature": temperature, "maxOutputTokens": max_output_tokens}
        if json_mode:
            generation_config["responseMimeType"] = "application/json"
        payload = {"contents": [{"role": "user", "parts": parts}],
                   "generationConfig": generation_config}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidate_parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
                if candidate_parts and "text" in candidate_parts[0]:
                    logger.info(f"[LLM Provider] Gemini ({model_name}) responded successfully.")
                    return candidate_parts[0]["text"].strip()
            logger.warning(f"[LLM Provider] Gemini {model_name} returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"[LLM Provider] Gemini {model_name} call failed: {e}")
    return None


async def _call_offline(prompt, image_bytes=None, mime_type=None, system_prompt=None,
                        temperature=0.3, max_output_tokens=4096) -> Optional[str]:
    """Calls the local Llamafile OpenAI-compatible endpoint (/v1/chat/completions).
    
    Note: The offline model (Qwen3-4B) is text-only and does not support vision/multimodal input.
    If image_bytes is provided, we skip the offline model and return None to allow fallback.
    """
    if image_bytes:
        logger.debug("[LLM Provider] Offline model is text-only; skipping vision request.")
        return None
    
    url = f"{offline_model_manager.get_server_base_url()}/v1/chat/completions"
    payload = {
        "model": settings.OFFLINE_MODEL_NAME,
        "messages": _build_openai_messages(prompt, None, mime_type, system_prompt),
        "temperature": temperature,
        "max_tokens": max_output_tokens,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(url, json=payload)
        if resp.status_code != 200:
            logger.warning(f"[LLM Provider] Offline model HTTP {resp.status_code}: {resp.text[:200]}")
            return None
        data = resp.json()
        message = ((data.get("choices") or [{}])[0].get("message") or {})
        content = message.get("content") or ""
        if not content.strip():
            # Reasoning models can exhaust max_tokens inside <think> and return an
            # empty completion; keep the reasoning so the caller still gets usable text.
            content = message.get("reasoning_content") or ""
        content = _strip_reasoning(content)
        if not content:
            return None
        return content
    except Exception as e:
        logger.warning(f"[LLM Provider] Offline model call failed: {e}")
        return None


async def generate_text(prompt: str, image_bytes: bytes = None, *, mime_type: str = None,
                        system_prompt: str = None, temperature: float = 0.3,
                        max_output_tokens: int = 4096, json_mode: bool = False) -> str:
    """
    Unified entry point for all backend AI text generation.

    1. Attempts the Gemini API (primary).
    2. On any failure (missing key, network loss, timeout, 4xx/5xx, rate limit),
       logs a warning, ensures the local Llamafile server is running, and sends
       the request to http://127.0.0.1:8080/v1/chat/completions (Qwen3-4B).
    3. Raises LLMProviderError if both providers are unavailable.

    Gemini is retried automatically after GEMINI_COOLDOWN_SEC, so the app
    recovers gracefully to online inference once connectivity is restored.
    """
    # 1. Primary: Gemini API (skipped briefly after a failure to avoid retry storms)
    if settings.GEMINI_API_KEY and not _gemini_in_cooldown():
        text = await _call_gemini(prompt, image_bytes=image_bytes, mime_type=mime_type,
                                  system_prompt=system_prompt, temperature=temperature,
                                  max_output_tokens=max_output_tokens, json_mode=json_mode)
        if text:
            _state["active_provider"] = "gemini"
            _state["fallback_warned"] = False
            return text
        _state["gemini_last_failure"] = time.time()
        logger.warning("[LLM Provider] Gemini API failed or unavailable. Switching to local offline model...")
        _state["fallback_warned"] = True
    elif settings.GEMINI_API_KEY:
        logger.debug("[LLM Provider] Gemini in cooldown; using offline model this round.")

    # 2. Fallback: local Llamafile server hosting Qwen3-4B (auto-started if needed)
    if settings.OFFLINE_MODEL_ENABLED and await offline_model_manager.ensure_server_running():
        text = await _call_offline(prompt, image_bytes=image_bytes, mime_type=mime_type,
                                   system_prompt=system_prompt, temperature=temperature,
                                   max_output_tokens=max_output_tokens)
        if text:
            if not _state["fallback_warned"]:
                logger.warning("[LLM Provider] Gemini API failed or unavailable. Switching to local offline model...")
                _state["fallback_warned"] = True
            _state["active_provider"] = "offline_qwen"
            return text

    raise LLMProviderError(
        "Both the Gemini API and the offline local model are unavailable. "
        "Check connectivity / GEMINI_API_KEY, or verify the offline model server."
    )


def get_provider_status() -> dict:
    """Snapshot of provider state, surfaced via GET /api/v1/status/model-status."""
    return {
        "active_provider": _state["active_provider"],
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "offline_model": {
            "enabled": bool(settings.OFFLINE_MODEL_ENABLED),
            "base_url": offline_model_manager.get_server_base_url(),
        },
    }
