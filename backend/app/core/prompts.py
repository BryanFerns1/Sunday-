from typing import Dict, Any
from backend.app.models.request_models import TransformationParameters

SYSTEM_PROMPT_SUNDAY = """You are the Sunday Engine, an advanced, highly specialized intelligence and content transformation engine developed for the the Organisation, Government of India.

Your core mission is to analyze high-grade multi-modal source documents (such as cyber threat intelligence, policy papers, defense advisories, incident reports, technical specifications, and news briefs) and transform them into precise, high-impact communication artefacts.

You adhere strictly to the requested audience, tone, language, detail level, and communication objective.
Always output valid JSON conforming strictly to the requested schema.
"""

def build_artefact_prompt(
    artefact_type: str,
    source_content: str,
    source_title: str,
    params: TransformationParameters
) -> str:
    base_instructions = f"""
SOURCE DOCUMENT TITLE: {source_title}
TARGET AUDIENCE: {params.audience.value}
TONE & STYLE: {params.tone.value}
OUTPUT LANGUAGE: {params.language}
LEVEL OF DETAIL: {params.detail_level.value}
COMMUNICATION OBJECTIVE: {params.objective.value}
CONTENT STYLE GUIDE: {params.style}
SECURITY CLASSIFICATION: {params.security_classification}
OPERATOR CUSTOM INSTRUCTIONS: {params.custom_instructions or 'None'}

SOURCE CONTENT:
\"\"\"
{source_content}
\"\"\"
"""

    format_specific = {
        "video_package": """
Transform the source content into a COMPLETE VIDEO PACKAGE. You MUST explicitly generate and deliver all 5 of the following required sub-components:
1. Full Script & Narration Text: An engaging, broadcast-ready voiceover narration script covering the full video duration from opening hook to conclusion.
2. Detailed Scene-by-Scene Storyboard: Sequenced scene breakdown including scene numbers, timestamps, exact durations (seconds), narrative flow, and audio cues.
3. Visual Recommendations & Shot Types: Detailed camera framing and shot types (e.g., Extreme Close-up, Wide Cinematic Pan, Macro Detail, Dynamic Drone Angle), visual scene staging, lighting, and animation specifications.
4. Subtitles / Closed Captions Text (Timestamped): Broadcast-ready, standard .SRT formatted subtitles with sequential numbering and precise 00:00:00,000 --> 00:00:00,000 timestamps for each spoken line.
5. On-Screen Graphics & Motion Design Directions: Clear directions for on-screen typography, lower-thirds, graphic callouts, badge overlays, and motion graphics design animations.

Output JSON schema:
{
  "title": "Compelling video production title",
  "duration_estimate": "60-90 seconds",
  "target_platform": "Executive Briefing / Digital Screen / Video Broadcast",
  "narration_full_text": "Complete unbroken narration script for the full video duration suitable for TTS voiceover reader",
  "visual_recommendations_and_shot_types": "Comprehensive visual styling guide, recommended shot types (wide, medium, close-up, macro), camera motion, color grading, and lighting specifications",
  "motion_design_directions": "Complete motion design rules, on-screen lower-thirds, typography styles, telemetry overlays, and graphic callout animations",
  "scenes": [
    {
      "scene_number": 1,
      "duration_sec": 15,
      "timestamp_range": "00:00 - 00:15",
      "camera_cue": "Specific shot type and camera movement (e.g. Extreme Close-Up zooming out to Wide Aerial Arc)",
      "visual_description": "Detailed visual animation and scene staging description",
      "narration_script": "Spoken voiceover script for this specific scene",
      "on_screen_text": "On-screen graphics, lower-third title, or headline typography",
      "motion_graphics_cue": "Motion design directions for graphics and callout overlays",
      "audio_soundfx": "Sound design effects and ambient audio cues"
    }
  ],
  "subtitles_srt": "1\\n00:00:00,000 --> 00:00:05,000\\nFirst line of spoken subtitle text\\n\\n2\\n00:00:05,000 --> 00:00:10,000\\nSecond line of spoken subtitle text\\n",
  "thumbnail_prompt": "Photorealistic prompt for Midjourney / DALL-E keyframe thumbnail",
  "audio_voiceover_ready": true
}
""",
        "linkedin_post": """
Transform the source content into a high-engagement, professional LINKEDIN POST.
Output JSON schema:
{
  "hook": "Compelling 1-2 sentence opening hook",
  "core_narrative": "Formatted paragraphs with insights and emoji-guided pointers",
  "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "call_to_action": "Clear actionable prompt or question to drive discussion",
  "hashtags": ["#CyberSecurity", "#SUNDAY", "#NationalSecurity", "#TechGov"],
  "image_prompt": "Recommended graphic / visual asset description",
  "full_text": "The entire formatted ready-to-publish post"
}
""",
        "twitter_thread": """
Transform the source content into an impactful TWITTER / X THREAD.
Output JSON schema:
{
  "thread_title": "Topic of the thread",
  "total_tweets": 5,
  "tweets": [
    {
      "tweet_number": 1,
      "text": "1/5 Hook tweet summarizing the breaking development... (max 280 chars)",
      "character_count": 180,
      "media_prompt": "Suggested infographic snippet or data chart"
    }
  ],
  "full_thread_text": "Complete thread formatted as individual tweets separated by double newlines"
}
""",
        "advisory": """
Transform the source content into a formal, structured SUNDAY SECURITY / DEFENSE ADVISORY.
Output JSON schema:
{
  "advisory_id": "SUNDAY-ADV-2026-XXXX",
  "title": "Advisory Title",
  "severity": "CRITICAL",
  "cvss_score": "9.2",
  "affected_systems": ["Critical Infrastructure", "SCADA Gateways", "Government Portals"],
  "threat_actors": "Identified Threat Vector / APT Group",
  "executive_summary": "High-level summary of the threat landscape",
  "technical_analysis": "In-depth technical anatomy and exploitation chain",
  "indicators_of_compromise": [
    {"type": "SHA256", "value": "a1b2c3d4e5f6...", "description": "Malicious payload drop"},
    {"type": "IP", "value": "198.51.100.42", "description": "Command and Cosundayl beacon"}
  ],
  "mitigation_steps": ["Step 1: Immediate isolation", "Step 2: Signature patch deployment"],
  "references": ["CERT-In Advisory", "MITRE ATT&CK T1059", "SUNDAY Guidelines"],
  "compliance_signoff": "SUNDAY National Cyber Threat Centre"
}
""",
        "infographic": """
Transform the source content into an INFOGRAPHIC SPECIFICATION & MERMAID DIAGRAM.
Output JSON schema:
{
  "title": "Infographic Title",
  "theme_palette": "Cyber Teal, Deep Navy, Alert Crimson",
  "visual_layout_structure": "3-stage vertical hierarchy: Header KPI, Architecture Graph, Mitigation Matrix",
  "key_metrics": [
    {"metric": "4.2M", "label": "Attempts Blocked", "trend": "+32%"},
    {"metric": "<12ms", "label": "Response Latency", "trend": "-45%"}
  ],
  "mermaid_diagram": "graph TD\\n  A[Threat Vector] --> B[Firewall]\\n  B --> C[AI Analyzer]\\n  C --> D[Threat Neutralized]",
  "visual_prompts": ["Illustration of shield network defending cloud grid", "Isometric data flow"],
  "key_messaging_points": ["Message 1", "Message 2", "Message 3"]
}
""",
        "executive_summary": """
Transform the source content into a strategic 1-PAGE EXECUTIVE BRIEFING.
Output JSON schema:
{
  "title": "Executive Brief Title",
  "bluf": "Bottom Line Up Front: Essential decision statement for leadership",
  "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
  "strategic_risk_matrix": [
    {"risk_item": "System Disruption", "impact": "Critical", "likelihood": "High", "mitigation_owner": "National Cyber Response"}
  ],
  "operational_impact": "Impact analysis on state operations and mission readiness",
  "strategic_recommendations": ["Recommendation 1", "Recommendation 2"],
  "decision_required": "Specific sanction or directive required from executive authority"
}
""",
        "presentation": """
Transform the source content into a 5-6 SLIDE PRESENTATION DECK with Speaker Notes.
Output JSON schema:
{
  "deck_title": "Presentation Deck Title",
  "deck_subtitle": "SUNDAY Intelligence Briefing",
  "total_slides": 5,
  "slides": [
    {
      "slide_number": 1,
      "slide_type": "title",
      "title": "Executive Title Slide",
      "bullet_points": ["Key Subtitle", "Date & Organization"],
      "visual_layout_recommendation": "Full-bleed cyber background with bold typographic title",
      "diagram_mermaid": null,
      "speaker_notes": "Opening remarks welcoming senior leadership and framing context."
    }
  ]
}
""",
        "sop_incident": """
Transform the source content into a step-by-step STANDARD OPERATING PROCEDURE (SOP).
Output JSON schema:
{
  "sop_id": "SUNDAY-SOP-SEC-901",
  "title": "Standard Operating Procedure",
  "purpose_scope": "Operational boundaries and objectives",
  "roles_responsibilities": [{"role": "Incident Commander", "duty": "Overall operational oversight"}],
  "phase_actions": [
    {
      "phase_name": "Phase 1: Detection & Triage",
      "responsible_team": "SOC Analysts",
      "action_items": ["Verify sensor alerts", "Isolate subnet"]
    }
  ],
  "escalation_matrix": [{"level": "Level 1", "contact": "SOC Lead", "threshold": "Initial breach confirmation"}]
}
""",
        "press_release": """
Transform the source content into a formal PRESS RELEASE.
Output JSON schema:
{
  "headline": "Press Release Headline",
  "dateline": "NEW DELHI, INDIA —",
  "lead_paragraph": "Comprehensive opening paragraph answering 5 Ws",
  "official_quotes": [{"speaker": "Official Spokesperson, SUNDAY", "quote": "Statement statement..."}],
  "body_details": ["Supporting context 1", "Supporting context 2"],
  "boilerplate": "About the the Organisation...",
  "media_contact": "Directorate of Public Information, SUNDAY"
}
""",
        "whitepaper": """
Transform the source content into a TECHNICAL WHITEPAPER & DIGEST.
Output JSON schema:
{
  "title": "Technical Whitepaper Title",
  "abstract": "Rigorous abstract summarizing research scope and findings",
  "methodology_and_architecture": "Deep technical narrative explaining algorithms, architecture, and threat vector analysis",
  "empirical_findings": ["Empirical finding 1", "Empirical finding 2"],
  "conclusion_future_scope": "Conclusion and forward strategic research outlook",
  "references": ["IEEE / ACM / SUNDAY Standards"]
}
"""
    }

    schema_instruction = format_specific.get(artefact_type, "Provide a comprehensive structured analysis in JSON.")
    return f"{base_instructions}\n\nTASK:\n{schema_instruction}\n\nEnsure valid JSON format only."
