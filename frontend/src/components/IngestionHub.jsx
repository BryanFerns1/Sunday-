import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Layers,
  FileText,
  Upload,
  Globe,
  Sparkles,
  Mic,
  Square,
  X,
  Settings,
  ChevronDown,
  Check,
  AlertCircle,
  ClipboardList,
  ArrowRight,
  Hash,
  Cpu,
  Image as ImageIcon,
  ScanLine,
  RefreshCw,
  ShieldCheck,
  FileImage,
  Zap,
  Eye,
} from 'lucide-react';
import { uploadImage, uploadFile, fetchUrlContent } from '../services/api';
import { PRESET_SOURCES } from '../utils/presets';

const SUPPORTED_IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function IngestionHub({
  sourceTitle,
  setSourceTitle,
  sourceContent,
  setSourceContent,
  sourceType,
  setSourceType,
  onApplyPreset,
  onNextStep,
  step = 1
}) {
  // Primary image upload state
  const [uploadedImage, setUploadedImage] = useState(null);  // { file, previewUrl, name }
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [extractionComplete, setExtractionComplete] = useState(false);

  // Secondary input tabs
  const [activeTab, setActiveTab] = useState('image'); // image | url | presets | voice | text
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [simulatedNotice, setSimulatedNotice] = useState(false);

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const micRafRef = useRef(null);

  // Stats
  const charCount = sourceContent.length;
  const wordCount = sourceContent.trim() ? sourceContent.trim().split(/\s+/).length : 0;
  const estimatedTokens = Math.round(wordCount * 1.35);
  const hasContent = !!sourceContent.trim();

  /* ─── Image Upload & Gemini Vision Analysis ─── */
  const processImageFile = useCallback(async (file) => {
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_IMAGE_EXTS.includes(ext) && !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      setError('Unsupported image format. Please upload PNG, JPG, JPEG, or WEBP files.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage({ file, previewUrl, name: file.name });
    setError(null);
    setExtractionComplete(false);
    setAnalysisMeta(null);
    setSimulatedNotice(false);
    setActiveTab('image');

    setIsAnalyzing(true);
    try {
      const data = await uploadImage(file);
      setSourceContent(data.extracted_text || '');
      setSourceTitle(
        data.metadata?.document_title ||
        file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      );
      setSourceType('image');
      setAnalysisMeta(data.metadata || null);
      setSimulatedNotice(data.metadata?.extraction_mode === 'simulated');
      setExtractionComplete(true);
    } catch (err) {
      setExtractionComplete(false);
      setError(err?.message || err?.response?.data?.detail || 'Vision analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [setSourceContent, setSourceTitle, setSourceType]);

  /* ─── Drag & Drop handlers ─── */
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleImageInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  /* ─── Clear / Re-upload ─── */
  const handleClearImage = () => {
    if (uploadedImage?.previewUrl) URL.revokeObjectURL(uploadedImage.previewUrl);
    setUploadedImage(null);
    setExtractionComplete(false);
    setAnalysisMeta(null);
    setSimulatedNotice(false);
    setSourceContent('');
    setSourceTitle('');
    setSourceType('text');
    setError(null);
  };

  /* ─── URL fetch ─── */
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUrlContent(urlInput);
      setSourceContent(data.extracted_text);
      setSourceTitle(data.metadata?.title || 'Web Intelligence Source');
      setSourceType('url');
      setActiveTab('image');
    } catch (err) {
      setError(err?.message || 'Failed to extract content from URL.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Preset ─── */
  const handleSelectPreset = (preset) => {
    setSourceTitle(preset.title);
    setSourceContent(preset.content);
    setSourceType('preset');
    if (onApplyPreset) onApplyPreset(preset);
    setActiveTab('image');
  };

  /* ─── Voice: live browser speech recognition (Web Speech API) ─── */
  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const commitVoiceTranscript = useCallback((text) => {
    const transcript = (text || '').trim();
    if (!transcript) return;
    setSourceContent(prev => (prev ? `${prev.trim()}\n\n${transcript}` : transcript));
    setSourceTitle(prev => (prev ? prev : 'Voice Intelligence Dispatch'));
    setSourceType('voice');
    setActiveTab('image');
    setVoiceTranscript('');
    setInterimTranscript('');
  }, [setSourceContent, setSourceTitle, setSourceType]);

  const stopMicMeter = useCallback(() => {
    if (micRafRef.current) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (analyserRef.current) analyserRef.current = null;
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* already closed */ }
      audioCtxRef.current = null;
    }
    setMicLevel(0);
  }, []);

  const startMicMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setMicLevel(Math.min(1, avg * 3));
        micRafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Meter is cosmetic; recognition may still work.
    }
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
    stopMicMeter();
    setIsRecording(false);
    setInterimTranscript('');
    commitVoiceTranscript(finalTranscriptRef.current);
    finalTranscriptRef.current = '';
  }, [commitVoiceTranscript, stopMicMeter]);

  const startVoiceRecording = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setVoiceSupported(false);
      return;
    }

    setError(null);
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setVoiceTranscript('');
    setIsRecording(true);
    startMicMeter();

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        if (result.isFinal) {
          finalTranscriptRef.current += `${text.trim()} `;
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim.trim());
      setVoiceTranscript(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      stopMicMeter();
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Allow microphone permission in your browser and try again.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Speak while recording and try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Connect an input device and try again.');
      } else {
        setError(`Voice capture failed (${event.error}). Please try again.`);
      }
      // Keep anything already captured.
      commitVoiceTranscript(finalTranscriptRef.current);
      finalTranscriptRef.current = '';
    };

    recognition.onend = () => {
      setIsRecording(false);
      stopMicMeter();
      setInterimTranscript('');
      const captured = finalTranscriptRef.current;
      finalTranscriptRef.current = '';
      if (captured.trim()) {
        commitVoiceTranscript(captured);
      } else {
        setActiveTab(tab => tab);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      stopMicMeter();
      setIsRecording(false);
      setError('Voice capture could not start. Please try again.');
    }
  }, [SpeechRecognitionCtor, commitVoiceTranscript, startMicMeter, stopMicMeter]);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  useEffect(() => () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
      recognitionRef.current = null;
    }
    stopMicMeter();
  }, [stopMicMeter]);

  /* ─── Generic file upload (non-image) ─── */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await uploadFile(file);
      setSourceContent(data.extracted_text);
      setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
      setSourceType('document');
      setActiveTab('image');
    } catch (err) {
      setError(err?.message || 'Failed to parse uploaded document.');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <div className="rounded-2xl border border-[#1b233a] bg-gradient-to-b from-[#0d1222]/95 to-[#090d18]/95 p-5 lg:p-6 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] flex flex-col gap-4">

      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1b233a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#ff9e2c] shadow-[0_0_12px_rgba(255,158,44,0.25)]">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            1. Image Upload &amp; Vision Analysis
          </h2>
        </div>

        {/* Step Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-500/40 bg-orange-500/10 text-[#ff9e2c] font-semibold shadow-[0_0_10px_rgba(255,122,0,0.2)]">
            <span className="w-4 h-4 rounded-full bg-orange-500 text-zinc-950 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Ingest</span>
          </div>
          <button type="button" onClick={() => onNextStep?.(2)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 font-medium cursor-pointer hover:border-white/20 hover:text-zinc-200 transition"
            title="Go to Step 2: Transformation Matrix">
            <span className="w-4 h-4 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[10px]">2</span>
            <span>Matrix</span>
          </button>
          <button type="button" onClick={() => onNextStep?.(3)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-[#101526]/50 text-zinc-400 font-medium cursor-pointer hover:border-white/20 hover:text-zinc-200 transition"
            title="Go to Step 3: Generation Studio">
            <span className="w-4 h-4 rounded-full border border-white/20 text-zinc-400 flex items-center justify-center text-[10px]">3</span>
            <span>Studio</span>
          </button>
        </div>
      </div>

      {/* ── Document Title Input ── */}
      <div>
        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
          Source Document Title / Subject
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400">
            <FileText className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={sourceTitle}
            onChange={(e) => setSourceTitle(e.target.value)}
            placeholder="e.g. NCSDA Cyber Credential — Priya Sharma — Jan 2026"
            className="w-full bg-[#0a0e1c] border border-[#1d263f] focus:border-orange-500/60 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors shadow-inner"
          />
          {sourceTitle && (
            <button onClick={() => setSourceTitle('')}
              className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 p-0.5" aria-label="Clear title">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Secondary Tab Bar ── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {[
          { id: 'image',   label: 'Image Upload', color: 'text-orange-300 border-orange-500/60 bg-orange-500/10', inactive: 'text-zinc-500 border-white/8 bg-[#0c101f]/60 hover:text-orange-300 hover:border-orange-500/30' },
          { id: 'url',     label: 'URL',           color: 'text-cyan-300   border-cyan-500/60   bg-cyan-500/10',   inactive: 'text-zinc-500 border-white/8 bg-[#0c101f]/60 hover:text-cyan-300   hover:border-cyan-500/30'   },
          { id: 'presets', label: 'Presets',       color: 'text-amber-300  border-amber-500/60  bg-amber-500/10',  inactive: 'text-zinc-500 border-white/8 bg-[#0c101f]/60 hover:text-amber-300  hover:border-amber-500/30'  },
          { id: 'text',    label: 'Text',          color: 'text-violet-300 border-violet-500/60 bg-violet-500/10', inactive: 'text-zinc-500 border-white/8 bg-[#0c101f]/60 hover:text-violet-300 hover:border-violet-500/30' },
          { id: 'voice',   label: 'Voice',         color: 'text-rose-300   border-rose-500/60   bg-rose-500/10',   inactive: 'text-zinc-500 border-white/8 bg-[#0c101f]/60 hover:text-rose-300   hover:border-rose-500/30'   },
        ].map(({ id, label, color, inactive }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${activeTab === id ? color : inactive}`}
          >
            {id === 'image'   && <FileImage      className="w-3.5 h-3.5" />}
            {id === 'url'     && <Globe          className="w-3.5 h-3.5" />}
            {id === 'presets' && <Sparkles       className="w-3.5 h-3.5" />}
            {id === 'text'    && <ClipboardList  className="w-3.5 h-3.5" />}
            {id === 'voice'   && <Mic            className="w-3.5 h-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* ── URL Tab Panel ── */}
      {activeTab === 'url' && (
        <div className="p-4 rounded-xl border border-[#202945] bg-[#0c101f]/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold pb-2 border-b border-white/5">
            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> Ingest from Live URL</span>
            <button onClick={() => setActiveTab('image')} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2">
            <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
              placeholder="https://cert-in.org.in/advisories/..."
              className="flex-1 bg-[#0a0e1c] border border-[#1d263f] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 transition" />
            <button onClick={handleFetchUrl} disabled={loading || !urlInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-xl transition">
              {loading ? 'Fetching...' : 'Fetch Intel'}
            </button>
          </div>
        </div>
      )}

      {/* ── Presets Tab Panel ── */}
      {activeTab === 'presets' && (
        <div className="p-4 rounded-xl border border-[#202945] bg-[#0c101f]/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold pb-2 border-b border-white/5">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Select Preset Intelligence Dispatch</span>
            <button onClick={() => setActiveTab('image')} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {PRESET_SOURCES.map((p) => (
              <div key={p.id} onClick={() => handleSelectPreset(p)}
                className="p-3 rounded-xl bg-[#0a0e1c] hover:bg-[#12182e] border border-[#1d263f] hover:border-amber-500/50 cursor-pointer transition flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{p.category}</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">{p.classification}</span>
                </div>
                <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{p.title}</h4>
                <p className="text-[11px] text-zinc-400 line-clamp-2">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Text Tab Panel ── */}
      {activeTab === 'text' && (
        <div className="p-4 rounded-xl border border-[#202945] bg-[#0c101f]/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold pb-2 border-b border-white/5">
            <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-violet-400" /> Raw Text / Intelligence Paste</span>
            <button onClick={() => setActiveTab('image')} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <textarea
            rows={7}
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="Paste raw source intelligence, threat advisories, policy memos, incident reports, research papers, or free-form operational prompts..."
            className="w-full bg-[#070b16] border border-[#1d263f] rounded-xl px-3.5 py-3 text-xs sm:text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500/60 resize-y leading-relaxed transition"
          />
          <div className="flex justify-end">
            <button onClick={() => { setSourceType('text'); setActiveTab('image'); }}
              disabled={!sourceContent.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 transition">
              <Check className="w-3.5 h-3.5" /> Use this text
            </button>
          </div>
        </div>
      )}

      {/* ── Voice Tab ── */}
      {activeTab === 'voice' && (
        <div className="p-4 rounded-xl border border-[#202945] bg-[#0c101f]/90 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold pb-2 border-b border-white/5">
            <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-rose-400" /> Voice Dispatch Recording</span>
            <button onClick={() => setActiveTab('image')} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {!voiceSupported ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Live speech capture is not supported in this browser. Use Chrome, Edge or Safari, or paste the transcript in the Text tab.
              </p>
              <button onClick={() => setActiveTab('text')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-violet-500/15 border border-violet-500/40 text-violet-300 hover:bg-violet-500/25 transition">
                <ClipboardList className="w-3.5 h-3.5" /> Paste text instead
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <button onClick={toggleVoiceRecording}
                title={isRecording ? 'Stop recording' : 'Start recording'}
                className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-lg ${
                  isRecording
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-[#141a2e] border-rose-500/40 text-rose-400 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                }`}>
                {isRecording && micLevel > 0.06 && (
                  <span
                    className="absolute inset-0 rounded-full border-2 border-red-400/60 pointer-events-none"
                    style={{
                      transform: `scale(${1 + micLevel * 0.45})`,
                      opacity: 1 - micLevel * 0.5,
                      transition: 'transform 80ms linear, opacity 80ms linear',
                    }}
                  />
                )}
                {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-8 h-8" />}
              </button>

              {isRecording && (
                <div className="flex items-center gap-1.5 h-4" aria-hidden="true">
                  {Array.from({ length: 13 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-rose-400"
                      style={{
                        height: `${4 + (isRecording ? micLevel : 0) * 12 * (0.4 + Math.abs(Math.sin(i * 1.1)) * 0.9)}px`,
                        transition: 'height 90ms linear',
                      }}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-zinc-400 text-center">
                {isRecording
                  ? <span className="text-red-400 font-semibold">● Recording — speak now, click again to stop</span>
                  : 'Click the microphone to record a voice intelligence dispatch'
                }
              </p>

              {(voiceTranscript) && (
                <div className="w-full rounded-xl border border-rose-500/25 bg-[#070b16]/80 p-3 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400/80 mb-1">Live transcript</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <span className="text-zinc-200">{finalTranscriptRef.current}</span>
                    <span className="text-rose-300/80">{interimTranscript}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           PRIMARY: IMAGE UPLOAD DROPZONE  (shown when activeTab === 'image')
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'image' && (
        <div
          className="relative overflow-hidden rounded-2xl transition-all min-h-[280px] flex flex-col bg-gradient-to-b from-[#0b1120] via-[#0a0e1c] to-[#080c17]"
          style={{
            border: isDragOver
              ? '2px solid rgba(255,158,44,0.7)'
              : uploadedImage && extractionComplete
              ? '2px solid rgba(34,197,94,0.4)'
              : '2px solid rgba(27,35,58,0.9)',
            boxShadow: isDragOver
              ? '0 0 40px rgba(255,158,44,0.2), inset 0 0 40px rgba(255,158,44,0.06)'
              : uploadedImage && extractionComplete
              ? '0 0 30px rgba(34,197,94,0.12)'
              : 'none',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* BG accent glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />

          {/* Hidden inputs */}
          <input ref={imageInputRef} type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden" onChange={handleImageInputChange} />
          <input ref={fileInputRef} type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.json,.csv,.log"
            className="hidden" onChange={handleFileUpload} />

          {/* ── STATE A: Empty dropzone ── */}
          {!uploadedImage && !isAnalyzing && (
            <div className="relative z-10 flex flex-col items-center justify-center gap-5 p-6 sm:p-10 flex-1 text-center">
              {/* Upload icon */}
              <div className={`relative transition-transform duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all shadow-2xl ${
                  isDragOver
                    ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_40px_rgba(255,158,44,0.4)]'
                    : 'bg-[#0e1626]/80 border-[#263152] text-orange-400 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
                }`}>
                  {isDragOver
                    ? <Upload className="w-9 h-9 animate-bounce" />
                    : <FileImage className="w-9 h-9" />
                  }
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-[0_0_12px_rgba(255,158,44,0.6)]">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-900 fill-current" />
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <h3 className={`text-lg font-bold tracking-tight transition-colors ${isDragOver ? 'text-orange-300' : 'text-white'}`}>
                  {isDragOver ? 'Drop to Analyze with Gemini Vision' : 'Upload Document / Certificate Image'}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Drag &amp; drop or browse to upload. Gemini Vision AI will extract structured
                  text, credentials, issuing authority, and metadata automatically.
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {['PNG', 'JPG', 'JPEG', 'WEBP'].map(fmt => (
                    <span key={fmt} className="text-[10px] px-2 py-0.5 rounded bg-[#111827] border border-[#1f2937] text-zinc-500 font-semibold">{fmt}</span>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button id="upload-image-btn" onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-zinc-950 shadow-[0_0_20px_rgba(255,158,44,0.4)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(255,158,44,0.6)] transition-all">
                  <Upload className="w-4 h-4" /> Browse Image
                </button>
                <button onClick={() => setActiveTab('url')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0f1426]/80 text-zinc-300 border border-white/10 hover:border-cyan-500/40 hover:text-cyan-300 transition-all">
                  <Globe className="w-3.5 h-3.5" /> URL
                </button>
                <button onClick={() => setActiveTab('presets')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0f1426]/80 text-zinc-300 border border-white/10 hover:border-amber-500/40 hover:text-amber-300 transition-all">
                  <Sparkles className="w-3.5 h-3.5" /> Presets
                </button>
                <button onClick={() => setActiveTab('text')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0f1426]/80 text-zinc-300 border border-white/10 hover:border-violet-500/40 hover:text-violet-300 transition-all">
                  <ClipboardList className="w-3.5 h-3.5" /> Paste Text
                </button>
                <button onClick={() => setActiveTab('voice')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isRecording
                      ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse'
                      : 'bg-[#0f1426]/80 text-zinc-300 border-white/10 hover:border-rose-500/40 hover:text-rose-300'
                  }`}>
                  <Mic className="w-3.5 h-3.5" />
                  {isRecording ? 'Listening...' : 'Voice'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-600">or drag and drop directly onto this zone</p>
            </div>
          )}

          {/* ── STATE B: Gemini Vision Analyzing ── */}
          {isAnalyzing && (
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-10 flex-1 text-center">
              <div className="relative w-24 h-24">
                {uploadedImage?.previewUrl && (
                  <img src={uploadedImage.previewUrl} alt="Analyzing"
                    className="w-24 h-24 object-cover rounded-xl border border-orange-500/30 opacity-60" />
                )}
                <div className="absolute inset-0 rounded-xl border-2 border-orange-400/60 animate-pulse" />
                {/* Scan line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-bounce" style={{ top: '45%' }} />
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-400 rounded-br" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-orange-300 font-bold text-sm justify-center">
                  <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  Gemini Vision Analyzing...
                </div>
                <p className="text-xs text-zinc-400">
                  Extracting credentials, text &amp; metadata from{' '}
                  <span className="text-zinc-200 font-medium">{uploadedImage?.name}</span>
                </p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 mt-2">
                  {['OCR Extraction', 'Metadata Parsing', 'Structure Analysis'].map((s, i) => (
                    <span key={s} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-orange-400"
                        style={{ animationDelay: `${i * 180}ms` }} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STATE C: Image uploaded + extraction done ── */}
          {uploadedImage && !isAnalyzing && (
            <div className="relative z-10 flex flex-col flex-1">
              {/* Preview header */}
              <div className="flex items-start gap-4 p-4 sm:p-5 border-b border-white/8">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img src={uploadedImage.previewUrl} alt={uploadedImage.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-white/10 shadow-lg" />
                  {extractionComplete && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Info + controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-zinc-100 truncate">{uploadedImage.name}</h4>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#141b2e] border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition"
                        title="Re-upload image">
                        <RefreshCw className="w-3 h-3" /> Re-upload
                      </button>
                      <button onClick={handleClearImage}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition"
                        title="Clear uploaded image">
                        <X className="w-3 h-3" /> Clear
                      </button>
                    </div>
                  </div>

                  {extractionComplete && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mb-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> Vision extraction complete
                    </div>
                  )}

                  {simulatedNotice && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        Simulated extraction — no vision model is available, so this image was not actually read.
                        Set <code className="font-mono text-amber-100">GEMINI_API_KEY</code> for Gemini Vision, or paste the text below.
                      </span>
                    </div>
                  )}

                  {/* Metadata pills */}
                  {analysisMeta && (
                    <div className="flex flex-wrap gap-1.5">
                      {analysisMeta.candidate_name && (
                        <MetaPill label="Candidate" value={analysisMeta.candidate_name} color="orange" />
                      )}
                      {analysisMeta.issuing_authority && (
                        <MetaPill label="Issuer" value={analysisMeta.issuing_authority} color="sky" />
                      )}
                      {analysisMeta.dates && (
                        <MetaPill label="Date" value={analysisMeta.dates} color="violet" />
                      )}
                      {analysisMeta.credential_id && (
                        <MetaPill label="ID" value={analysisMeta.credential_id} color="amber" />
                      )}
                      {analysisMeta.model_used && (
                        <MetaPill label="Engine" value={analysisMeta.model_used} color="emerald" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted text preview */}
              {extractionComplete && sourceContent && (
                <div className="flex flex-col flex-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                      <Eye className="w-3.5 h-3.5 text-orange-400" />
                      Extracted Content Preview
                    </span>
                    <button onClick={() => setActiveTab('text')}
                      className="text-[11px] text-orange-400 hover:underline flex items-center gap-1">
                      <Settings className="w-3 h-3" /> Edit manually
                    </button>
                  </div>
                  <div className="bg-[#050810]/70 rounded-xl border border-[#1a2035] p-3 overflow-y-auto max-h-44">
                    <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {sourceContent.slice(0, 900)}
                      {sourceContent.length > 900 ? '\n\n[… truncated — full content loaded for transformation]' : ''}
                    </pre>
                  </div>
                </div>
              )}

              {/* Retry state if extraction failed */}
              {!extractionComplete && !isAnalyzing && (
                <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-6 flex-1 text-center">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  <p className="text-xs text-zinc-400">Extraction did not complete. Try re-uploading or use a different image.</p>
                  <button onClick={() => processImageFile(uploadedImage.file)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:bg-orange-500/30 transition">
                    <Zap className="w-3.5 h-3.5" /> Retry Analysis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Drag-over overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-orange-500/10 border-2 border-orange-400/80 pointer-events-none">
              <Upload className="w-12 h-12 text-orange-300 animate-bounce" />
              <span className="text-base font-bold text-orange-300">Drop image to analyze with Vision AI</span>
            </div>
          )}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Global loading spinner (URL / generic file ops) ── */}
      {loading && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0f1426] border border-[#1d263f] text-[#ff9e2c] text-xs font-semibold">
          <span className="w-4 h-4 border-2 border-[#ff9e2c] border-t-transparent rounded-full animate-spin" />
          Ingesting &amp; Parsing Source…
        </div>
      )}

      {/* ── Telemetry Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-medium text-zinc-400 border-t border-[#1b233a]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-zinc-500" />
            <span>Words: <strong className="text-zinc-200">{wordCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-zinc-500" />
            <span>Chars: <strong className="text-zinc-200">{charCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <span>Tokens: <strong className="text-[#ff9e2c]">~{estimatedTokens}</strong></span>
          </div>
          {sourceType && (
            <div className="flex items-center gap-1.5">
              <ScanLine className="w-3.5 h-3.5 text-zinc-500" />
              <span>Mode: <strong className="text-zinc-200 uppercase">{sourceType}</strong></span>
            </div>
          )}
        </div>

        <button
          onClick={() => onNextStep?.(2)}
          disabled={!hasContent}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,122,0,0.35)] transition"
        >
          <span>Configure &amp; Transform</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Reusable metadata badge pill ── */
function MetaPill({ label, value, color }) {
  const colorMap = {
    orange:  'bg-orange-500/10  border-orange-500/20  text-orange-300',
    sky:     'bg-sky-500/10     border-sky-500/20     text-sky-300',
    violet:  'bg-violet-500/10  border-violet-500/20  text-violet-300',
    amber:   'bg-amber-500/10   border-amber-500/20   text-amber-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${colorMap[color] || colorMap.orange}`}>
      <span className="text-zinc-500">{label}:</span>
      <span className="font-semibold truncate max-w-[120px]" title={value}>{value}</span>
    </span>
  );
}

