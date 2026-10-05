import React from 'react';
import { 
  FileText, AlertOctagon, CheckCircle2, ShieldAlert, 
  TrendingDown, ArrowRight, Download, Award 
} from 'lucide-react';

export default function ExecutiveViewer({ data }) {
  const getImpactBadge = (impact) => {
    const s = (impact || 'HIGH').toUpperCase();
    if (s.includes('CRIT')) return 'bg-red-950/80 text-red-400 border-red-500/50';
    if (s.includes('HIGH')) return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
    return 'bg-blue-950/80 text-blue-400 border-blue-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-defense-900 to-defense-950 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-defense-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                EXECUTIVE INTELLIGENCE BRIEFING &bull; 1-PAGER
              </span>
              <h2 className="text-base font-bold text-white">
                {data?.title || 'EXECUTIVE STRATEGIC BRIEFING'}
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-defense-950 text-emerald-300 border border-defense-700">
            C-SUITE DIRECTIVE
          </span>
        </div>
      </div>

      {/* BLUF (Bottom Line Up Front) Callout Box */}
      {data?.bluf && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border-2 border-emerald-500/40 space-y-1.5 shadow-sm">
          <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" /> BOTTOM LINE UP FRONT (BLUF):
          </span>
          <p className="text-sm font-medium text-zinc-100 leading-relaxed font-sans">
            {data.bluf}
          </p>
        </div>
      )}

      {/* Key Strategic Findings */}
      {data?.key_findings && (
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2.5">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Core Strategic Findings:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {data.key_findings.map((f, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-defense-950 p-3 rounded-lg border border-defense-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Risk Matrix Table */}
      {data?.strategic_risk_matrix && (
        <div className="p-4 rounded-xl bg-defense-900/90 border border-defense-800 space-y-3">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" /> Strategic Risk &amp; Vulnerability Matrix:
          </span>

          <div className="overflow-x-auto rounded-lg border border-defense-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-defense-950 text-zinc-400 border-b border-defense-800">
                <tr>
                  <th className="p-2.5">Risk Item</th>
                  <th className="p-2.5">Impact Severity</th>
                  <th className="p-2.5">Likelihood</th>
                  <th className="p-2.5">Mitigation Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-defense-800/80">
                {data.strategic_risk_matrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-defense-850/60 transition-colors">
                    <td className="p-2.5 font-sans font-medium text-zinc-200">
                      {r.risk_item}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getImpactBadge(r.impact)}`}>
                        {r.impact}
                      </span>
                    </td>
                    <td className="p-2.5 text-zinc-300">
                      {r.likelihood}
                    </td>
                    <td className="p-2.5 text-cyan-400 font-bold">
                      {r.mitigation_owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Impact & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Operational &amp; Readiness Impact:
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-defense-950 p-3 rounded-lg border border-defense-800">
            {data?.operational_impact}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Strategic Action Recommendations:
          </span>
          <div className="space-y-1.5 pt-1">
            {(data?.strategic_recommendations || []).map((rec, i) => (
              <div key={i} className="text-xs text-zinc-200 bg-defense-950 p-2.5 rounded-lg border border-defense-800">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leadership Decision Callout */}
      {data?.decision_required && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-2 border-blue-500/40 flex items-start gap-3">
          <ArrowRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider block mb-0.5">
              Specific Decision Required from Executive Authority:
            </span>
            <p className="text-xs font-semibold text-zinc-100 leading-relaxed">
              {data.decision_required}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
