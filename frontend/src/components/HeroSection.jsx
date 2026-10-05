import React from 'react';
import { FileText, Layers, ShieldCheck, Zap } from 'lucide-react';
import bg2Img from '../assets/bg2.png';

export default function HeroSection({
  wordCount = 270,
  formatCount = 7,
  securityClassification = 'CONFIDENTIAL',
  systemStatus
}) {
  const backendDown = systemStatus?.backend_reachable === false;

  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Left Column: Heading and Subtitle */}
      <div className="lg:col-span-5 space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.15]">
          Turn one source into{' '}
          <span className="bg-gradient-to-r from-[#ff8c2b] via-[#ffa63d] to-[#ff6600] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(255,122,0,0.35)]">
            every format.
          </span>
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
          Ingest intelligence, tune the audience and tone, then generate briefings, decks, advisories and social content in one pass.
        </p>
      </div>

      {/* Center Column: BG2 glowing central AI illustration */}
      <div className="lg:col-span-3 flex justify-center items-center py-2 relative">
        <div className="relative group cursor-pointer">
          {/* Subtle background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent blur-2xl transform scale-110 pointer-events-none" />
          
          <img
            src={bg2Img}
            alt="Sunday AI Transformation Hub"
            className="w-full max-w-[260px] h-auto object-contain drop-shadow-[0_0_30px_rgba(255,122,0,0.35)] transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Right Column: Overview Metric Cards Container */}
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-[#1d243a] bg-gradient-to-b from-[#0d1222]/90 to-[#090d18]/90 p-3 sm:p-4 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            {/* Card 1: Source */}
            <div className="flex flex-col items-center justify-between p-2 rounded-xl bg-[#11172a]/60 hover:bg-[#151c33]/80 border border-white/[0.04] transition-all">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 mb-1.5 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {wordCount}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                words ingested
              </div>
            </div>

            {/* Card 2: Deliverables */}
            <div className="flex flex-col items-center justify-between p-2 rounded-xl bg-[#11172a]/60 hover:bg-[#151c33]/80 border border-white/[0.04] transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-1.5 shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-white tracking-tight">
                {formatCount}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                formats selected
              </div>
            </div>

            {/* Card 3: Classification */}
            <div className="flex flex-col items-center justify-between p-2 rounded-xl bg-[#11172a]/60 hover:bg-[#151c33]/80 border border-white/[0.04] transition-all">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-1.5 shadow-[0_0_12px_rgba(167,139,250,0.2)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-white tracking-tight truncate max-w-full">
                {securityClassification.split(' // ')[0].split(' ')[0]}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                applied to all outputs
              </div>
            </div>

            {/* Card 4: Engine */}
            <div className="flex flex-col items-center justify-between p-2 rounded-xl bg-[#11172a]/60 hover:bg-[#151c33]/80 border border-white/[0.04] transition-all">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-[#ff9e2c] mb-1.5 shadow-[0_0_12px_rgba(255,158,44,0.2)]">
                <Zap className="w-4 h-4 fill-[#ff9e2c]/30" />
              </div>
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-1">
                {backendDown ? 'Offline' : 'Online'}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                {backendDown ? 'backend unreachable' : 'live synthesis'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
