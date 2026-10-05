import React, { useState } from 'react';
import { 
  Sparkles, Download, Wand2, Copy, Check, Eye, 
  Layers, Columns, Maximize2, Shield, Video, Presentation, 
  ShieldAlert, FileText, BarChart3, Linkedin, Twitter, 
  ClipboardList, Megaphone, BookOpen, Clock, Sliders 
} from 'lucide-react';
import VideoViewer from './viewers/VideoViewer';
import PresentationViewer from './viewers/PresentationViewer';
import AdvisoryViewer from './viewers/AdvisoryViewer';
import SocialMediaViewer from './viewers/SocialMediaViewer';
import InfographicViewer from './viewers/InfographicViewer';
import ExecutiveViewer from './viewers/ExecutiveViewer';
import GenericDocViewer from './viewers/GenericDocViewer';

const TAB_ICONS = {
  video_package: Video,
  presentation: Presentation,
  advisory: ShieldAlert,
  executive_summary: FileText,
  infographic: BarChart3,
  linkedin_post: Linkedin,
  twitter_thread: Twitter,
  sop_incident: ClipboardList,
  press_release: Megaphone,
  whitepaper: BookOpen,
};

const TAB_TITLES = {
  video_package: "Video Package",
  presentation: "Slide Deck (PPTX)",
  advisory: "Security Advisory",
  executive_summary: "Executive Summary",
  infographic: "Infographic",
  linkedin_post: "LinkedIn Post",
  twitter_thread: "Twitter / X Thread",
  sop_incident: "SOP & Protocol",
  press_release: "Press Release",
  whitepaper: "Technical Whitepaper",
};

export default function GenerationStudio({
  response,
  sourceContent,
  sourceTitle,
  onOpenRefine,
  onOpenExport,
  onUpdateArtefact,
  onNavigateStep,
  onBackToMatrix,
  onNewIngestion
}) {
  const generatedArtefacts = response?.generated_artefacts || {};
  const artefactKeys = Object.keys(generatedArtefacts);
  const [activeTab, setActiveTab] = useState(artefactKeys[0] || 'executive_summary');
  const [showSideBySide, setShowSideBySide] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeContent = generatedArtefacts[activeTab];

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(JSON.stringify(activeContent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-[#1b233a] bg-gradient-to-b from-[#0d1222]/95 to-[#090d18]/95 p-5 lg:p-6 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] space-y-5">
      {/* Studio Header & Telemetry */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1b233a]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">
              3. Generation Studio &amp; Multi-Artefact Viewer
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 mt-1">
            <span>Request: <strong className="text-[#ff9e2c]">{response?.request_id}</strong></span>
            <span>Latency: <strong className="text-emerald-400">{response?.processing_time_sec}s</strong></span>
            <span>Generated: <strong className="text-zinc-200">{artefactKeys.length} Deliverable(s)</strong></span>
          </div>
        </div>

        {/* Stepper & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stepper Pills */}
          <div className="flex items-center gap-1.5 text-xs mr-2">
            <button
              type="button"
              onClick={() => onNavigateStep?.(1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 hover:border-white/20 transition text-[11px]"
              title="Go back to Ingestion"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[9px]">1</span>
              <span>Ingest</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateStep?.(2)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 hover:border-white/20 transition text-[11px]"
              title="Return to Transformation Matrix"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[9px]">2</span>
              <span>Matrix</span>
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-[#ff9e2c] font-semibold text-[11px] shadow-[0_0_8px_rgba(255,122,0,0.2)]">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center text-[9px] font-bold">3</span>
              <span>Studio</span>
            </div>
          </div>

          {onBackToMatrix && (
            <button
              onClick={onBackToMatrix}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-defense-700 bg-[#12182c] hover:bg-[#182038] text-zinc-300 hover:text-white transition"
              title="Reconfigure parameters or select different formats"
            >
              <Sliders className="w-3.5 h-3.5 text-[#ff9e2c]" />
              <span>Tune Matrix</span>
            </button>
          )}

          <button
            onClick={() => setShowSideBySide(!showSideBySide)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
              showSideBySide
                ? 'bg-orange-950/60 text-[#ff9e2c] border-orange-500/40'
                : 'bg-defense-900 text-zinc-400 border-defense-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => onOpenRefine(activeTab, activeContent)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Refine with AI</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Hub</span>
          </button>
        </div>
      </div>

      {/* Deliverable Format Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-defense-800/80">
        {artefactKeys.map((key) => {
          const IconComp = TAB_ICONS[key] || FileText;
          const title = TAB_TITLES[key] || key.replace('_', ' ').toUpperCase();
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                  : 'bg-defense-900/80 text-zinc-400 border-defense-800 hover:border-defense-700 hover:text-zinc-200'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Studio View Area (Split View or Full View) */}
      <div className={`grid gap-5 ${showSideBySide ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Source Document Reference */}
        {showSideBySide && (
          <div className="lg:col-span-4 bg-defense-950/90 rounded-2xl border border-defense-800 p-4 space-y-3 flex flex-col justify-between max-h-[750px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-defense-850">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Source Ingestion Document:
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {sourceTitle || 'Source Intel'}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed pt-2">
                {sourceContent}
              </p>
            </div>

            <div className="pt-3 border-t border-defense-850 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span>SHA256: {response?.hash_sha256?.substring(0, 16)}...</span>
              <span>Integrity: VERIFIED</span>
            </div>
          </div>
        )}

        {/* Right Column: Active Artefact Viewer */}
        <div className={`${showSideBySide ? 'lg:col-span-8' : 'w-full'} bg-defense-900/60 rounded-2xl border border-defense-800 p-5 overflow-y-auto min-h-[500px]`}>
          {activeTab === 'video_package' && (
            <VideoViewer data={activeContent} />
          )}

          {activeTab === 'presentation' && (
            <PresentationViewer data={activeContent} />
          )}

          {activeTab === 'advisory' && (
            <AdvisoryViewer data={activeContent} />
          )}

          {(activeTab === 'linkedin_post' || activeTab === 'twitter_thread') && (
            <SocialMediaViewer
              linkedinData={generatedArtefacts.linkedin_post}
              twitterData={generatedArtefacts.twitter_thread}
            />
          )}

          {activeTab === 'infographic' && (
            <InfographicViewer data={activeContent} />
          )}

          {activeTab === 'executive_summary' && (
            <ExecutiveViewer data={activeContent} />
          )}

          {['sop_incident', 'press_release', 'whitepaper'].includes(activeTab) && (
            <GenericDocViewer type={activeTab} data={activeContent} />
          )}
        </div>
      </div>
    </div>
  );
}
