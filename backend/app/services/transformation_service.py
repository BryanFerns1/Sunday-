import time
import uuid
from typing import Dict, Any, List
from backend.app.models.request_models import TransformationRequest, RefineRequest, TransformationParameters
from backend.app.models.response_models import TransformationResponse
from backend.app.core.security import generate_content_hash, create_sunday_audit_stamp
from backend.app.core.engine import transformation_engine

# In-memory history buffer (persists during runtime)
TRANSFORMATION_HISTORY: List[Dict[str, Any]] = []

class TransformationService:
    """Orchestrates transformation requests, timing, audit stamping and history."""

    @staticmethod
    async def process_transformation(req: TransformationRequest) -> TransformationResponse:
        start_time = time.time()
        req_id = f"SUNDAY-TX-{uuid.uuid4().hex[:8].upper()}"
        content_hash = generate_content_hash(req.source_content)

        # Generate all requested deliverables concurrently
        formats = req.parameters.selected_formats
        artefacts = await transformation_engine.generate_multiple_artefacts(
            formats=formats,
            source_content=req.source_content,
            source_title=req.source_title or "Source Document",
            params=req.parameters
        )

        elapsed = round(time.time() - start_time, 3)
        audit_stamp = create_sunday_audit_stamp(
            classification=req.parameters.security_classification,
            source_title=req.source_title or "Source Document",
            content_hash=content_hash
        )

        response = TransformationResponse(
            request_id=req_id,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            source_title=req.source_title or "Source Document",
            security_classification=req.parameters.security_classification,
            hash_sha256=content_hash,
            processing_time_sec=elapsed,
            parameters_used=req.parameters.model_dump(),
            generated_artefacts=artefacts,
            audit_metadata=audit_stamp
        )

        # Store in session history
        TRANSFORMATION_HISTORY.insert(0, {
            "request_id": req_id,
            "timestamp": response.timestamp,
            "source_title": response.source_title,
            "security_classification": response.security_classification,
            "formats_count": len(formats),
            "formats_list": [f.value if hasattr(f, "value") else str(f) for f in formats],
            "processing_time_sec": elapsed,
            "response_data": response.model_dump()
        })
        if len(TRANSFORMATION_HISTORY) > 50:
            TRANSFORMATION_HISTORY.pop()

        return response

    @staticmethod
    async def refine_artefact(req: RefineRequest) -> Dict[str, Any]:
        artefact_type_val = req.artefact_type.value if hasattr(req.artefact_type, "value") else str(req.artefact_type)
        refined = await transformation_engine.refine_artefact(
            artefact_type=artefact_type_val,
            current_content=req.current_content,
            refinement_instruction=req.refinement_instruction,
            params=req.parameters or TransformationParameters()
        )
        return {
            "status": "success",
            "artefact_type": artefact_type_val,
            "refined_content": refined
        }

    @staticmethod
    def get_history() -> List[Dict[str, Any]]:
        return TRANSFORMATION_HISTORY

transformation_service = TransformationService()
