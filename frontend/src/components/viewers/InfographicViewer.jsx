import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { 
  BarChart3, TrendingUp, Sparkles, Layout, 
  CheckCircle2, Copy, Check, RefreshCw 
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0b1329',
    primaryColor: '#0ea5e9',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a'
  }
});

export default function InfographicViewer({ data }) {
  const mermaidRef = useRef(null);
  const [copiedDiagram, setCopiedDiagram] = useState(false);
  const [renderError, setRenderError] = useState(false);

  const diagramCode = data?.mermaid_diagram || `graph TD\n  A[Source Telemetry] --> B[AI Transformation Engine]\n  B --> C[Defense Advisory]\n  B --> D[Executive Brief]\n  B --> E[Video Package]`;

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      if (!mermaidRef.current) return;
      try {
        setRenderError(false);
        mermaidRef.current.innerHTML = '';
        const id = `mermaid-chart-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagramCode);
        if (isMounted && mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (isMounted) setRenderError(true);
      }
    };

    renderChart();
    return () => { isMounted = false; };
  }, [diagramCode]);

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(diagramCode);
    setCopiedDiagram(true);
    setTimeout(() => setCopiedDiagram(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Infographic Architecture &amp; Visual Specification
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-100">
            {data?.title || 'Visual Intelligence Infographic Blueprint'}
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Palette: <strong className="text-cyan-300">{data?.theme_palette || 'Cyber Defense Matrix'}</strong>
          </p>
        </div>

        <button
          onClick={handleCopyMermaid}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-defense-900 hover:bg-defense-800 border border-defense-700 text-zinc-200 transition-all"
        >
          {copiedDiagram ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedDiagram ? 'Copied Diagram' : 'Copy Mermaid Code'}</span>
        </button>
      </div>

      {/* 4-Grid Key Metrics Row */}
      {data?.key_metrics && (
        <div>
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
            Key Telemetry &amp; Statistical Indicators:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.key_metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-defense-900/90 border border-defense-700/80 shadow-md flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">
                    {metric.label}
                  </span>
                  {metric.trend && (
                    <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      {metric.trend}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-tight">
                  {metric.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Mermaid Diagram Canvas */}
      <div className="p-5 rounded-2xl bg-defense-950 border-2 border-defense-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-defense-800">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layout className="w-4 h-4" /> Live Rendered Architecture Diagram (SVG):
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Mermaid.js Dynamic Engine
          </span>
        </div>

        {renderError ? (
          <div className="p-4 rounded-lg bg-defense-900 text-xs font-mono text-zinc-300">
            <p className="text-amber-400 font-bold mb-2">Diagram Source Code:</p>
            <pre className="overflow-x-auto text-xs">{diagramCode}</pre>
          </div>
        ) : (
          <div
            ref={mermaidRef}
            className="flex items-center justify-center p-4 min-h-[220px] overflow-x-auto"
          />
        )}
      </div>

      {/* Visual Design Prompts & Key Messaging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Layout & Prompts */}
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Visual Asset Prompts:
          </span>
          <div className="space-y-2 pt-1">
            {(data?.visual_prompts || []).map((prompt, i) => (
              <div key={i} className="text-xs text-zinc-300 bg-defense-950 p-2.5 rounded-lg border border-defense-800 italic">
                "{prompt}"
              </div>
            ))}
          </div>
        </div>

        {/* Key Messaging */}
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800 space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Core Messaging Hierarchy:
          </span>
          <div className="space-y-2 pt-1">
            {(data?.key_messaging_points || []).map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-200 bg-defense-950 p-2.5 rounded-lg border border-defense-800">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
