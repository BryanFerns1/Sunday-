import React from 'react';
import { 
  Home, 
  Sparkles, 
  FileText, 
  Layers, 
  ShieldCheck, 
  MessageSquare, 
  History,
  Brain,
  X
} from 'lucide-react';

export default function Sidebar({
  activeNav,
  setActiveNav,
  onOpenHistory,
  onQuickAction,
  onNavigateStep,
  mobileOpen,
  setMobileOpen
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => { setActiveNav('home'); onNavigateStep?.(1); } },
    { id: 'generate', label: 'Generate', icon: Sparkles, action: () => { setActiveNav('generate'); onNavigateStep?.(2); } },
    { id: 'briefings', label: 'Briefings', icon: FileText, action: () => { setActiveNav('briefings'); onQuickAction?.('executive_summary'); } },
    { id: 'decks', label: 'Decks', icon: Layers, action: () => { setActiveNav('decks'); onQuickAction?.('presentation'); } },
    { id: 'advisories', label: 'Advisories', icon: ShieldCheck, action: () => { setActiveNav('advisories'); onQuickAction?.('advisory'); } },
    { id: 'social', label: 'Social Content', icon: MessageSquare, action: () => { setActiveNav('social'); onQuickAction?.('social_post'); } },
    { id: 'history', label: 'History', icon: History, action: () => { setActiveNav('history'); onOpenHistory?.(); } },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-16 bottom-0 left-0 z-40 w-56 
        bg-[#090c15]/95 backdrop-blur-xl border-r border-[#1a2136]
        flex flex-col justify-between p-3.5
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation list */}
        <div className="space-y-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-[#151c2e] text-[#ff9e2c] border-l-[3px] border-[#ff7a00] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_-3px_rgba(255,122,0,0.15)] font-semibold pl-[11px]' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#121727]/70 border-l-[3px] border-transparent'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#ff9e2c]' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom promotional card matching design reference */}
        <div className="relative overflow-hidden rounded-2xl border border-[#202943] bg-gradient-to-b from-[#111627]/90 to-[#0c101d]/90 p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]">
          {/* Subtle bottom orange accent curve */}
          <div className="absolute -bottom-8 -right-6 w-28 h-20 rounded-full bg-gradient-to-tr from-[#ff7a00]/40 to-transparent blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#ff7a00]/60 to-transparent" />

          <div className="relative z-10 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-[#ff9e2c] shadow-[0_0_12px_rgba(255,122,0,0.25)]">
              <Brain className="w-4 h-4" />
            </div>
            
            <div>
              <div className="text-[13px] font-bold text-white leading-tight">
                Smarter content.
              </div>
              <div className="text-[13px] font-bold text-[#ff9e2c] leading-tight">
                Bigger impact.
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-snug">
              SUNDAY turns intelligence into stories.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
