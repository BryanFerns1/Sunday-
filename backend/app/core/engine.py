import os
import re
import json
import logging
import httpx
import asyncio
from typing import Dict, Any, Optional, List
from backend.app.config import settings
from backend.app.models.request_models import TransformationParameters, OutputArtefactType, RefineRequest
from backend.app.core.prompts import SYSTEM_PROMPT_SUNDAY, build_artefact_prompt
from backend.app.core.mock_engine import generate_mock_artefact
from backend.app.services.llm_provider import generate_text, LLMProviderError

logger = logging.getLogger("sunday_engine")

class TransformationEngine:
    """
    Multi-Provider LLM Gateway with automatic offline fallback.
    Supports Google Gemini, OpenAI, Local Ollama, and Built-in Mock.
    """
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.mode = settings.DEFAULT_MODEL_PROVIDER

    async def _call_unified_provider(self, prompt: str) -> Optional[Dict[str, Any]]:
        """
        Routes the prompt through the unified LLM provider:
        Gemini primary -> automatic offline Qwen (Llamafile) fallback.
        Returns parsed JSON or None when both providers fail.
        """
        try:
            text = await generate_text(
                prompt,
                system_prompt=SYSTEM_PROMPT_SUNDAY,
                json_mode=True,
                temperature=0.3,
                max_output_tokens=4096,
            )
            return self._parse_llm_json(text)
        except LLMProviderError as e:
            logger.warning(f"Unified LLM provider unavailable (Gemini + offline): {e}")
            return None

    @staticmethod
    def _parse_llm_json(text: str) -> Optional[Dict[str, Any]]:
        """Parses JSON from an LLM response, tolerating code fences and Qwen3 <think> blocks."""
        if not text:
            return None
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except (json.JSONDecodeError, TypeError):
            pass
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except json.JSONDecodeError:
                return None
        return None

    async def _call_openai(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Invokes OpenAI ChatGPT if key is present."""
        if not self.openai_key:
            return None
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT_SUNDAY},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.3
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning(f"OpenAI API status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.warning(f"OpenAI call failed, falling back: {e}")
        return None

    async def _call_ollama(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Invokes local Ollama if configured and running."""
        url = f"{self.ollama_url}/api/generate"
        payload = {
            "model": "llama3.2:latest",
            "prompt": f"{SYSTEM_PROMPT_SUNDAY}\n\n{prompt}",
            "format": "json",
            "stream": False
        }
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return json.loads(data["response"])
        except Exception as e:
            logger.debug(f"Ollama call failed or not running: {e}")
        return None

    async def generate_single_artefact(
        self,
        artefact_type: str,
        source_content: str,
        source_title: str,
        params: TransformationParameters
    ) -> Dict[str, Any]:
        """Generates a single artefact using LLM provider or smart mock fallback."""
        prompt = build_artefact_prompt(artefact_type, source_content, source_title, params)
        result = None

        # 1. Unified provider: Gemini primary, automatic offline Qwen fallback
        if self.gemini_key or settings.OFFLINE_MODEL_ENABLED:
            result = await self._call_unified_provider(prompt)

        # 2. Try OpenAI
        if not result and self.openai_key:
            result = await self._call_openai(prompt)

        # 3. Try Local Ollama
        if not result and self.mode == "ollama":
            result = await self._call_ollama(prompt)

        # 4. Fallback to High-Fidelity Domain Mock Engine
        if not result:
            result = generate_mock_artefact(artefact_type, source_content, source_title, params)

        return result

    async def generate_multiple_artefacts(
        self,
        formats: List[OutputArtefactType],
        source_content: str,
        source_title: str,
        params: TransformationParameters
    ) -> Dict[str, Any]:
        """Runs parallel generation for all requested output formats."""
        tasks = []
        for fmt in formats:
            fmt_value = fmt.value if isinstance(fmt, OutputArtefactType) else fmt
            tasks.append(
                self.generate_single_artefact(fmt_value, source_content, source_title, params)
            )

        results = await asyncio.gather(*tasks)
        output_map = {}
        for fmt, res in zip(formats, results):
            fmt_key = fmt.value if isinstance(fmt, OutputArtefactType) else fmt
            output_map[fmt_key] = res

        return output_map

    async def refine_artefact(
        self,
        artefact_type: str,
        current_content: Dict[str, Any],
        refinement_instruction: str,
        params: Optional[TransformationParameters] = None
    ) -> Dict[str, Any]:
        """Applies AI-assisted refinement to an existing generated deliverable."""
        refine_prompt = f"""
ORIGINAL ARTEFACT ({artefact_type}):
{json.dumps(current_content, indent=2)}

OPERATOR REFINEMENT DIRECTIVE:
\"{refinement_instruction}\"

Update and refine the JSON artefact according to the operator directive while keeping valid JSON structure.
"""
        result = None
        if self.gemini_key or settings.OFFLINE_MODEL_ENABLED:
            result = await self._call_unified_provider(refine_prompt)
        if not result and self.openai_key:
            result = await self._call_openai(refine_prompt)
        if not result:
            # Smart in-memory modification
            updated = dict(current_content)
            if "title" in updated:
                updated["title"] = f"{updated['title']} [Refined: {refinement_instruction[:25]}...]"
            if "executive_summary" in updated:
                updated["executive_summary"] += f"\n\n[Operator Directive Applied: {refinement_instruction}]"
            if "bluf" in updated:
                updated["bluf"] += f" (Updated per operator instruction: {refinement_instruction})"
            if "full_text" in updated:
                updated["full_text"] = f"[UPDATED PER DIRECTIVE: {refinement_instruction}]\n\n" + updated["full_text"]
            result = updated

        return result

transformation_engine = TransformationEngine()
