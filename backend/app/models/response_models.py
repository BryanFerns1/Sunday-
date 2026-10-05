from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 1. Video Package
class VideoScene(BaseModel):
    scene_number: int
    duration_sec: int = 15
    camera_cue: str = "Medium shot, dynamic transition"
    visual_description: str
    narration_script: str
    on_screen_text: str
    audio_soundfx: Optional[str] = "Subtle ambient cyber tension"

class VideoPackageArtefact(BaseModel):
    title: str
    duration_estimate: str = "90 Seconds"
    target_platform: str = "Executive Briefing & Digital Broadcast"
    scenes: List[VideoScene]
    subtitles_srt: str
    narration_full_text: str
    thumbnail_prompt: str
    audio_voiceover_ready: bool = True

# 2. LinkedIn Post
class LinkedInPostArtefact(BaseModel):
    hook: str
    core_narrative: str
    key_takeaways: List[str]
    call_to_action: str
    hashtags: List[str]
    image_prompt: str
    full_text: str

# 3. Twitter / X Thread
class TweetItem(BaseModel):
    tweet_number: int
    text: str
    character_count: int
    media_prompt: Optional[str] = None

class TwitterThreadArtefact(BaseModel):
    thread_title: str
    total_tweets: int
    tweets: List[TweetItem]
    full_thread_text: str

# 4. Security Advisory (SUNDAY Standard)
class IOCItem(BaseModel):
    type: str # SHA256, IP, Domain, YARA, URL
    value: str
    description: str

class AdvisoryArtefact(BaseModel):
    advisory_id: str = "SUNDAY-ADV-2026-0891"
    title: str
    severity: str = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW
    cvss_score: Optional[str] = "8.8"
    affected_systems: List[str]
    threat_actors: Optional[str] = "Advanced Persistent Threat (APT)"
    executive_summary: str
    technical_analysis: str
    indicators_of_compromise: List[IOCItem]
    mitigation_steps: List[str]
    references: List[str]
    compliance_signoff: str = "SUNDAY Cyber Operations Wing"

# 5. Infographic Specification
class MetricCard(BaseModel):
    metric: str
    label: str
    trend: Optional[str] = "+15%"

class InfographicArtefact(BaseModel):
    title: str
    theme_palette: str = "Cyber Tech (Slate, Cyan & Emerald)"
    visual_layout_structure: str
    key_metrics: List[MetricCard]
    mermaid_diagram: str
    visual_prompts: List[str]
    key_messaging_points: List[str]

# 6. Executive Summary / Briefing
class RiskMatrixItem(BaseModel):
    risk_item: str
    impact: str # Critical, High, Medium, Low
    likelihood: str # High, Moderate, Low
    mitigation_owner: str

class ExecutiveSummaryArtefact(BaseModel):
    title: str
    bluf: str # Bottom Line Up Front
    key_findings: List[str]
    strategic_risk_matrix: List[RiskMatrixItem]
    operational_impact: str
    strategic_recommendations: List[str]
    decision_required: str

# 7. Presentation Deck (Slides & Speaker Notes)
class PresentationSlide(BaseModel):
    slide_number: int
    slide_type: str = "content_split" # title, agenda, content_split, matrix, conclusion
    title: str
    bullet_points: List[str]
    visual_layout_recommendation: str
    diagram_mermaid: Optional[str] = None
    speaker_notes: str

class PresentationArtefact(BaseModel):
    deck_title: str
    deck_subtitle: str
    total_slides: int
    slides: List[PresentationSlide]

# 8. SOP & Incident Protocol
class SOPPhase(BaseModel):
    phase_name: str
    responsible_team: str
    action_items: List[str]

class SOPArtefact(BaseModel):
    sop_id: str = "SUNDAY-SOP-OPS-77"
    title: str
    purpose_scope: str
    roles_responsibilities: List[Dict[str, str]]
    phase_actions: List[SOPPhase]
    escalation_matrix: List[Dict[str, str]]

# 9. Press Release
class PressReleaseArtefact(BaseModel):
    headline: str
    dateline: str = "NEW DELHI, INDIA —"
    lead_paragraph: str
    official_quotes: List[Dict[str, str]]
    body_details: List[str]
    boilerplate: str
    media_contact: str

# 10. Technical Whitepaper
class WhitepaperArtefact(BaseModel):
    title: str
    abstract: str
    methodology_and_architecture: str
    empirical_findings: List[str]
    conclusion_future_scope: str
    references: List[str]

# Unified Transformation Result Container
class TransformationResponse(BaseModel):
    request_id: str
    timestamp: str
    source_title: str
    security_classification: str
    hash_sha256: str
    processing_time_sec: float
    parameters_used: Dict[str, Any]
    generated_artefacts: Dict[str, Any] # Keyed by OutputArtefactType
    audit_metadata: Dict[str, Any]
