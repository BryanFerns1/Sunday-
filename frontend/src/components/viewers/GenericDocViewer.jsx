import React from 'react';
import { 
  ClipboardList, Megaphone, BookOpen, CheckSquare, 
  Quote, Shield, Users, Layers, ExternalLink 
} from 'lucide-react';

export default function GenericDocViewer({ type, data }) {
  if (!data) return null;

  // 1. SOP & INCIDENT PROTOCOL
  if (type === 'sop_incident') {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-defense-950 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              Standard Operating Procedure (SOP) &bull; {data.sop_id || 'SUNDAY-SOP-77'}
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            {data.title || 'Standard Operating Procedure'}
          </h2>
          <p className="text-xs text-zinc-300 font-sans mt-1">
            Scope: {data.purpose_scope}
          </p>
        </div>

        {/* RACI Matrix */}
        {data.roles_responsibilities && (
          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" /> Roles &amp; Operational Responsibilities:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {data.roles_responsibilities.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-defense-950 border border-defense-800 text-xs">
                  <strong className="text-cyan-400 block font-mono">{r.role}</strong>
                  <span className="text-zinc-300">{r.duty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Phases */}
        {data.phase_actions && (
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
              Sequential Response Phases:
            </span>
            {data.phase_actions.map((phase, pIdx) => (
              <div key={pIdx} className="p-4 rounded-xl bg-defense-900/90 border border-defense-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-defense-800">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {phase.phase_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-defense-950 text-zinc-400 border border-defense-700">
                    Team: {phase.responsible_team}
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {(phase.action_items || []).map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-2 text-xs text-zinc-200 bg-defense-950/60 p-2 rounded border border-defense-850">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. PRESS RELEASE
  if (type === 'press_release') {
    return (
      <div className="max-w-3xl mx-auto space-y-5 p-6 rounded-2xl bg-defense-900/90 border border-defense-700/80 shadow-xl">
        <div className="text-center space-y-2 pb-4 border-b border-defense-800">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            FOR IMMEDIATE RELEASE
          </span>
          <h2 className="text-xl font-extrabold text-white leading-tight font-sans">
            {data.headline}
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            {data.dateline} {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="text-xs text-zinc-200 leading-relaxed font-sans space-y-3">
          <p className="font-medium text-sm text-zinc-100">
            {data.lead_paragraph}
          </p>

          {data.official_quotes && data.official_quotes.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-defense-950 border-l-4 border-rose-500 my-3 space-y-1">
              <Quote className="w-4 h-4 text-rose-400" />
              <p className="italic text-zinc-200">
                "{q.quote}"
              </p>
              <span className="text-[11px] font-mono text-zinc-400 block pt-1">
                &mdash; {q.speaker}
              </span>
            </div>
          ))}

          {(data.body_details || []).map((detail, i) => (
            <p key={i}>
              {detail}
            </p>
          ))}
        </div>

        {/* Boilerplate & Contact */}
        <div className="pt-4 border-t border-defense-800 text-[11px] text-zinc-400 font-sans space-y-2">
          <p className="italic">
            {data.boilerplate}
          </p>
          <p className="font-mono text-zinc-300">
            Media Inquiries: <strong className="text-rose-400">{data.media_contact}</strong>
          </p>
        </div>
      </div>
    );
  }

  // 3. TECHNICAL WHITEPAPER
  if (type === 'whitepaper') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-gradient-to-r from-teal-950/40 to-defense-950 border border-teal-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
              Technical Whitepaper &bull; SUNDAY R&amp;D Series
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            {data.title}
          </h2>
        </div>

        {/* Abstract */}
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-1.5">
          <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
            Abstract:
          </span>
          <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-defense-950/70 p-3 rounded-lg border border-defense-800">
            {data.abstract}
          </p>
        </div>

        {/* Methodology */}
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-1.5">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Methodology &amp; System Architecture:
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-defense-950/70 p-3 rounded-lg border border-defense-800">
            {data.methodology_and_architecture}
          </p>
        </div>

        {/* Empirical Findings */}
        {data.empirical_findings && (
          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Empirical Findings &amp; Quantitative Benchmarks:
            </span>
            <div className="space-y-2 pt-1">
              {data.empirical_findings.map((f, i) => (
                <div key={i} className="text-xs text-zinc-200 bg-defense-950 p-2.5 rounded-lg border border-defense-800 flex items-start gap-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Future Scope & References */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-1.5 text-xs">
            <span className="font-mono font-bold text-zinc-300 uppercase">Conclusion &amp; Outlook:</span>
            <p className="text-zinc-400">{data.conclusion_future_scope}</p>
          </div>

          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-1.5 text-xs">
            <span className="font-mono font-bold text-zinc-300 uppercase">References:</span>
            <ul className="list-disc list-inside text-zinc-400 space-y-1 font-mono text-[11px]">
              {(data.references || []).map((ref, i) => (
                <li key={i}>{ref}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <pre className="p-4 bg-defense-950 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto border border-defense-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
