import React, { useState } from 'react';
import { 
  Sparkles, X, Send, Wand2, RefreshCw, 
  CheckCircle2, ArrowRight, MessageSquare 
} from 'lucide-react';
import { refineArtefact } from '../services/api';

const QUICK_PROMPTS = [
  "Emphasize critical infrastructure & SCADA isolation",
  "Translate key sections to Hindi (हिन्दी)",
  "Condense technical detail by 30% for executive brief",
  "Add 3 more actionable IOC mitigation steps",
  "Adopt a more urgent defense advisory tone"
];

export default function RefineDrawer({
  isOpen,
  onClose,
  activeArtefactType,
  currentArtefactContent,
  onUpdateArtefact
}) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleRefine = async (customPrompt) => {
    const promptToUse = customPrompt || instruction;
    if (!promptToUse.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await refineArtefact({
        artefact_type: activeArtefactType,
        current_content: currentArtefactContent,
        refinement_instruction: promptToUse
      });
      if (res.refined_content) {
        onUpdateArtefact(activeArtefactType, res.refined_content);
        setInstruction('');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Refinement failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-defense-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-defense-900 border-l border-defense-700 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-defense-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-mono">
                  Refine with AI
                </h3>
                <span className="text-[11px] text-cyan-400 font-mono uppercase">
                  Target: {activeArtefactType?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-defense-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            Provide directives to re-align, modify, expand, or adjust specific sections of this generated artefact.
          </p>

          {/* Quick Prompt Suggestions */}
          <div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Quick Operator Directives:
            </span>
            <div className="flex flex-col gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRefine(qp)}
                  disabled={loading}
                  className="text-left text-xs text-zinc-300 hover:text-cyan-300 bg-defense-950 hover:bg-defense-850 p-2 rounded-lg border border-defense-800 transition-all flex items-center justify-between group"
                >
                  <span>{qp}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Input & Submit Area */}
        <div className="pt-6 border-t border-defense-800 space-y-3">
          <label className="block text-xs font-mono font-semibold text-zinc-400">
            Custom Operator Refinement Prompt:
          </label>
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Add 2 more technical CVE recommendations, make the conclusion more decisive..."
            className="w-full bg-defense-950 border border-defense-700 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
          />

          {error && (
            <div className="text-xs text-red-400 bg-red-950/60 p-2 rounded border border-red-500/30">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-defense-950 rounded-lg border border-defense-800"
            >
              Cancel
            </button>

            <button
              onClick={() => handleRefine()}
              disabled={loading || !instruction.trim()}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Refining Artefact...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Refinement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
