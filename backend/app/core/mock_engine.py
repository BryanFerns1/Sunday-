import re
import random
from typing import Dict, Any, List
from backend.app.models.request_models import TransformationParameters, OutputArtefactType

def _extract_keywords(text: str, top_n: int = 6) -> List[str]:
    words = re.findall(r'\b[A-Za-z0-9_-]{4,}\b', text)
    stopwords = {"that", "with", "this", "from", "have", "were", "which", "their", "about", "there", "would", "these", "other", "after", "first", "could", "report", "document", "source"}
    filtered = [w for w in words if w.lower() not in stopwords]
    unique = list(dict.fromkeys(filtered))
    return unique[:top_n] if unique else ["National Security", "Cyber Defense", "SUNDAY Intel", "Threat Vector", "Mission Critical"]

def generate_mock_artefact(
    artefact_type: str,
    source_content: str,
    source_title: str,
    params: TransformationParameters
) -> Dict[str, Any]:
    keywords = _extract_keywords(source_content)
    k_str = ", ".join(keywords[:4])
    clean_title = source_title if source_title and source_title != "Source Intelligence Content" else f"{keywords[0] if keywords else 'Critical'} Strategic Intelligence Synthesis"
    
    # 1. VIDEO PACKAGE
    if artefact_type == OutputArtefactType.VIDEO_PACKAGE.value:
        scenes = [
            {
                "scene_number": 1,
                "duration_sec": 15,
                "camera_cue": "Dynamic 3D aerial zoom into SUNDAY Command & Cosundayl Geospatial Grid",
                "visual_description": f"High-contrast cyber radar visualization highlighting activity across {keywords[0] if keywords else 'Critical Sectors'}. Glowing neon alerts indicate anomaly detection.",
                "narration_script": f"Attention operators. We have a priority intelligence briefing regarding {clean_title}. Key telemetry reveals significant developments requiring immediate posture adjustment.",
                "on_screen_text": f"ALERT: {clean_title.upper()}",
                "audio_soundfx": "Subtle low-frequency radar sweep and synthetic UI chime"
            },
            {
                "scene_number": 2,
                "duration_sec": 25,
                "camera_cue": "Split screen technical breakdown: Telemetry logs on left, Threat Architecture on right",
                "visual_description": f"Detailed schematic diagram outlining attack vectors and strategic nodes associated with {k_str}. Dynamic flow arrows indicate payload trajectory.",
                "narration_script": f"Technical analysis indicates coordinated activity focusing on {k_str}. Operational vectors exhibit advanced sophistication, bypassing conventional boundary filters.",
                "on_screen_text": f"VECTORS DETECTED: {k_str.upper()}",
                "audio_soundfx": "Rapid encrypted data stream telemetry sound"
            },
            {
                "scene_number": 3,
                "duration_sec": 25,
                "camera_cue": "Isometric 3D view of defense firewall rings activating in real time",
                "visual_description": "Multi-tier security shielding engages across command network. Green verification badges display across critical infrastructure nodes.",
                "narration_script": f"In accordance with {params.objective.value}, containment countermeasures have been initialized. Zero-trust isolation protocols are actively locking down vulnerable endpoints.",
                "on_screen_text": "DEFENSE POSTURE: CONTAINMENT ACTIVE",
                "audio_soundfx": "System authorization chime and confirmation tone"
            },
            {
                "scene_number": 4,
                "duration_sec": 15,
                "camera_cue": "Wide cinematic shot of SUNDAY operations headquarters with digital watermark",
                "visual_description": f"the Organisation crest with official digital sign-off and classification stamp: {params.security_classification}.",
                "narration_script": f"For continuous updates and complete technical indicators, refer to the full SUNDAY operational dispatch. Stay vigilant, stay secure.",
                "on_screen_text": f"SUNDAY DISPATCH • {params.security_classification}",
                "audio_soundfx": "Authoritative outro score"
            }
        ]
        
        full_narration = " ".join([s["narration_script"] for s in scenes])
        srt = (
            "1\n00:00:00,000 --> 00:00:15,000\nAttention operators. Priority intelligence briefing regarding " + clean_title + ".\n\n"
            "2\n00:00:15,000 --> 00:00:40,000\nTechnical analysis indicates coordinated activity focusing on " + k_str + ".\n\n"
            "3\n00:00:40,000 --> 00:01:05,000\nContainment countermeasures initialized across national infrastructure.\n\n"
            "4\n00:01:05,000 --> 00:01:20,000\nRefer to full SUNDAY operational dispatch. Stay vigilant, stay secure.\n"
        )
        
        return {
            "title": f"Intelligence Broadcast: {clean_title}",
            "duration_estimate": "80 Seconds",
            "target_platform": f"Digital Ops Screen & {params.audience.value}",
            "sub_components": {
                "1_full_script_narration": full_narration,
                "2_scene_storyboard": f"{len(scenes)} fully sequenced operational scenes with timestamp ranges and duration tags",
                "3_visual_recommendations_and_shot_types": f"Dynamic 3D aerial zooms, split-screen telemetry layouts, and isometric firewall renders tailored for {params.audience.value}",
                "4_subtitles_closed_captions": "Standard .SRT timestamped caption sequences synchronized to voiceover narration",
                "5_onscreen_graphics_and_motion_design": f"High-contrast HUD overlays, glowing alert boxes, lower-third titles, and security classification watermark: {params.security_classification}"
            },
            "narration_full_text": full_narration,
            "visual_recommendations_and_shot_types": f"High-contrast visual palette with deep navy and sunrise amber accents. Use wide isometric camera angles for architecture, macro zooms for telemetry anomalies, and broadcast lower-thirds for key takeaways.",
            "motion_design_directions": f"Lower-thirds styled with {params.security_classification} security badges. Use smooth 60fps kinetic typography transitions and HUD telemetry callouts.",
            "scenes": scenes,
            "subtitles_srt": srt,
            "thumbnail_prompt": f"Cinematic cyber command center with futuristic holographic displays showing {k_str}, volumetric lighting, 8k render, photorealistic defense aesthetic",
            "audio_voiceover_ready": True
        }

    # 2. LINKEDIN POST
    elif artefact_type == OutputArtefactType.LINKEDIN_POST.value:
        hook = f"🚨 Critical Intelligence Update: Navigating the strategic implications of {clean_title}."
        core = f"""In today's interconnected landscape, resilience requires continuous transformation and rapid synthesis of mission-critical data.

Key technical vectors identified around {k_str} demonstrate why automated intelligence workflows are no longer optional—they are essential for national security and enterprise readiness.

Here are the 3 critical takeaways from our latest operational analysis:
🔹 Proactive Surface Hardening: Traditional static defenses fall short against coordinated adversary maneuvers.
🔹 Automated Synthesis: Reducing analysis latency from hours to seconds enables instant strategic counter-measures.
🔹 Multi-Tier Collaboration: Cross-domain coordination across technical, operational, and executive levels is paramount."""

        takeaways = [
            f"Accelerated telemetry analysis regarding {k_str}",
            "Zero-trust protocol enforcement across operational nodes",
            "Rapid multi-format artefact generation for executive decision support"
        ]
        
        cta = f"How is your organization adapting its threat transformation pipelines to address emerging developments in {keywords[0] if keywords else 'cyber warfare'}? Let's discuss in the comments below."
        hashtags = ["#SUNDAY", "#NationalSecurity", "#CyberIntelligence", "#SmartAutomation", "#GovTech", "#DefenseInnovation"]
        full_text = f"{hook}\n\n{core}\n\nKey Highlights:\n" + "\n".join([f"• {t}" for t in takeaways]) + f"\n\n{cta}\n\n" + " ".join(hashtags)

        return {
            "hook": hook,
            "core_narrative": core,
            "key_takeaways": takeaways,
            "call_to_action": cta,
            "hashtags": hashtags,
            "image_prompt": f"Infographic graphic showing secure cyber shield protecting critical data pipelines, corporate tech style with cyan and navy gradients",
            "full_text": full_text
        }

    # 3. TWITTER / X THREAD
    elif artefact_type == OutputArtefactType.TWITTER_THREAD.value:
        tweets = [
            {
                "tweet_number": 1,
                "text": f"🧵 1/5 THREAD: Operational Briefing on {clean_title}.\n\nAs threat vectors evolve around {k_str}, here is a breakdown of what security leaders and operators need to know right now 👇",
                "character_count": 182,
                "media_prompt": "Title card graphic with SUNDAY alert badge"
            },
            {
                "tweet_number": 2,
                "text": f"2/5 🔍 THE ANATOMY:\nTelemetry highlights targeted exploitation focusing on {keywords[0] if keywords else 'core'} systems. Adversaries are leveraging sophisticated staging to bypass legacy perimeter detection.",
                "character_count": 218,
                "media_prompt": "Technical attack vector flow diagram"
            },
            {
                "tweet_number": 3,
                "text": f"3/5 ⚡ STRATEGIC IMPACT:\nObjective: {params.objective.value}.\nEntities in critical infrastructure, telecommunications, and defense networks must immediately audit perimeter logs for indicators.",
                "character_count": 196,
                "media_prompt": "Impact severity matrix chart"
            },
            {
                "tweet_number": 4,
                "text": f"4/5 🛡️ MITIGATION CHECKLIST:\n✅ Isolate unverified ingress points\n✅ Deploy real-time IOC signature rules\n✅ Enforce multi-factor zero-trust validation\n✅ Coordinate with CERT/SUNDAY incident wings",
                "character_count": 212,
                "media_prompt": "Actionable checklist visual"
            },
            {
                "tweet_number": 5,
                "text": f"5/5 📌 SUMMARY:\nProactive posture and automated content transformation ensure rapid response across all operational tiers.\n\nRead the full advisory on the SUNDAY portal. Stay vigilant! 🇮🇳 #CyberSecurity #SUNDAY",
                "character_count": 210,
                "media_prompt": "SUNDAY Cyber Operations crest"
            }
        ]
        full_thread = "\n\n---\n\n".join([f"[{t['tweet_number']}/5] ({t['character_count']} chars)\n{t['text']}" for t in tweets])

        return {
            "thread_title": f"Operational Briefing: {clean_title}",
            "total_tweets": len(tweets),
            "tweets": tweets,
            "full_thread_text": full_thread
        }

    # 4. STRUCTURED ADVISORY (SUNDAY STANDARD)
    elif artefact_type == OutputArtefactType.ADVISORY.value:
        adv_num = random.randint(1000, 9999)
        return {
            "advisory_id": f"SUNDAY-ADV-2026-{adv_num}",
            "title": f"DEFENSE & THREAT ADVISORY: {clean_title.upper()}",
            "severity": "CRITICAL" if "alert" in params.objective.value.lower() or "critical" in params.tone.value.lower() else "HIGH",
            "cvss_score": "9.4",
            "affected_systems": [
                f"Core Infrastructure involving {keywords[0] if keywords else 'Critical Gateways'}",
                "SCADA & Operational Technology (OT) Networks",
                "National Telemetry & Satellite Communications Ground Stations",
                "Secure Enterprise Directory Services"
            ],
            "threat_actors": f"Identified Advanced Vector / APT Focus ({keywords[1] if len(keywords)>1 else 'Classified'})",
            "executive_summary": f"The Organisation has identified active exploitation patterns and operational vulnerabilities pertaining to {clean_title}. Immediate isolation, patch verification, and forensic telemetry monitoring are mandated across all designated critical sectors.",
            "technical_analysis": f"Forensic analysis reveals adversaries leveraging multifaceted persistence mechanisms centered on {k_str}. Initial ingress is achieved via weaponized protocol exploitation followed by lateral movement utilizing living-off-the-land (LotL) binaries. Memory-resident payloads evade conventional signature detection.",
            "indicators_of_compromise": [
                {"type": "SHA-256", "value": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "description": "Staged persistence loader binary"},
                {"type": "SHA-256", "value": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069", "description": "Encrypted telemetry exfiltration module"},
                {"type": "IPv4 / C2", "value": "198.51.100.44:8443", "description": "Primary Command & Cosundayl rendezvous node"},
                {"type": "Domain", "value": f"telemetry-sync-{keywords[0].lower() if keywords else 'sec'}.sunday-alert.example", "description": "Dynamic DNS resolution beacon"}
            ],
            "mitigation_steps": [
                "1. Isolate all affected ingress points and apply immediate network segmentation to critical SCADA/OT segments.",
                "2. Ingest provided SHA-256 signatures into SIEM/EDR platforms with automated block rules enabled.",
                "3. Terminate all active unauthorized remote sessions and rotate privileged domain administrator credentials.",
                "4. Enforce mandatory zero-trust mutual TLS (mTLS) authentication across internal service boundaries.",
                "5. Report any anomalous lateral traffic matching the IOC signatures directly to SUNDAY Cyber Operations Wing."
            ],
            "references": [
                "SUNDAY National Cyber Security Architecture Standard v4.2",
                "CERT-In Advisory CIAD-2026-0041",
                "MITRE ATT&CK Framework: T1059 (Command and Scripting Interpreter), T1078 (Valid Accounts)"
            ],
            "compliance_signoff": f"DIRECTOR OF CYBER OPERATIONS, SUNDAY // CLASSIFICATION: {params.security_classification}"
        }

    # 5. INFOGRAPHIC SPECIFICATION
    elif artefact_type == OutputArtefactType.INFOGRAPHIC.value:
        mermaid_chart = f"""graph TD
    A[Source Ingestion: {keywords[0] if keywords else 'Data'}] --> B[AI Transformation Engine]
    B --> C{{Target Parameter Matrix}}
    C -->|Audience: {params.audience.value[:14]}| D[Executive Brief]
    C -->|Objective: {params.objective.value[:14]}| E[Security Advisory]
    C -->|Format: Multi-Artefact| F[Video & Presentation]
    D --> G[Rapid Decision Action]
    E --> H[Infrastructure Defense]
    F --> I[Operational Readiness]

    style A fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#fff
    style B fill:#0f172a,stroke:#38bdf8,stroke-width:3px,color:#38bdf8
    style C fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#fff
    style D fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    style E fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fff
    style F fill:#78350f,stroke:#f59e0b,stroke-width:2px,color:#fff
"""
        return {
            "title": f"INFOGRAPHIC: {clean_title}",
            "theme_palette": "Cyber Defense Matrix (Deep Navy #0f172a, Cyan #0ea5e9, Alert Red #ef4444, Emerald #10b981)",
            "visual_layout_structure": "3-Tier Vertical Flow: Executive KPI Row -> Telemetry Flow Architecture -> Strategic Response Matrix",
            "key_metrics": [
                {"metric": "99.8%", "label": "Transformation Accuracy", "trend": "+12.4%"},
                {"metric": "< 1.4s", "label": "Mean Synthesis Latency", "trend": "-84.0%"},
                {"metric": "100%", "label": "Air-Gap Defense Readiness", "trend": "STABLE"},
                {"metric": "10x", "label": "Operational Efficiency Gain", "trend": "+450%"}
            ],
            "mermaid_diagram": mermaid_chart,
            "visual_prompts": [
                f"High-resolution 3D isometric diagram of multi-layer cyber shield intercepting threats related to {k_str}",
                "Sleek futuristic dashboard with glowing circular telemetry dials and national security crest",
                "Data pipeline visualization showing raw intelligence transforming into multi-format deliverable pods"
            ],
            "key_messaging_points": [
                f"Automated intelligence synthesis for {clean_title}",
                f"Unified dissemination targeting {params.audience.value}",
                f"Zero-latency multi-artefact generation aligned with {params.objective.value}"
            ]
        }

    # 6. EXECUTIVE SUMMARY / BRIEFING
    elif artefact_type == OutputArtefactType.EXECUTIVE_SUMMARY.value:
        return {
            "title": f"EXECUTIVE BRIEFING: {clean_title.upper()}",
            "bluf": f"BLUF (Bottom Line Up Front): Emerging intelligence regarding {clean_title} necessitates immediate executive awareness and proactive counter-strategy. Implementing automated synthesis and zero-trust perimeter lockdowns eliminates 95% of operational exposure with zero mission downtime.",
            "key_findings": [
                f"Identified core vectors centered on {k_str} with potential to impact multi-domain operations.",
                f"Current mitigation posture requires alignment with {params.objective.value} across all active operational sectors.",
                f"Transformation efficiency is maximized by delivering tailored artefacts directly to {params.audience.value}."
            ],
            "strategic_risk_matrix": [
                {"risk_item": f"Operational Disruption in {keywords[0] if keywords else 'Core Sector'}", "impact": "Critical", "likelihood": "High", "mitigation_owner": "SUNDAY Cyber Command"},
                {"risk_item": "Information Asymmetry Across Tiers", "impact": "High", "likelihood": "Moderate", "mitigation_owner": "Communications Directorate"},
                {"risk_item": "Telemetry Exfiltration Vector", "impact": "Critical", "likelihood": "Low (Post-Mitigation)", "mitigation_owner": "Infrastructure Defense"}
            ],
            "operational_impact": f"Failure to enact timely transformation of intelligence leads to severe response latency. With automated generation in place, decision cycles are compressed from 8 hours to under 3 minutes, preserving strategic advantage.",
            "strategic_recommendations": [
                f"1. Executive Directive: Mandate immediate audit of all nodes associated with {k_str}.",
                f"2. Inter-Agency Dissemination: Authorize multi-channel distribution of structured advisories to defense liaisons.",
                "3. Resilience Automation: Institutionalize the SUNDAY automated transformation platform for all incoming intelligence streams."
            ],
            "decision_required": "Approval requested from Executive Authority to activate Phase-1 National Hardening Protocols and issue coordinated inter-agency directives."
        }

    # 7. PRESENTATION (SLIDES & SPEAKER NOTES)
    elif artefact_type == OutputArtefactType.PRESENTATION.value:
        slides = [
            {
                "slide_number": 1,
                "slide_type": "title",
                "title": clean_title,
                "bullet_points": [
                    "the Organisation",
                    f"Target Audience: {params.audience.value}",
                    f"Classification: {params.security_classification}",
                    f"Strategic Objective: {params.objective.value}"
                ],
                "visual_layout_recommendation": "Dark tactical background with glowing SUNDAY emblem, bold central typography, and digital security badge",
                "diagram_mermaid": None,
                "speaker_notes": f"Good morning members of the board and senior leadership. Today we present an automated intelligence briefing on {clean_title}, synthesized directly through our AI Transformation Engine."
            },
            {
                "slide_number": 2,
                "slide_type": "content_split",
                "title": "Context & Threat Landscape",
                "bullet_points": [
                    f"Core operational context: {k_str}",
                    "Surge in multi-vector telemetry requiring rapid analysis",
                    "Traditional manual processing creates an unacceptable 6-8 hour latency window",
                    "Need for automated, multi-audience delivery across all mission branches"
                ],
                "visual_layout_recommendation": "Left column: Problem Statement & Context; Right column: Key Risk Indicators with color-coded severity pill badges",
                "diagram_mermaid": None,
                "speaker_notes": "Examining the broader landscape, we observe sophisticated activities targeting critical nodes. Our priority is eliminating information friction across leadership and operational units."
            },
            {
                "slide_number": 3,
                "slide_type": "matrix",
                "title": "Technical Architecture & Vectors",
                "bullet_points": [
                    f"Primary Vector: Exploitation targeting {keywords[0] if keywords else 'Core Protocol'}",
                    f"Secondary Vector: Lateral staging across {keywords[1] if len(keywords)>1 else 'Perimeter Network'}",
                    "Detection Efficacy: 99.8% with zero-trust automated telemetry",
                    "Impact Mitigation: Real-time IOC distribution and automated firewall rule deployment"
                ],
                "visual_layout_recommendation": "3-column architecture diagram showing Ingress -> AI Processing -> Defense Isolation",
                "diagram_mermaid": "graph LR\n  Ingress[Threat Telemetry] --> AI[SUNDAY Engine]\n  AI --> Isolate[Automated Isolation]\n  AI --> Alert[Real-time Advisory]",
                "speaker_notes": "This architecture slide depicts the technical flow. By deploying automated heuristic processing, the system isolates anomalous behaviors before lateral movement occurs."
            },
            {
                "slide_number": 4,
                "slide_type": "content_split",
                "title": "Strategic Recommendations & Next Steps",
                "bullet_points": [
                    f"Immediate: Distribute structured advisories to all {params.audience.value}",
                    "Short-term: Integrate multi-modal ingestion for all incoming defense feeds",
                    "Long-term: Full air-gapped deployment of Gen AI Transformation Engine",
                    "Compliance: 100% adherence to national security standards"
                ],
                "visual_layout_recommendation": "Numbered milestone roadmap with glowing progression checkpoints and responsibility tags",
                "diagram_mermaid": None,
                "speaker_notes": "Here we outline our actionable roadmap. We recommend immediate sanction of the Phase-1 rollout to ensure unbroken defense posture across all active sectors."
            },
            {
                "slide_number": 5,
                "slide_type": "conclusion",
                "title": "Conclusion & Action Items",
                "bullet_points": [
                    f"Intelligence synthesis complete for {clean_title}",
                    "All requested artefacts generated and validated for dissemination",
                    "Floor open for executive queries and operational sanctions"
                ],
                "visual_layout_recommendation": "Bold summary card with contact points, SUNDAY insignia, and export download links",
                "diagram_mermaid": None,
                "speaker_notes": "Thank you for your attention. The operational artefacts are ready for immediate deployment. I am now open to questions from the executive committee."
            }
        ]
        return {
            "deck_title": clean_title,
            "deck_subtitle": f"SUNDAY Automated Intelligence Transformation Briefing • {params.security_classification}",
            "total_slides": len(slides),
            "slides": slides
        }

    # 8. SOP & INCIDENT RESPONSE PROTOCOL
    elif artefact_type == OutputArtefactType.SOP_INCIDENT.value:
        return {
            "sop_id": f"SUNDAY-SOP-OPS-{random.randint(500, 999)}",
            "title": f"STANDARD OPERATING PROCEDURE: {clean_title.upper()}",
            "purpose_scope": f"Establishes binding procedural protocols for identifying, containing, and remediating operational incidents associated with {k_str}.",
            "roles_responsibilities": [
                {"role": "Incident Commander (IC)", "duty": "Overall tactical authority and executive reporting"},
                {"role": "Lead Threat Hunter", "duty": f"Forensic analysis and telemetry tracing of {keywords[0] if keywords else 'threat'} vectors"},
                {"role": "DevSecOps Engineer", "duty": "Execution of firewall rules and subnet quarantine"},
                {"role": "Communications Officer", "duty": f"Dissemination of tailored advisories to {params.audience.value}"}
            ],
            "phase_actions": [
                {
                    "phase_name": "Phase 1: Verification & Triage",
                    "responsible_team": "SOC Tier-2",
                    "action_items": [
                        f"Validate telemetry anomalies against known baselines for {k_str}.",
                        "Verify digital signatures and integrity hashes of incoming dispatches.",
                        "Establish incident bridge and log initial incident timestamp."
                    ]
                },
                {
                    "phase_name": "Phase 2: Active Containment",
                    "responsible_team": "Network Defense Wing",
                    "action_items": [
                        "Isolate affected subnet segments without powering down hardware (preserve volatile RAM).",
                        "Enforce strict firewall ingress deny rules for all identified IOC IPs.",
                        "Revoke active Kerberos and OAuth authentication tokens for flagged service accounts."
                    ]
                },
                {
                    "phase_name": "Phase 3: Eradication & Recovery",
                    "responsible_team": "Systems Engineering",
                    "action_items": [
                        "Deploy verified security patches and hotfixes to all vulnerable endpoints.",
                        "Perform full cryptographic integrity check of system binaries.",
                        "Gradually restore network routing while maintaining heightened packet logging."
                    ]
                },
                {
                    "phase_name": "Phase 4: Post-Incident Review & Automation",
                    "responsible_team": "SUNDAY AI Operations",
                    "action_items": [
                        "Ingest incident telemetry into AI Transformation Engine for automated post-mortem synthesis.",
                        "Generate Executive Briefing and Advisory packages for inter-agency archival.",
                        "Update automated detection rules in SIEM within 12 hours of closure."
                    ]
                }
            ],
            "escalation_matrix": [
                {"level": "Tier 1 (SOC Shift Lead)", "threshold": "Initial anomaly detection < 15 mins", "contact": "contact@example.invalid"},
                {"level": "Tier 2 (Head of Cyber Defense)", "threshold": "Confirmed lateral movement < 30 mins", "contact": "contact@example.invalid"},
                {"level": "Tier 3 (National Security Council / Director)", "threshold": "Critical infrastructure impact", "contact": "contact@example.invalid"}
            ]
        }

    # 9. PRESS RELEASE
    elif artefact_type == OutputArtefactType.PRESS_RELEASE.value:
        return {
            "headline": f"SUNDAY Announces Advanced Transformation & Strategic Synthesis on {clean_title}",
            "dateline": "NEW DELHI, INDIA —",
            "lead_paragraph": f"The Organisation, Government of India, today announced comprehensive strategic measures and automated intelligence frameworks addressing recent developments in {clean_title}. The initiative reflects India's steadfast commitment to cutting-edge smart automation, national technological resilience, and transparent stakeholder communication.",
            "official_quotes": [
                {
                    "speaker": "Senior Official, the Organisation",
                    "quote": f"By harnessing state-of-the-art Generative AI for automated content transformation, SUNDAY is transforming how strategic information is synthesized and communicated across diverse national stakeholders with unmatched precision and speed."
                }
            ],
            "body_details": [
                f"The strategic response centers on advanced telemetry monitoring, zero-trust infrastructure protocols, and automated multi-format dissemination targeting {params.audience.value}.",
                f"Key areas of emphasis include {k_str}, ensuring robust protection for critical national information infrastructure.",
                "The platform enables simultaneous generation of executive briefings, technical advisories, interactive presentations, and public awareness materials from unified source intelligence."
            ],
            "boilerplate": "About SUNDAY: The Organisation is a premier technical intelligence agency under the National Security Advisor in the Prime Minister's Office, Government of India, entrusted with critical technological research and cyber defense capabilities.",
            "media_contact": "Strategic Communications | contact@example.invalid | sunday.example"
        }

    # 10. TECHNICAL WHITEPAPER
    elif artefact_type == OutputArtefactType.WHITEPAPER.value:
        return {
            "title": f"TECHNICAL WHITEPAPER: Automated Content Transformation & Strategic Analysis of {clean_title}",
            "abstract": f"This whitepaper presents a formal empirical study and architectural blueprint for automated content transformation in mission-critical defense environments. Focusing on {k_str}, we evaluate multi-modal ingestion pipelines, prompt taxonomy architectures, and real-time synthesis algorithms that reduce latency from hours to seconds while maintaining 100% semantic fidelity and domain precision.",
            "methodology_and_architecture": f"Our system employs a modular multi-agent orchestration pipeline. High-dimensional source embeddings are extracted from multi-modal inputs (text, structured reports, audio, and visual diagrams). The transformation matrix decomposes the source semantics along five orthogonal axes: Target Audience ({params.audience.value}), Tone ({params.tone.value}), Language ({params.language}), Detail Level ({params.detail_level.value}), and Objective ({params.objective.value}). Fine-tuned schemas enforce strict deterministic serialization into target deliverable structures.",
            "empirical_findings": [
                f"Empirical benchmark across 500 intelligence documents demonstrated a 99.8% schema adherence rate.",
                "End-to-end synthesis latency reduced by 94.2% compared to traditional manual human editorial pipelines.",
                f"Multi-artefact parallel generation scaled linearly with zero cross-contamination of domain contexts.",
                f"High-fidelity preservation of critical threat telemetry including CVE tags, CVSS ratings, and SHA-256 hashes."
            ],
            "conclusion_future_scope": "The deployment of automated Gen AI content transformation marks a paradigm shift in national intelligence agility. Future work will explore real-time air-gapped on-device neural synthesis and automated cryptographic watermarking for all synthesized defense artefacts.",
            "references": [
                "SUNDAY Technical Monograph Series, Vol 14, 2026.",
                "IEEE Transactions on Dependable and Secure Computing, 'Automated Threat Intelligence Synthesis', 2025.",
                "National Cyber Coordination Centre (NCCC) Technical Framework v3.1."
            ]
        }

    return {"title": clean_title, "content": f"Synthesized artefact for {artefact_type} based on {k_str}"}
