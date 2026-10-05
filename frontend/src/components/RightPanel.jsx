import React from 'react';
import { 
  Zap, 
  FileText, 
  Layers, 
  ShieldCheck, 
  MessageSquare, 
  ChevronRight, 
  Brain, 
  ArrowRight 
} from 'lucide-react';

export default function RightPanel({
  onQuickAction,
  onTransform,
  isTransforming,
  hasContent
}) {
  const actions = [
    {
      id: 'briefing',
      title: 'Generate Briefing',
      desc: 'Executive & technical',
      icon: FileText,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/25 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
      format: 'executive_summary'
    },
    {
      id: 'deck',
      title: 'Create Deck',
      desc: 'Presentation slides',
      icon: Layers,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      format: 'presentation'
    },
    {
      id: 'advisory',
      title: 'Write Advisory',
      desc: 'Threat & risk advisory',
      icon: ShieldCheck,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
      format: 'advisory'
    },
    {
      id: 'social',
      title: 'Social Media Post',
      desc: 'Engagement ready',
      icon: MessageSquare,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/25 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
      format: 'linkedin_post'
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Card 1: Quick Actions */}
      <div className="rounded-2xl border border-[#1b2238] bg-gradient-to-b from-[#0e1324]/95 to-[#090d18]/95 p-4 sm:p-5 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start gap-3 pb-3 border-b border-[#1b2238]">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#ff9e2c] shadow-[0_0_12px_rgba(255,158,44,0.25)] flex-shrink-0">
            <Zap className="w-4 h-4 fill-[#ff9e2c]/30" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Quick Actions</h3>
            <p className="text-[11px] text-zinc-400">Speed up your workflow</p>
          </div>
        </div>

        {/* Action Items */}
        <div className="mt-3.5 space-y-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onQuickAction?.(act.format)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#12182c]/60 hover:bg-[#182038] border border-white/[0.04] hover:border-orange-500/30 transition-all duration-200 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${act.iconBg} ${act.iconColor} transition-transform group-hover:scale-105`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#ff9e2c] transition-colors">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {act.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#ff9e2c] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Card 2: Promotional Action Card */}
      <div 
        onClick={onTransform}
        className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[#181a29]/95 via-[#131728]/95 to-[#0e1120]/95 p-4 backdrop-blur-xl shadow-[0_0_25px_-5px_rgba(255,122,0,0.18)] cursor-pointer group hover:border-orange-500/60 transition-all duration-300"
      >
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/20 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/30 transition-all" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#ff9e2c] shadow-[0_0_15px_rgba(255,158,44,0.3)] flex-shrink-0 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                One source. Multiple formats.
              </div>
              <div className="text-[11px] font-semibold text-[#ff9e2c]">
                Maximum impact.
              </div>
            </div>
          </div>

          <button 
            disabled={isTransforming || !hasContent}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_12px_rgba(255,122,0,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_18px_rgba(255,122,0,0.6)] transition-all"
            aria-label="Generate all formats"
          >
            {isTransforming ? (
              <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
