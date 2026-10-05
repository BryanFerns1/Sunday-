import React, { useState } from 'react';
import { 
  Download, X, FileText, Presentation, Film, 
  Archive, FileCode, CheckCircle2, Shield 
} from 'lucide-react';
import { exportFile } from '../services/api';

export default function ExportCenter({
  isOpen,
  onClose,
  artefacts,
  sourceTitle,
  securityClassification
}) {
  const [downloadingType, setDownloadingType] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async (format) => {
    setDownloadingType(format);
    try {
      const meta = {
        source_title: sourceTitle,
        security_classification: securityClassification
      };
      const blob = await exportFile(format, artefacts, meta);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = (sourceTitle || 'sunday_artefacts').replace(/\s+/g, '_');

      const extMap = {
        zip: 'zip',
        pptx: 'pptx',
        pdf: 'pdf',
        docx: 'docx',
        srt: 'srt',
        json: 'json',
        md: 'md'
      };
      a.download = `${cleanTitle}_dossier.${extMap[format] || format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setDownloadingType(null);
    }
  };

  const hasPresentation = !!artefacts?.presentation;
  const hasVideo = !!artefacts?.video_package;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-defense-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-defense-900 border border-defense-700 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-defense-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-mono">
                SUNDAY Export &amp; Dissemination Hub
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Download generated communication artefacts in official formats
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-defense-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master ZIP Bundle Button */}
        <div
          onClick={() => handleDownload('zip')}
          className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-indigo-950/80 border-2 border-cyan-500/50 hover:border-cyan-400 cursor-pointer transition-all shadow-glow-cyan flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500 text-black">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">
                Complete Deliverables Bundle (.ZIP)
              </h4>
              <p className="text-xs text-zinc-300">
                Contains PPTX Deck, PDF Dossier, DOCX, SRT Subtitles, JSON &amp; Markdown
              </p>
            </div>
          </div>

          <button
            disabled={downloadingType === 'zip'}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-cyan-500 text-black group-hover:bg-cyan-400 transition-all"
          >
            {downloadingType === 'zip' ? 'Packaging...' : 'Download ZIP'}
          </button>
        </div>

        {/* Individual Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* PPTX */}
          <div className={`p-3 rounded-xl bg-defense-950 border border-defense-800 flex items-center justify-between ${hasPresentation ? 'opacity-100' : 'opacity-60'}`}>
            <div className="flex items-center gap-2">
              <Presentation className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">PowerPoint Deck</span>
                <span className="text-[10px] font-mono text-zinc-500">.PPTX Slides</span>
              </div>
            </div>
            <button
              onClick={() => handleDownload('pptx')}
              disabled={downloadingType === 'pptx' || !hasPresentation}
              className="px-2.5 py-1 text-xs font-mono text-blue-400 hover:text-white bg-defense-900 hover:bg-blue-600 rounded border border-defense-700 transition-all disabled:opacity-40"
            >
              {downloadingType === 'pptx' ? 'Exporting...' : 'Export'}
            </button>
          </div>

          {/* PDF */}
          <div className="p-3 rounded-xl bg-defense-950 border border-defense-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-400" />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Printable PDF Dossier</span>
                <span className="text-[10px] font-mono text-zinc-500">.PDF Report</span>
              </div>
            </div>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloadingType === 'pdf'}
              className="px-2.5 py-1 text-xs font-mono text-red-400 hover:text-white bg-defense-900 hover:bg-red-600 rounded border border-defense-700 transition-all"
            >
              {downloadingType === 'pdf' ? 'Exporting...' : 'Export'}
            </button>
          </div>

          {/* DOCX */}
          <div className="p-3 rounded-xl bg-defense-950 border border-defense-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Word Document</span>
                <span className="text-[10px] font-mono text-zinc-500">.DOCX Document</span>
              </div>
            </div>
            <button
              onClick={() => handleDownload('docx')}
              disabled={downloadingType === 'docx'}
              className="px-2.5 py-1 text-xs font-mono text-sky-400 hover:text-white bg-defense-900 hover:bg-sky-600 rounded border border-defense-700 transition-all"
            >
              {downloadingType === 'docx' ? 'Exporting...' : 'Export'}
            </button>
          </div>

          {/* SRT */}
          <div className={`p-3 rounded-xl bg-defense-950 border border-defense-800 flex items-center justify-between ${hasVideo ? 'opacity-100' : 'opacity-60'}`}>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-bold text-zinc-200 block">Video Subtitles</span>
                <span className="text-[10px] font-mono text-zinc-500">.SRT Timestamps</span>
              </div>
            </div>
            <button
              onClick={() => handleDownload('srt')}
              disabled={downloadingType === 'srt' || !hasVideo}
              className="px-2.5 py-1 text-xs font-mono text-purple-400 hover:text-white bg-defense-900 hover:bg-purple-600 rounded border border-defense-700 transition-all disabled:opacity-40"
            >
              {downloadingType === 'srt' ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-defense-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono bg-defense-950 hover:bg-defense-800 text-zinc-300 rounded-lg border border-defense-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
