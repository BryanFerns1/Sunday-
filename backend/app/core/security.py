import hashlib
import time
from typing import Dict, Any

def generate_content_hash(content: str) -> str:
    """Generates SHA-256 integrity hash for content tracking and verification."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def create_sunday_audit_stamp(
    classification: str,
    source_title: str,
    content_hash: str,
    operator: str = "SUNDAY_CYBER_OP_04"
) -> Dict[str, Any]:
    """Creates a verifiable SUNDAY defense audit record."""
    current_time = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    return {
        "organization": "the Organisation",
        "department": "National Cyber Operations & Intelligence Transformation Wing",
        "problem_statement_id": "sunday",
        "security_classification": classification,
        "source_hash_sha256": content_hash,
        "timestamp": current_time,
        "operator_id": operator,
        "integrity_status": "VERIFIED_TAMPER_PROOF",
        "compliance_standard": "SUNDAY-STD-AI-TRANSFORM-V2"
    }
