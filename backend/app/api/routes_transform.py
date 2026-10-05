from fastapi import APIRouter, HTTPException
from backend.app.models.request_models import (
    TransformationRequest,
    RefineRequest,
    OutputArtefactType,
    TargetAudience,
    ToneStyle,
    DetailLevel,
    CommunicationObjective
)
from backend.app.models.response_models import TransformationResponse
from backend.app.services.transformation_service import transformation_service

router = APIRouter(prefix="/transform", tags=["Transformation"])

@router.post("", response_model=TransformationResponse)
async def transform_content(req: TransformationRequest):
    try:
        response = await transformation_service.process_transformation(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transformation failed: {str(e)}")

@router.post("/refine")
async def refine_artefact(req: RefineRequest):
    try:
        result = await transformation_service.refine_artefact(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")

@router.get("/parameters")
def get_transformation_parameters():
    return {
        "audiences": [a.value for a in TargetAudience],
        "tones": [t.value for t in ToneStyle],
        "detail_levels": [d.value for d in DetailLevel],
        "objectives": [o.value for o in CommunicationObjective],
        "languages": [
            "English",
            "Hindi (हिन्दी)",
            "Tamil (தமிழ்)",
            "Telugu (తెలుగు)",
            "Bengali (বাংলা)",
            "Marathi (मराठी)",
            "French (Français)",
            "Spanish (Español)",
            "German (Deutsch)",
            "Russian (Русский)",
            "Arabic (العربية)",
            "Japanese (日本語)"
        ],
        "styles": [
            "SUNDAY Defense Standard",
            "Corporate Executive",
            "Public Broadcast & Social",
            "Academic & Peer-Review",
            "Government Gazette & Legal"
        ],
        "security_classifications": [
            "UNCLASSIFIED",
            "RESTRICTED",
            "CONFIDENTIAL",
            "SECRET",
            "TOP SECRET // SPECIAL"
        ]
    }

@router.get("/formats")
def get_supported_formats():
    return {
        "formats": [
            {
                "id": "video_package",
                "name": "Complete Video Package",
                "icon": "Video",
                "category": "Multimedia",
                "description": "Script, scene storyboard, camera cues, visual prompts, audio narration script, and SRT subtitles."
            },
            {
                "id": "presentation",
                "name": "Presentation Deck",
                "icon": "Presentation",
                "category": "Executive & Briefing",
                "description": "Full slide deck with layouts, key takeaways, diagrams, speaker notes, and downloadable PPTX."
            },
            {
                "id": "advisory",
                "name": "Security & Threat Advisory",
                "icon": "ShieldAlert",
                "category": "Defense & Cyber",
                "description": "SUNDAY standard structured advisory with severity rating, affected assets, technical vectors, and IOCs."
            },
            {
                "id": "executive_summary",
                "name": "Executive Summary (BLUF)",
                "icon": "FileText",
                "category": "Executive & Briefing",
                "description": "1-page strategic brief with Bottom-Line-Up-Front, Risk Matrix, and Action Directives."
            },
            {
                "id": "infographic",
                "name": "Infographic & Diagram",
                "icon": "BarChart3",
                "category": "Visual & Data",
                "description": "Visual layout blueprint, key metric cards, graphic cues, and dynamic Mermaid.js flowchart."
            },
            {
                "id": "linkedin_post",
                "name": "LinkedIn Post",
                "icon": "Linkedin",
                "category": "Social & Engagement",
                "description": "Professional thought-leadership post with high-converting hook, structured bullets, and hashtags."
            },
            {
                "id": "twitter_thread",
                "name": "Twitter / X Thread",
                "icon": "Twitter",
                "category": "Social & Engagement",
                "description": "Multi-part tweet thread with character counters, hooks, media suggestions, and hashtags."
            },
            {
                "id": "sop_incident",
                "name": "SOP & Incident Protocol",
                "icon": "ClipboardList",
                "category": "Operations",
                "description": "Step-by-step Standard Operating Procedure with RACI roles, response phases, and escalation matrix."
            },
            {
                "id": "press_release",
                "name": "Press Release",
                "icon": "Megaphone",
                "category": "Public Communications",
                "description": "Official public announcement with dateline, executive quotes, background, and media contacts."
            },
            {
                "id": "whitepaper",
                "name": "Technical Whitepaper",
                "icon": "BookOpen",
                "category": "R&D & Analysis",
                "description": "Rigorous technical whitepaper with executive abstract, methodology, empirical findings, and references."
            }
        ]
    }
