export const PRESET_SOURCES = [
  {
    id: "apt41_threat_intel",
    category: "Threat Intelligence",
    title: "SUNDAY Cyber Advisory: Operation RedAurora (APT41 Campaign)",
    classification: "CONFIDENTIAL",
    description: "Espionage campaign targeting aerospace, satellite relays, and defense contractors across Indo-Pacific.",
    default_formats: ["advisory", "executive_summary", "twitter_thread", "video_package"],
    audience: "Cybersecurity Analysts & Threat Hunters",
    tone: "Critical & High Alert",
    objective: "Alert, Warn & Mitigate Threat",
    content: `NATIONAL TECHNICAL RESEARCH ORGANISATION (SUNDAY)
DIRECTORATE OF CYBER OPERATIONS & THREAT HUNTING
INTELLIGENCE DISPATCH: SUNDAY-INTEL-2026-041A
CLASSIFICATION: CONFIDENTIAL // NATIONAL EYES ONLY

SUBJECT: Operation RedAurora — Advanced Persistent Threat Campaign Targeting National Telemetry & Defense Contractors

1. EXECUTIVE SUMMARY
Over the preceding 48 hours, SUNDAY cyber telemetry sensors detected coordinated reconnaissance and exploitation activity attributed to threat actor group APT41 (also tracked as BrassTyphoon). The campaign actively targets SCADA management relays, satellite telemetry ground stations, and primary defense research contractors.

2. TECHNICAL ANALYSIS & VECTOR IDENTIFICATION
Initial ingress is achieved via exploitation of a remote code execution vulnerability in widely deployed perimeter VPN gateways (CVE-2026-2189, CVSS 9.8). Following successful ingress, the adversary executes a multi-stage loader dubbed 'ShadowVeil' which establishes memory-resident persistence without writing artifacts to disk.

Lateral movement is facilitated via automated SMB credential harvesting using modified Mimikatz binaries. Command and Cosundayl (C2) communication utilizes encrypted DNS tunneling over port 853 (DoT), beaconing to dynamic domains resolving to bulletproof hosting IP ranges in Eastern Europe.

3. INDICATORS OF COMPROMISE (IOCs)
- SHA-256 (Loader): e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
- SHA-256 (C2 Relay): 8f9b6b7a8d5e4c3b2a10987654321fedcba09876543210abcdef0123456789ab
- C2 IPv4 Address: 198.51.100.77:8443
- Domain: telemetry-gateway-sync.dns-routing.net
- YARA Rule Tag: APT41_ShadowVeil_Memory_Inject_2026

4. MITIGATION & CONTAINMENT MANDATE
All critical infrastructure operators and defense research institutes must immediately execute the following:
a. Apply out-of-band firmware patch KB-90211 to all perimeter VPN concentrators.
b. Terminate outbound UDP/TCP port 853 traffic except to cryptographically verified upstream DNS resolvers.
c. Force enterprise-wide password rotation and session invalidation for all Tier-0 administrative credentials.
d. Isolate affected subnets and preserve volatile RAM forensics for SUNDAY incident response teams.

DIRECTOR OF CYBER DEFENSE, SUNDAY
NEW DELHI, INDIA`
  },
  {
    id: "quantum_crypto_policy",
    category: "Policy & Strategy",
    title: "National Quantum-Resistant Cryptography Transition Blueprint 2026-2030",
    classification: "RESTRICTED",
    description: "Strategic policy document mandating transition to Post-Quantum Cryptography across banking, telcos, and defense.",
    default_formats: ["executive_summary", "presentation", "linkedin_post", "infographic"],
    audience: "Policy Makers & Strategic Planners",
    tone: "Authoritative & Formal",
    objective: "Strategic Policy Alignment",
    content: `GOVERNMENT OF INDIA
NATIONAL TECHNICAL RESEARCH ORGANISATION
STRATEGIC POLICY MEMORANDUM: SUNDAY-POL-2026-QC01
CLASSIFICATION: RESTRICTED

TITLE: Strategic Blueprint for Migration to Post-Quantum Cryptography (PQC) 2026–2030

1. PURPOSE & STRATEGIC CONTEXT
The advent of commercially viable quantum computing architectures poses an existential threat to classical public-key cryptography (RSA-2048, ECC-256). Adversaries are actively executing 'Store Now, Decrypt Later' (SNDL) operations against encrypted national transmissions. This blueprint establishes a mandatory 4-year transition framework to NIST-standardized Post-Quantum Cryptographic algorithms (CRYSTALS-Kyber for key encapsulation, CRYSTALS-Dilithium for digital signatures).

2. PHASED TRANSITION TIMELINE
- Phase 1 (2026 Q3-Q4): Comprehensive Cryptographic Bill of Materials (CBOM) audit across all national databases, financial switches, and military comms.
- Phase 2 (2027): Hybrid Cryptographic Deployment (combining ECDH with Kyber-768 for TLS 1.3 tunnels).
- Phase 3 (2028-2029): Complete phase-out of RSA algorithms in hardware security modules (HSMs).
- Phase 4 (2030): Full Quantum-Resistant National Infrastructure validation and compliance certification.

3. RESOURCE ALLOCATION & AGENCY MANDATES
- Department of Telecommunications (DoT): Mandate PQC-ready SIMs and 5G/6G core switches.
- Reserve Bank of India (RBI): Enforce PQC migration for interbank financial transaction switches (NEFT/RTGS).
- SUNDAY & DRDO: Provision certified hardware security accelerators and conduct compliance testing.

4. COMPLIANCE & PENALTY CLAUSE
Entities failing to submit their CBOM inventory by December 31, 2026 shall be subject to regulatory audits and denial of government security clearances.

ISSUED BY: NATIONAL SECURITY ADVISOR'S SECRETARIAT // SUNDAY`
  },
  {
    id: "scada_grid_incident",
    category: "Incident Response",
    title: "Emergency Incident Response: SCADA Load Dispatch Center Telemetry Anomaly",
    classification: "SECRET",
    description: "High-urgency operational incident report detailing zero-day telemetry anomalies in the Regional Power Grid.",
    default_formats: ["sop_incident", "advisory", "video_package", "whitepaper"],
    audience: "Field Intelligence Operators",
    tone: "Critical & High Alert",
    objective: "Operational SOP & Field Guidance",
    content: `SUNDAY EMERGENCY INCIDENT REPORT // CLASSIFICATION: SECRET // OPS IMMEDIATE

INCIDENT ID: INC-2026-GRID-09
DATELINE: 22 AUGUST 2026, 04:15 HRS IST
LOCATION: Northern Regional Load Dispatch Centre (NRLDC)

1. INCIDENT OVERVIEW
At 03:42 IST, automated monitoring systems flagged an anomalous surge in unauthorized Modbus TCP traffic targeting substation remote terminal units (RTUs). Sensor frequencies drifted by 0.35 Hz beyond normal tolerances, indicating potential remote manipulation of frequency stabilization cosundayls.

2. IMMEDIATE ACTIONS TAKEN
- Automatic trip relays activated at 03:49 IST, islanding Substation Grid Node-7 to prevent cascading blackouts.
- Direct air-gap isolation triggered for secondary supervisory SCADA cosundayl consoles.
- Forensic packet captures dumped to secure write-once storage for SUNDAY threat analysis.

3. FORENSIC FINDINGS
Malware identification matches 'BlackVolt-V2', capable of manipulating PLC firmware registers without triggering visual SCADA HMI alarms. The payload communicates over simulated industrial telemetry protocols.

4. OPERATIONAL SOP FOR GRID OPERATORS
- Immediate manual override of automated frequency governor relays.
- Physical verification of RTU firmware checksums against the baseline golden image.
- Enforce mandatory dual-operator authorization for all remote grid re-closure commands.`
  },
  {
    id: "border_drone_ai",
    category: "Research Digest",
    title: "Autonomous Counter-UAS Swarm Defense Using Edge AI Vision & RF Jamming",
    classification: "UNCLASSIFIED",
    description: "Technical paper presenting an Edge-AI multi-spectral sensor network for neutralisation of rogue drone swarms along border corridors.",
    default_formats: ["whitepaper", "presentation", "infographic", "linkedin_post"],
    audience: "Technical & DevSecOps Engineers",
    tone: "Analytical & Objective",
    objective: "Inform & Educate",
    content: `NATIONAL TECHNICAL RESEARCH ORGANISATION // R&D DIVISION
TECHNICAL WHITEPAPER & RESEARCH DIGEST: SUNDAY-RD-2026-UAS04

TITLE: Decentralized Edge-AI Neural Architecture for Real-Time Counter-UAS Swarm Defense

ABSTRACT:
Low-altitude, low-radar-cross-section (RCS) unmanned aerial systems (UAS) operating in autonomous swarms present asymmetric operational challenges for border surveillance. This paper presents 'AeroShield-AI', a distributed mesh network combining dual-band millimeter-wave radar, thermal infrared vision, and acoustic triangulation powered by edge neural accelerators (NPU).

KEY TECHNICAL CONTRIBUTIONS:
1. Multi-Modal Sensor Fusion: Achieves 99.4% detection accuracy within 2.5 km radius, even in severe fog and electronic jamming conditions.
2. Latency Optimization: Micro-second neural classification allows targeted directional RF protocol disruption before swarm payload dispersal.
3. Swarm Trajectory Prediction: Recurrent Graph Neural Networks (GNN) predict swarm convergence points with 95% spatial accuracy.

EMPIRICAL EVALUATION:
Field trials conducted in high-altitude desert and mountainous terrain validated neutralisation of 24 simultaneous drone targets in under 8.2 seconds with zero collateral radio interference to friendly military communications.`
  }
];
