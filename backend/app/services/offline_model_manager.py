"""
Llamafile offline model server lifecycle manager.

Ensures a local OpenAI-compatible inference server (llamafile hosting the
Qwen3-4B GGUF model) is running on http://127.0.0.1:8080/v1 so the unified
LLM provider (`llm_provider.py`) can fall back to it whenever the Gemini
API is unavailable (network loss, invalid API key, rate limits, 5xx).

Server assets live in `backend/offline model/`:
  - llamafile-0.10.6.exe
  - qwen3-4b-thinking-2507.Q4_K_M.gguf
  - start.bat  (runs: .\\llamafile-0.10.6.exe --server --model qwen3-4b-thinking-2507.Q4_K_M.gguf)
"""

import asyncio
import logging
import os
import subprocess
import sys
import time
from typing import Optional

import httpx

from backend.app.config import settings

logger = logging.getLogger("offline_model_manager")

# Locally-spawned process bookkeeping
_proc_state: dict = {"process": None, "log_handle": None, "last_failed_attempt": 0.0}
# After a failed start, wait this long before trying to spawn again
SPAWN_RETRY_COOLDOWN_SEC = 30.0
# Prevents concurrent request bursts from spawning multiple llamafile servers
_spawn_lock = asyncio.Lock()


def get_server_base_url() -> str:
    """Base URL of the local OpenAI-compatible Llamafile server."""
    return f"http://{settings.OFFLINE_MODEL_HOST}:{settings.OFFLINE_MODEL_PORT}"


def get_models_url() -> str:
    """Health-probe URL: GET /v1/models should return 200 OK when the server is up."""
    return f"{get_server_base_url()}/v1/models"


async def check_offline_model_health(timeout: float = 2.0) -> bool:
    """Returns True if http://127.0.0.1:8080/v1/models answers with HTTP 200."""
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(get_models_url())
            return resp.status_code == 200
    except Exception:
        return False


def _build_launch_command() -> Optional[list]:
    """
    Preferred launch: direct llamafile binary invocation (works cross-platform since
    llamafile binaries are portable cosmopolitan executables).
    Falls back to start.bat (absolute path, so cmd.exe can always resolve it).
    """
    model_dir = settings.OFFLINE_MODEL_DIR
    bat = os.path.join(model_dir, "start.bat")
    exe = os.path.join(model_dir, "llamafile-0.10.6.exe")
    gguf = os.path.join(model_dir, "qwen3-4b-thinking-2507.Q4_K_M.gguf")

    if os.path.exists(exe) and os.path.exists(gguf):
        if sys.platform != "win32":
            try:
                os.chmod(exe, os.stat(exe).st_mode | 0o111)  # ensure executable bit
            except OSError:
                pass
        return [
            exe,
            "--server",
            "--model", gguf,
            "--host", settings.OFFLINE_MODEL_HOST,
            "--port", str(settings.OFFLINE_MODEL_PORT),
        ]

    # Fallback: start.bat must be invoked by absolute path, otherwise cmd.exe
    # reports "'start.bat' is not recognized" when the cwd is not on the search path.
    if os.path.exists(bat):
        return ["cmd", "/c", bat]

    return None


def _spawn_server() -> bool:
    """Launches start.bat / llamafile as a detached background subprocess."""
    if not settings.OFFLINE_MODEL_ENABLED:
        return False

    # Already spawned by this manager and still alive
    process = _proc_state.get("process")
    if process is not None and process.poll() is None:
        return True

    model_dir = settings.OFFLINE_MODEL_DIR
    if not os.path.isdir(model_dir):
        logger.warning(f"[Offline Model] Model directory not found: {model_dir}")
        return False

    command = _build_launch_command()
    if not command:
        logger.warning("[Offline Model] start.bat or llamafile binary/model not found; cannot spawn.")
        return False

    creationflags = 0
    if sys.platform == "win32":
        # Run detached without opening a console window
        creationflags = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP

    try:
        log_path = os.path.join(model_dir, "llamafile_server.log")
        log_handle = open(log_path, "ab")
        process = subprocess.Popen(
            command,
            cwd=model_dir,
            stdin=subprocess.DEVNULL,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            creationflags=creationflags,
        )
        _proc_state["process"] = process
        _proc_state["log_handle"] = log_handle
        logger.info(f"[Offline Model] Launched Llamafile server (pid={process.pid}) from '{model_dir}'")
        return True
    except Exception as e:
        logger.warning(f"[Offline Model] Failed to launch offline server: {e}")
        return False


async def ensure_server_running(wait_seconds: Optional[float] = None) -> bool:
    """
    Ensures the local Llamafile server is up:
      1. Ping /v1/models - if already healthy, return immediately.
      2. Otherwise spawn start.bat in the background and wait up to
         `wait_seconds` (default 10s) for /v1/models to return 200 OK.
    """
    if not settings.OFFLINE_MODEL_ENABLED:
        return False

    if await check_offline_model_health():
        return True

    # Don't re-attempt spawns on every request when a recent attempt just failed
    time_since_failure = time.monotonic() - _proc_state.get("last_failed_attempt", 0.0)
    if time_since_failure < SPAWN_RETRY_COOLDOWN_SEC:
        return False

    timeout = wait_seconds if wait_seconds is not None else settings.OFFLINE_MODEL_STARTUP_TIMEOUT

    async with _spawn_lock:
        # Re-check inside the lock: a concurrent coroutine may have just spawned it
        if await check_offline_model_health():
            return True
        if not _spawn_server():
            return False

    deadline = time.monotonic() + max(timeout, 0.0)
    while time.monotonic() < deadline:
        await asyncio.sleep(0.5)
        if await check_offline_model_health(timeout=1.0):
            logger.info("[Offline Model] Local Qwen server healthy and accepting requests.")
            _proc_state["last_failed_attempt"] = 0.0
            return True

    logger.warning(f"[Offline Model] Llamafile server did not become healthy within {timeout}s.")
    _proc_state["last_failed_attempt"] = time.monotonic()
    return False


def stop_offline_model() -> None:
    """Terminates the locally-spawned Llamafile server process, if any."""
    process = _proc_state.get("process")
    if process is not None and process.poll() is None:
        try:
            process.terminate()
            logger.info("[Offline Model] Llamafile server terminated.")
        except Exception as e:
            logger.debug(f"[Offline Model] Terminate failed: {e}")
    _proc_state["process"] = None
    log_handle = _proc_state.get("log_handle")
    if log_handle:
        try:
            log_handle.close()
        except Exception:
            pass
        _proc_state["log_handle"] = None
