import React from 'react';
import { 
  Sliders, Video, Presentation, ShieldAlert, FileText, 
  BarChart3, Linkedin, Twitter, ClipboardList, Megaphone, 
  BookOpen, Globe2, Target, Volume2, Sparkles, CheckSquare, Square,
  ArrowLeft, ChevronRight, Check
} from 'lucide-react';

const FORMATS = [
  {
    id: "video_package",
    name: "Video Package",
    icon: Video,
    category: "Multimedia",
    badge: "Script + Audio + SRT",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-400"
  },
  {
    id: "presentation",
    name: "Slide Deck (PPTX)",
    icon: Presentation,
    category: "Briefing",
    badge: "5-Slide Deck + Notes",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400"
  },
  {
    id: "advisory",
    name: "Security Advisory",
    icon: ShieldAlert,
    category: "Defense & Cyber",
    badge: "SUNDAY Threat Standard",
    color: "from-red-500/20 to-orange-500/20 border-red-500/40 text-red-400"
  },
  {
    id: "executive_summary",
    name: "Executive Summary",
    icon: FileText,
    category: "Briefing",
    badge: "BLUF + Risk Matrix",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400"
  },
  {
    id: "infographic",
    name: "Infographic Blueprint",
    icon: BarChart3,
    category: "Visual Data",
    badge: "Mermaid Flowchart",
    color: "from-cyan-500/20 to-sky-500/20 border-cyan-500/40 text-cyan-400"
  },
  {
    id: "linkedin_post",
    name: "LinkedIn Post",
    icon: Linkedin,
    category: "Social & Thought",
    badge: "Post + Hashtags",
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-400"
  },
  {
    id: "twitter_thread",
    name: "Twitter / X Thread",
    icon: Twitter,
    category: "Social & Thread",
    badge: "5-Part Tweet Chain",
    color: "from-blue-400/20 to-indigo-500/20 border-blue-400/40 text-blue-300"
  },
  {
    id: "sop_incident",
    name: "SOP & Protocol",
    icon: ClipboardList,
    category: "Operations",
    badge: "Step-by-Step SOP",
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/40 text-amber-400"
  },
  {
    id: "press_release",
    name: "Press Release",
    icon: Megaphone,
    category: "Public Comms",
    badge: "Formal Dispatch",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/40 text-rose-400"
  },
  {
    id: "whitepaper",
    name: "Technical Whitepaper",
    icon: BookOpen,
    category: "R&D & Science",
    badge: "Abstract + Analysis",
    color: "from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-400"
  }
];

export default function ConfigMatrix({
  parameters,
  setParameters,
  onTransform,
  isTransforming,
  disabled,
  onBack,
  onNavigateStep,
  sourceTitle,
  sourceType,
  securityClassification,
  wordCount,
  response
}) {
  const toggleFormat = (formatId) => {
    setParameters((prev) => {
      const current = prev.selected_formats || [];
      const exists = current.includes(formatId);
      const updated = exists
        ? current.filter((f) => f !== formatId)
        : [...current, formatId];
      // Ensure at least 1 is selected
      return {
        ...prev,
        selected_formats: updated.length > 0 ? updated : [formatId],
      };
    });
  };

  const selectAllFormats = () => {
    setParameters((prev) => ({
      ...prev,
      selected_formats: FORMATS.map((f) => f.id),
    }));
  };

  const selectCoreDefence = () => {
    setParameters((prev) => ({
      ...prev,
      selected_formats: ["advisory", "executive_summary", "presentation", "video_package"],
    }));
  };

  const isSelected = (id) => (parameters.selected_formats || []).includes(id);

  return (
    <div className="rounded-2xl border border-[#1b233a] bg-gradient-to-b from-[#0d1222]/95 to-[#090d18]/95 p-5 lg:p-6 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] flex flex-col gap-5">
      {/* Header with Title, Back Button, Batch Selectors, and Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b233a]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#12182c]/80 hover:bg-[#182038] text-xs font-semibold text-zinc-300 hover:text-white transition shadow-sm"
              title="Return to Step 1: Multi-Modal Source Ingestion"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ff9e2c]" />
              <span>Back to Ingest</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#ff9e2c] shadow-[0_0_12px_rgba(255,158,44,0.25)]">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              2. Configurable Output Transformation Matrix
            </h2>
          </div>
        </div>

        {/* Right side: Batch selectors & Stepper */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Format Batch Selectors */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectCoreDefence}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#12182c] hover:bg-[#182038] text-[#ff9e2c] border border-orange-500/30 transition-all font-semibold"
            >
              Defense Core (4)
            </button>
            <button
              type="button"
              onClick={selectAllFormats}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#12182c] hover:bg-[#182038] text-zinc-300 border border-white/10 transition-all"
            >
              Select All (10)
            </button>
          </div>

          {/* Stepper Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => onNavigateStep?.(1)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 font-medium cursor-pointer hover:border-white/20 transition"
              title="Go to Step 1: Ingest"
            >
              <span className="w-4 h-4 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Ingest</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-[#ff9e2c] font-semibold shadow-[0_0_10px_rgba(255,122,0,0.2)]">
              <span className="w-4 h-4 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Matrix</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (response) onNavigateStep?.(3);
                else onTransform?.();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 font-medium cursor-pointer hover:border-white/20 transition"
              title="Go to Step 3: Generation Studio"
            >
              <span className="w-4 h-4 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Source Intelligence Summary Bar */}
      {sourceTitle && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0b0f1c]/90 border border-[#1b233a] text-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className="text-zinc-500 font-medium">Source Document:</span>
            <span className="font-semibold text-white truncate max-w-sm sm:max-w-md">
              {sourceTitle}
            </span>
            {sourceType && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] uppercase font-mono text-zinc-300 border border-white/10">
                {sourceType}
              </span>
            )}
            {securityClassification && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] uppercase font-semibold border border-purple-500/30">
                {securityClassification.split(' // ')[0]}
              </span>
            )}
            {typeof wordCount === 'number' && (
              <span className="text-zinc-400 text-[11px]">
                ({wordCount} words)
              </span>
            )}
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[#ff9e2c] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Ingested Source</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 10 Output Format Cards Grid */}
      <div>
        <label className="block text-xs font-mono font-semibold text-zinc-400 mb-2">
          Select Desired Deliverable Artefact(s) &mdash; Single or Multi-Select:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {FORMATS.map((fmt) => {
            const selected = isSelected(fmt.id);
            const IconComp = fmt.icon;
            return (
              <div
                key={fmt.id}
                onClick={() => toggleFormat(fmt.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative group ${
                  selected
                    ? `bg-gradient-to-br ${fmt.color} ring-1 ring-cyan-400/50 shadow-sm`
                    : 'bg-defense-900/60 border-defense-800/80 hover:border-defense-700 hover:bg-defense-900/90 text-zinc-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${selected ? 'bg-defense-950/80' : 'bg-defense-950/40 text-zinc-400'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="text-[10px]">
                    {selected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-bold ${selected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                    {fmt.name}
                  </h4>
                  <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">
                    {fmt.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transformation Parameters Matrix Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        {/* Target Audience */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Audience:</span>
          </label>
          <select
            value={parameters.audience}
            onChange={(e) => setParameters({ ...parameters, audience: e.target.value })}
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Cybersecurity Analysts & Threat Hunters">Cybersecurity Analysts & Threat Hunters</option>
            <option value="C-Suite & Leadership">C-Suite & Leadership</option>
            <option value="Technical & DevSecOps Engineers">Technical & DevSecOps Engineers</option>
            <option value="Field Intelligence Operators">Field Intelligence Operators</option>
            <option value="Policy Makers & Strategic Planners">Policy Makers & Strategic Planners</option>
            <option value="General Public & Citizens">General Public & Citizens</option>
            <option value="Media & Press Correspondents">Media & Press Correspondents</option>
          </select>
        </div>

        {/* Tone & Style */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 mb-1">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tone & Style:</span>
          </label>
          <select
            value={parameters.tone}
            onChange={(e) => setParameters({ ...parameters, tone: e.target.value })}
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Authoritative & Formal">Authoritative & Formal</option>
            <option value="Critical & High Alert">Critical & High Alert</option>
            <option value="Analytical & Objective">Analytical & Objective</option>
            <option value="Engaging & Conversational">Engaging & Conversational</option>
            <option value="Educational & Simplified">Educational & Simplified</option>
            <option value="Tactical & Action-Oriented">Tactical & Action-Oriented</option>
          </select>
        </div>

        {/* Target Language (Multilingual Support) */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 mb-1">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Output Language:</span>
          </label>
          <select
            value={parameters.language}
            onChange={(e) => setParameters({ ...parameters, language: e.target.value })}
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="English">English</option>
            <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
            <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
            <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
            <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
            <option value="Marathi (मराठी)">Marathi (मराठी)</option>
            <option value="French (Français)">French (Français)</option>
            <option value="Spanish (Español)">Spanish (Español)</option>
            <option value="German (Deutsch)">German (Deutsch)</option>
            <option value="Russian (Русский)">Russian (Русский)</option>
            <option value="Arabic (العربية)">Arabic (العربية)</option>
            <option value="Japanese (日本語)">Japanese (日本語)</option>
          </select>
        </div>

        {/* Level of Detail */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 mb-1">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span>Level of Detail:</span>
          </label>
          <select
            value={parameters.detail_level}
            onChange={(e) => setParameters({ ...parameters, detail_level: e.target.value })}
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Standard (Comprehensive Overview)">Standard (Comprehensive Overview)</option>
            <option value="Concise (TL;DR / Executive Brief)">Concise (TL;DR / Executive Brief)</option>
            <option value="Deep-Dive (Technical & In-Depth Breakdown)">Deep-Dive (Technical & In-Depth)</option>
          </select>
        </div>
      </div>

      {/* Communication Objective & Operator Custom Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-mono font-semibold text-zinc-400 mb-1">
            Communication Objective:
          </label>
          <select
            value={parameters.objective}
            onChange={(e) => setParameters({ ...parameters, objective: e.target.value })}
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Alert, Warn & Mitigate Threat">Alert, Warn & Mitigate Threat</option>
            <option value="Inform & Educate">Inform & Educate</option>
            <option value="Executive Decision Support">Executive Decision Support</option>
            <option value="Strategic Policy Alignment">Strategic Policy Alignment</option>
            <option value="Public Awareness & Broadcast">Public Awareness & Broadcast</option>
            <option value="Operational SOP & Field Guidance">Operational SOP & Field Guidance</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono font-semibold text-zinc-400 mb-1">
            Operator Custom Directives (Optional):
          </label>
          <input
            type="text"
            value={parameters.custom_instructions || ''}
            onChange={(e) => setParameters({ ...parameters, custom_instructions: e.target.value })}
            placeholder="e.g. Focus on SCADA isolation, emphasize zero downtime..."
            className="w-full bg-defense-900 border border-defense-700 rounded-lg px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Transformation Action CTA */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1b233a]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-[#12182c] hover:bg-[#182038] text-xs font-semibold text-zinc-300 hover:text-white transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#ff9e2c]" />
              <span>Back to Ingestion</span>
            </button>
          )}

          <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff9e2c]" />
            <span>
              Selected Deliverables: <strong className="text-[#ff9e2c]">{parameters.selected_formats?.length || 0}</strong> Format(s)
            </span>
          </div>
        </div>

        <button
          id="sunday-generate"
          onClick={onTransform}
          disabled={isTransforming || disabled}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 text-zinc-950 disabled:opacity-50 text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(255,122,0,0.35)] transition-all flex items-center justify-center gap-2.5 font-mono tracking-wide"
        >
          {isTransforming ? (
            <>
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>SYNTHESIZING {parameters.selected_formats?.length || 1} ARTEFACTS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-zinc-950" />
              <span>SYNTHESIZE CONTENT ARTEFACTS</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
