import React, { useState } from 'react';
import { 
  Presentation, ChevronLeft, ChevronRight, Maximize2, 
  Download, MessageSquare, Sparkles, Layout, CheckCircle2 
} from 'lucide-react';
import { exportFile } from '../../services/api';

export default function PresentationViewer({ data }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const slides = data?.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0] || {};
  const totalSlides = slides.length || 1;

  const nextSlide = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const handleDownloadPPTX = async () => {
    setDownloading(true);
    try {
      const blob = await exportFile('pptx', { presentation: data }, { source_title: data?.deck_title });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(data?.deck_title || 'sunday_presentation').replace(/\s+/g, '_')}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PPTX export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`space-y-5 ${isFullscreen ? 'fixed inset-0 z-50 bg-defense-950 p-8 overflow-y-auto' : ''}`}>
      {/* Header Cosundayls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-defense-800">
        <div>
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-100">
              {data?.deck_title || 'Intelligence Briefing Presentation Deck'}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {data?.deck_subtitle || 'Synthesized Presentation Slides & Speaker Notes'}
          </p>
        </div>

        {/* Action Cosundayls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
              showSpeakerNotes
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                : 'bg-defense-900 text-zinc-400 border-defense-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Speaker Notes</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-defense-900 hover:bg-defense-800 text-zinc-300 border border-defense-700 transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownloadPPTX}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold font-mono rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'GENERATING PPTX...' : 'DOWNLOAD PPTX'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Slide Canvas (16:9 Aspect Ratio) */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900 via-defense-900 to-zinc-950 border-2 border-defense-700/80 shadow-2xl p-6 sm:p-10 min-h-[340px] flex flex-col justify-between overflow-hidden">
        {/* Decorative Grid & Emblem */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pb-3 border-b border-defense-800">
          <span className="text-cyan-400 font-bold tracking-widest uppercase">
            SUNDAY CYBER INTELLIGENCE // DECK
          </span>
          <span className="px-2 py-0.5 rounded bg-defense-950 text-zinc-400 border border-defense-800">
            Slide {currentSlideIndex + 1} of {totalSlides}
          </span>
        </div>

        {/* Slide Content Area */}
        <div className="py-6 my-auto">
          {currentSlideIndex === 0 ? (
            /* Title Slide Layout */
            <div className="text-center space-y-4 max-w-2xl mx-auto py-4">
              <span className="inline-block px-3 py-1 text-xs font-mono font-bold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                EXECUTIVE INTELLIGENCE BRIEFING
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {currentSlide.title || data?.deck_title}
              </h2>
              <div className="space-y-1.5 pt-2">
                {currentSlide.bullet_points?.map((bp, i) => (
                  <p key={i} className="text-sm font-medium text-zinc-300">
                    {bp}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            /* Content Slide Layout */
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide border-l-4 border-cyan-400 pl-3">
                {currentSlide.title}
              </h3>
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {currentSlide.bullet_points?.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-defense-950/50 p-3 rounded-lg border border-defense-800/80">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-zinc-200 leading-relaxed font-sans">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visual Recommendation Footer */}
        {currentSlide.visual_layout_recommendation && (
          <div className="pt-3 border-t border-defense-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Layout className="w-3.5 h-3.5" /> Visual Cue: {currentSlide.visual_layout_recommendation}
            </span>
            <span>SUNDAY-CONFIDENTIAL</span>
          </div>
        )}
      </div>

      {/* Slide Navigation Strip */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
          className="flex items-center gap-1 px-3 py-2 text-xs font-mono rounded-lg bg-defense-900 hover:bg-defense-800 disabled:opacity-30 border border-defense-700 text-zinc-200 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Slide Thumbnail Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1 text-xs font-mono rounded-md border transition-all ${
                currentSlideIndex === idx
                  ? 'bg-blue-600 text-white border-blue-400 shadow-glow-cyan'
                  : 'bg-defense-900 text-zinc-400 border-defense-800 hover:border-defense-700'
              }`}
            >
              Slide {s.slide_number || idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          className="flex items-center gap-1 px-3 py-2 text-xs font-mono rounded-lg bg-defense-900 hover:bg-defense-800 disabled:opacity-30 border border-defense-700 text-zinc-200 transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Speaker Notes Drawer */}
      {showSpeakerNotes && (
        <div className="p-4 rounded-xl bg-defense-900/90 border border-blue-500/20 space-y-1.5">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Presenter Notes (Slide {currentSlideIndex + 1}):
          </span>
          <p className="text-xs font-mono text-zinc-300 leading-relaxed bg-defense-950/80 p-3 rounded-lg border border-defense-800">
            {currentSlide.speaker_notes || 'No presenter notes required for this slide.'}
          </p>
        </div>
      )}
    </div>
  );
}
