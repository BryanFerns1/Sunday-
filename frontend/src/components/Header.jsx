import React, { useState } from 'react';
import { 
  History, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Bell, 
  User, 
  Menu,
  ChevronDown
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const CLASSIFICATIONS = [
  { v: 'UNCLASSIFIED', c: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  { v: 'RESTRICTED', c: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
  { v: 'CONFIDENTIAL', c: 'text-purple-300 bg-purple-500/10 border-purple-500/40' },
  { v: 'SECRET', c: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  { v: 'TOP SECRET // SPECIAL', c: 'text-red-300 bg-red-500/10 border-red-500/30' },
];

export default function Header({
  securityClassification, 
  setSecurityClassification, 
  systemStatus,
  modelStatus,
  onOpenHistory, 
  onOpenExport, 
  onReset, 
  hasGeneratedResults,
  onToggleMobileMenu,
  onNavigateStep
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const activeClass = CLASSIFICATIONS.find(c => c.v === securityClassification) || CLASSIFICATIONS[2];
  const backendDown = modelStatus?.backend_reachable === false;
  const offlineProvider = !backendDown && modelStatus?.active_provider === 'offline_qwen';
  const noProvider = !backendDown && modelStatus?.active_provider === 'unavailable';

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-[#1b2238] bg-[#070a14]/90 backdrop-blur-xl">
      <div className="w-full h-full px-4 lg:px-6 flex items-center justify-between gap-3">
        {/* Left: Hamburger (mobile) + Sunday Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden border border-white/10"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigateStep?.(1)}
            className="flex items-center gap-3 cursor-pointer group"
            title="Sunday Home - Step 1: Multi-Modal Source Ingestion"
          >
            {/* Logo */}
            <img
              src={logoImg}
              alt="Sunday logo"
              className="w-9 h-9 rounded-xl object-contain shadow-[0_0_18px_rgba(255,122,0,0.45)] border border-orange-400/40 group-hover:scale-105 transition-transform"
            />
            
            <div className="leading-tight">
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 group-hover:text-[#ff9e2c] transition-colors">
                Sunday
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">
                Content Transformation Studio
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right controls matching reference image */}
        <div className="flex items-center gap-2.5">
          {/* Classification Badge Pill with dropdown */}
          <div className="relative group">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all ${activeClass.c}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={securityClassification}
                onChange={(e) => setSecurityClassification(e.target.value)}
                className="bg-transparent text-purple-200 font-semibold outline-none cursor-pointer text-xs pr-1 appearance-none uppercase tracking-wider"
                aria-label="Security classification"
              >
                {CLASSIFICATIONS.map(c => (
                  <option key={c.v} value={c.v} className="bg-[#0e1322] text-zinc-200">
                    {c.v}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-purple-400/70 pointer-events-none" />
            </div>
          </div>

          {/* Engine / Provider Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
              backendDown || noProvider
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : offlineProvider
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-[#1d263f] bg-[#0c101d] text-zinc-300'
            }`}
            title={backendDown
              ? (modelStatus?.detail || 'SUNDAY backend is not reachable — start the API server.')
              : noProvider
              ? 'No inference provider available: set GEMINI_API_KEY or start the local offline model (backend/offline model/start.bat).'
              : offlineProvider
              ? 'Gemini API unavailable — running on the local offline Qwen model (Llamafile)'
              : 'Connected to the Gemini API for online inference'}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              backendDown || noProvider
                ? 'bg-red-400 shadow-[0_0_8px_#f87171]'
                : offlineProvider
                ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
            }`} />
            <span>
              {backendDown
                ? 'Backend offline'
                : noProvider
                ? 'No provider'
                : offlineProvider
                ? 'Offline (Qwen-Local)'
                : 'Online (Gemini)'}
            </span>
          </div>

          {/* Export button if results exist */}
          {hasGeneratedResults && (
            <button 
              onClick={onOpenExport}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 rounded-lg shadow-[0_0_12px_rgba(255,158,44,0.3)] transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          {/* History button */}
          <button 
            onClick={onOpenHistory}
            title="View transformation history"
            className="p-2 text-zinc-300 hover:text-white bg-[#101526]/80 hover:bg-[#182038] border border-[#1e2742] rounded-xl transition"
            aria-label="Transformation History"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Reset button */}
          <button 
            onClick={onReset}
            title="Reset workspace"
            className="p-2 text-zinc-400 hover:text-white bg-[#101526]/80 hover:bg-[#182038] border border-[#1e2742] rounded-xl transition"
            aria-label="Reset workspace"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Icon Button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-zinc-300 hover:text-white bg-[#101526]/80 hover:bg-[#182038] border border-[#1e2742] rounded-xl transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff7a00] rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0e1322] border border-[#1e2742] shadow-2xl p-3 z-50 text-xs space-y-2">
                <div className="font-semibold text-white pb-1.5 border-b border-white/5">
                  Notifications
                </div>
                <div className="text-zinc-300 text-[11px] leading-tight">
                  <span className="text-[#ff9e2c] font-semibold">Engine ready:</span> Multi-modal synthesis pipeline loaded with 10 delivery formats.
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button 
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1b2238] to-[#263150] border border-[#2b375a] flex items-center justify-center text-zinc-300 hover:text-white hover:border-orange-500/40 transition"
            aria-label="User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
