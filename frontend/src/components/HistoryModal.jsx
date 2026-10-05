import React, { useState, useEffect } from 'react';
import { 
  History, X, Trash2, Clock, Shield, 
  ArrowRight, FileCheck, RefreshCw 
} from 'lucide-react';
import { fetchHistory, clearHistory } from '../services/api';

export default function HistoryModal({ isOpen, onClose, onLoadHistoryItem }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHistory();
      setHistoryList(res.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleClear = async () => {
    if (window.confirm('Clear all stored audit history logs?')) {
      await clearHistory();
      setHistoryList([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-defense-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-defense-900 border border-defense-700 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-defense-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono">
                SUNDAY Transformation Audit Log &amp; History
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Tamper-proof record of synthesized intelligence dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {historyList.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-defense-800 transition-colors"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-defense-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-cyan-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching audit log...</span>
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-500">
              No transformation history recorded in this session.
            </div>
          ) : (
            historyList.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onLoadHistoryItem && item.response_data) {
                    onLoadHistoryItem(item.response_data);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl bg-defense-950 hover:bg-defense-850 border border-defense-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
                      {item.source_title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-defense-900 text-amber-400 border border-defense-700">
                      {item.security_classification}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span>ID: {item.request_id}</span>
                    <span>Formats: {item.formats_count}</span>
                    <span>Latency: {item.processing_time_sec}s</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-defense-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono bg-defense-950 hover:bg-defense-800 text-zinc-300 rounded-lg border border-defense-700"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
