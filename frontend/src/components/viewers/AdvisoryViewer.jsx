import React, { useState } from 'react';
import { 
  ShieldAlert, Copy, Check, Download, ExternalLink, 
  AlertTriangle, Server, Hash, FileCheck, CheckCircle2 
} from 'lucide-react';
import { exportFile } from '../../services/api';

export default function AdvisoryViewer({ data }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPDF = async () => {
    setExportingPdf(true);
    try {
      const blob = await exportFile('pdf', { advisory: data }, { 
        source_title: data?.title,
        security_classification: data?.compliance_signoff?.includes('TOP SECRET') ? 'TOP SECRET' : 'CONFIDENTIAL'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(data?.advisory_id || 'sunday_advisory').replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    if (s.includes('CRIT')) return 'bg-red-950/90 text-red-400 border-red-500/60 ring-1 ring-red-500/40';
    if (s.includes('HIGH')) return 'bg-amber-950/90 text-amber-400 border-amber-500/60';
    if (s.includes('MED')) return 'bg-yellow-950/90 text-yellow-400 border-yellow-500/60';
    return 'bg-blue-950/90 text-blue-400 border-blue-500/60';
  };

  return (
    <div className="space-y-6">
      {/* Formal SUNDAY Advisory Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-defense-900 to-defense-950 border-2 border-red-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-defense-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950 text-red-400 border border-red-500/40 shadow-glow-red">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-widest block">
                NATIONAL CYBER THREAT INTELLIGENCE ADVISORY
              </span>
              <h2 className="text-lg font-black text-white tracking-wide">
                {data?.title || 'SUNDAY CYBERSECURITY DEFENSE ADVISORY'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-mono font-black rounded-lg border ${getSeverityBadge(data?.severity)}`}>
              SEVERITY: {data?.severity || 'CRITICAL'} (CVSS {data?.cvss_score || '9.4'})
            </span>

            <button
              onClick={handleDownloadPDF}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingPdf ? 'PRINTING...' : 'EXPORT PDF'}</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-defense-950/80 p-2.5 rounded border border-defense-800">
            <span className="text-zinc-500 block text-[10px]">ADVISORY ID:</span>
            <strong className="text-cyan-400">{data?.advisory_id || 'SUNDAY-ADV-2026-0891'}</strong>
          </div>
          <div className="bg-defense-950/80 p-2.5 rounded border border-defense-800">
            <span className="text-zinc-500 block text-[10px]">THREAT ACTOR / VECTOR:</span>
            <strong className="text-amber-300">{data?.threat_actors || 'APT41 (State-Sponsored)'}</strong>
          </div>
          <div className="bg-defense-950/80 p-2.5 rounded border border-defense-800">
            <span className="text-zinc-500 block text-[10px]">CVSS v3.1 BASE:</span>
            <strong className="text-red-400">{data?.cvss_score || '9.4'} / 10.0</strong>
          </div>
          <div className="bg-defense-950/80 p-2.5 rounded border border-defense-800">
            <span className="text-zinc-500 block text-[10px]">AUTHORITY:</span>
            <strong className="text-zinc-300">{data?.compliance_signoff || 'SUNDAY Cyber Ops'}</strong>
          </div>
        </div>
      </div>

      {/* Affected Systems & Target Sectors */}
      {data?.affected_systems && (
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-cyan-400" /> Target Systems &amp; Vulnerable Assets:
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.affected_systems.map((sys, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs font-mono bg-defense-950 text-zinc-200 rounded-lg border border-defense-700"
              >
                • {sys}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Executive Summary & Technical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Executive Overview:
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-defense-950/50 p-3 rounded-lg border border-defense-850">
            {data?.executive_summary}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-cyan-400" /> Technical Anatomy &amp; Exploitation:
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-defense-950/50 p-3 rounded-lg border border-defense-850">
            {data?.technical_analysis}
          </p>
        </div>
      </div>

      {/* Indicators of Compromise (IOC) Table */}
      {data?.indicators_of_compromise && data.indicators_of_compromise.length > 0 && (
        <div className="p-4 rounded-xl bg-defense-900/90 border border-defense-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-4 h-4" /> Indicators of Compromise (IOCs):
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {data.indicators_of_compromise.length} Telemetry Signatures
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-defense-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-defense-950 text-zinc-400 border-b border-defense-800">
                <tr>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Indicator Value / Hash</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-defense-800/80">
                {data.indicators_of_compromise.map((ioc, idx) => (
                  <tr key={idx} className="hover:bg-defense-850/60 transition-colors">
                    <td className="p-2.5 font-bold text-cyan-400">
                      {ioc.type}
                    </td>
                    <td className="p-2.5 text-zinc-200 break-all select-all font-mono text-[11px]">
                      {ioc.value}
                    </td>
                    <td className="p-2.5 text-zinc-400">
                      {ioc.description}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleCopy(ioc.value, `ioc-${idx}`)}
                        className="p-1 text-zinc-400 hover:text-cyan-400 transition-colors"
                        title="Copy Indicator"
                      >
                        {copiedKey === `ioc-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Mitigation Action Checklist */}
      {data?.mitigation_steps && (
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2.5">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Mandatory Mitigation &amp; Containment Action Plan:
          </span>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {data.mitigation_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-defense-950 p-2.5 rounded-lg border border-defense-800">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Sign-off Footer */}
      <div className="p-3 bg-defense-950 rounded-lg border border-defense-800 text-[11px] font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Signoff: <strong className="text-zinc-200">{data?.compliance_signoff || 'SUNDAY CYBER WING'}</strong></span>
        <span>Standard: <strong className="text-cyan-400">SUNDAY-STD-AI-ADV-2026</strong></span>
      </div>
    </div>
  );
}
