from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class TargetAudience(str, Enum):
    C_SUITE = "C-Suite & Leadership"
    CYBER_ANALYSTS = "Cybersecurity Analysts & Threat Hunters"
    TECHNICAL_ENGINEERS = "Technical & DevSecOps Engineers"
    FIELD_OPERATORS = "Field Intelligence Operators"
    POLICY_MAKERS = "Policy Makers & Strategic Planners"
    GENERAL_PUBLIC = "General Public & Citizens"
    MEDIA_PRESS = "Media & Press Correspondents"

class ToneStyle(str, Enum):
    AUTHORITATIVE = "Authoritative & Formal"
    URGENT = "Critical & High Alert"
    ANALYTICAL = "Analytical & Objective"
    ENGAGING = "Engaging & Conversational"
    EDUCATIONAL = "Educational & Simplified"
    TACTICAL = "Tactical & Action-Oriented"

class DetailLevel(str, Enum):
    BRIEF = "Concise (TL;DR / Executive Brief)"
    STANDARD = "Standard (Comprehensive Overview)"
    DEEP_DIVE = "Deep-Dive (Technical & In-Depth Breakdown)"

class CommunicationObjective(str, Enum):
    ALERT = "Alert, Warn & Mitigate Threat"
    INFORM = "Inform & Educate"
    EXECUTIVE_DECISION = "Executive Decision Support"
    STRATEGIC_ALIGNMENT = "Strategic Policy Alignment"
    PUBLIC_AWARENESS = "Public Awareness & Broadcast"
    TRAINING_SOP = "Operational SOP & Field Guidance"

class OutputArtefactType(str, Enum):
    VIDEO_PACKAGE = "video_package"
    LINKEDIN_POST = "linkedin_post"
    TWITTER_THREAD = "twitter_thread"
    ADVISORY = "advisory"
    INFOGRAPHIC = "infographic"
    EXECUTIVE_SUMMARY = "executive_summary"
    PRESENTATION = "presentation"
    SOP_INCIDENT = "sop_incident"
    PRESS_RELEASE = "press_release"
    WHITEPAPER = "whitepaper"

class TransformationParameters(BaseModel):
    selected_formats: List[OutputArtefactType] = Field(
        default=[OutputArtefactType.EXECUTIVE_SUMMARY, OutputArtefactType.ADVISORY],
        description="One or more target deliverables to synthesize"
    )
    audience: TargetAudience = Field(default=TargetAudience.CYBER_ANALYSTS)
    tone: ToneStyle = Field(default=ToneStyle.AUTHORITATIVE)
    language: str = Field(default="English", description="Target output language (e.g. English, Hindi, Tamil, etc.)")
    detail_level: DetailLevel = Field(default=DetailLevel.STANDARD)
    objective: CommunicationObjective = Field(default=CommunicationObjective.ALERT)
    style: str = Field(default="SUNDAY Defense Standard")
    security_classification: str = Field(default="RESTRICTED")
    custom_instructions: Optional[str] = Field(default="", description="Operator special prompts/guidance")

class TransformationRequest(BaseModel):
    source_title: Optional[str] = Field(default="Source Intelligence Content")
    source_content: str = Field(..., min_length=5, description="Input raw text, article, memo, or prompt")
    source_type: Optional[str] = Field(default="text", description="text, document, url, audio, prompt, image_ocr")
    source_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    parameters: TransformationParameters = Field(default_factory=TransformationParameters)

class RefineRequest(BaseModel):
    artefact_type: OutputArtefactType
    current_content: Dict[str, Any]
    refinement_instruction: str = Field(..., description="Operator refinement directive (e.g. 'Make it more urgent', 'Add 2 more IOCs')")
    parameters: Optional[TransformationParameters] = None

class IngestUrlRequest(BaseModel):
    url: str

class ExportRequest(BaseModel):
    export_format: str = Field(..., description="pptx, pdf, docx, srt, json, md, zip")
    artefacts: Dict[str, Any]
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict)
