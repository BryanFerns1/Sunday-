import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Square, Volume2, Film, Download, 
  Copy, Check, X, Sparkles, Clock, Camera, FileText, 
  Activity, MonitorPlay, Radio, Shield 
} from 'lucide-react';

export default function VideoViewer({ data }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedNarration, setCopiedNarration] = useState(false);
  const timerRef = useRef(null);
  const keepAliveRef = useRef(null);
  const chunkQueueRef = useRef([]);
  const voiceRef = useRef(null);

  const scenes = data?.scenes || [];
  const currentScene = scenes[currentSceneIndex] || scenes[0] || {};
  const fullNarration = data?.narration_full_text || scenes.map(s => s.narration_script).join(" ");
  const srtContent = data?.subtitles_srt || "";

  // Verification: all 5 required sub-components must be present in the package
  const subComponentStatus = [
    { label: '1. Full Script & Narration', present: !!fullNarration?.trim() },
    { label: '2. Scene-by-Scene Storyboard', present: scenes.length > 0 },
    { label: '3. Visual Recommendations & Shot Types', present: !!(data?.visual_recommendations_and_shot_types || scenes.some(s => s.camera_cue)) },
    { label: '4. Subtitles / Closed Captions', present: !!srtContent?.trim() },
    { label: '5. On-Screen Graphics & Motion Design', present: !!(data?.motion_design_directions || scenes.some(s => s.motion_graphics_cue)) },
  ];

  const pickEnglishVoice = () => {
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const preferred =
      voices.find(v => /en-IN/i.test(v.lang) && /google|microsoft/i.test(v.name)) ||
      voices.find(v => /^en[-_]/i.test(v.lang)) ||
      null;
    return preferred;
  };

  // Chrome truncates utterances after ~15s, so narration is spoken in chunks.
  const splitIntoChunks = (text, maxLen = 220) => {
    const sentences = (text || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
    const chunks = [];
    let current = '';
    sentences.forEach(sentence => {
      if ((current + ' ' + sentence).trim().length > maxLen && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = `${current} ${sentence}`.trim();
      }
    });
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [text];
  };

  const stopNarration = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    chunkQueueRef.current = [];
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
    setIsPlaying(false);
  }, []);

  const speakChunks = useCallback((chunks, { loopScenes = false } = {}) => {
    const synth = window.speechSynthesis;
    chunkQueueRef.current = [...chunks];

    const speakNext = () => {
      const next = chunkQueueRef.current.shift();
      if (!next) {
        if (loopScenes) {
          chunkQueueRef.current = [...chunks];
          speakNext();
        } else {
          setIsPlaying(false);
          if (keepAliveRef.current) { clearInterval(keepAliveRef.current); keepAliveRef.current = null; }
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        }
        return;
      }
      const utterance = new SpeechSynthesisUtterance(next);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.onend = speakNext;
      utterance.onerror = () => {
        chunkQueueRef.current = [];
        setIsPlaying(false);
      };
      synth.speak(utterance);
    };

    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = setInterval(() => {
      if (!synth.speaking) return;
      synth.pause();
      synth.resume();
    }, 10000);

    speakNext();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;
    const load = () => { voiceRef.current = pickEnglishVoice(); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  const handlePlayVoiceover = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      stopNarration();
      return;
    }

    stopNarration();
    voiceRef.current = voiceRef.current || pickEnglishVoice();
    setCurrentSceneIndex(0);

    let sceneIdx = 0;
    const intervalMs = 6000; // rotate scene every 6s during speech
    timerRef.current = setInterval(() => {
      sceneIdx = (sceneIdx + 1) % (scenes.length || 1);
      setCurrentSceneIndex(sceneIdx);
    }, intervalMs);

    setIsPlaying(true);
    speakChunks(splitIntoChunks(fullNarration), { loopScenes: false });
  };

  const handlePlaySingleScene = (script, idx) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stopNarration();
    setCurrentSceneIndex(idx);
    voiceRef.current = voiceRef.current || pickEnglishVoice();
    setIsPlaying(true);
    speakChunks(splitIntoChunks(script), { loopScenes: false });
  };

  const handleDownloadSRT = () => {
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data?.title || 'video_package').replace(/\s+/g, '_')}_subtitles.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySRT = () => {
    navigator.clipboard.writeText(srtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyNarration = () => {
    navigator.clipboard.writeText(fullNarration);
    setCopiedNarration(true);
    setTimeout(() => setCopiedNarration(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-defense-900 to-indigo-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
              Complete Video Package &amp; Storyboard
            </span>
          </div>
          <h3 className="text-base font-bold text-zinc-100">
            {data?.title || 'Tactical Intelligence Broadcast Video Package'}
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-1">
            <span>Duration: <strong className="text-purple-300">{data?.duration_estimate || '90 Seconds'}</strong></span>
            <span>Platform: <strong className="text-zinc-200">{data?.target_platform || 'Digital Screen / Operations'}</strong></span>
            <span>Scenes: <strong className="text-zinc-200">{scenes.length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayVoiceover}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'STOP VOICEOVER' : 'PLAY FULL VIDEO NARRATION (TTS)'}</span>
          </button>

          <button
            onClick={handleDownloadSRT}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-defense-900 hover:bg-defense-800 border border-defense-700 text-zinc-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.SRT</span>
          </button>
        </div>
      </div>

      {/* 5 REQUIRED SUB-COMPONENT COMPLETENESS VERIFICATION */}
      <div className="p-3.5 rounded-xl bg-defense-900/70 border border-defense-800">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Package Completeness — Required Sub-Components:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {subComponentStatus.map(({ label, present }) => (
            <div
              key={label}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[10px] font-mono font-semibold ${
                present
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {present
                ? <Check className="w-3.5 h-3.5 flex-shrink-0" />
                : <X className="w-3.5 h-3.5 flex-shrink-0" />
              }
              <span className="leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LIVE VIDEO SIMULATOR CANVAS */}
      <div className="relative rounded-2xl bg-gradient-to-b from-zinc-950 via-defense-950 to-zinc-900 border-2 border-purple-500/40 p-6 sm:p-8 min-h-[340px] flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Animated Cyber Radar Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono">
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
            isPlaying ? 'bg-red-950/90 text-red-400 border-red-500/60 animate-pulse' : 'bg-defense-900 text-zinc-400 border-defense-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-400' : 'bg-zinc-500'}`} />
            {isPlaying ? 'LIVE SIMULATION (TTS BROADCAST)' : 'STANDBY'}
          </span>
          <span className="text-purple-400 font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
            SCENE {currentSceneIndex + 1}/{scenes.length}
          </span>
        </div>

        {/* Video Screen Center Content */}
        <div className="my-auto text-center space-y-4 max-w-2xl mx-auto z-10 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-defense-900/90 border border-purple-500/40 text-xs font-mono text-purple-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Camera Angle: {currentScene.camera_cue || 'Dynamic Aerial Drone Angle'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase font-mono">
            {currentScene.on_screen_text || data?.title}
          </h3>

          <p className="text-xs text-zinc-300 font-sans italic bg-defense-950/80 p-3 rounded-xl border border-defense-800 leading-relaxed">
            "{currentScene.visual_description}"
          </p>

          {/* Audio Waveform Simulator Bars when playing */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1 h-6">
              {[40, 75, 100, 60, 85, 30, 95, 50, 80, 65, 90, 45].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1.5 bg-gradient-to-t from-cyan-500 to-purple-400 rounded-full animate-bounce"
                />
              ))}
            </div>
          )}
        </div>

        {/* Live Subtitle Overlay Banner */}
        <div className="z-10 pt-3 border-t border-defense-800/80 bg-defense-950/90 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-purple-400 font-bold">SUBTITLES:</span>
            <span className="text-zinc-200 font-medium font-sans">
              "{currentScene.narration_script}"
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            SFX: {currentScene.audio_soundfx || 'Ambient cyber tone'}
          </span>
        </div>
      </div>

      {/* Visual Thumbnail Prompt Recommendation */}
      {data?.thumbnail_prompt && (
        <div className="p-3.5 rounded-lg bg-defense-900/80 border border-defense-800 text-xs">
          <span className="font-mono font-bold text-purple-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Thumbnail &amp; Keyframe Generation Prompt:
          </span>
          <p className="text-zinc-300 italic font-mono bg-defense-950/60 p-2 rounded border border-defense-800">
            "{data.thumbnail_prompt}"
          </p>
        </div>
      )}

      {/* 1. FULL SCRIPT & NARRATION TEXT */}
      {fullNarration?.trim() && (
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Full Script &amp; Narration Text:
            </span>
            <button
              onClick={handleCopyNarration}
              className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              {copiedNarration ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNarration ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>
          <p className="p-3 bg-defense-950 rounded-lg text-xs text-zinc-300 leading-relaxed border border-defense-800 whitespace-pre-wrap">
            {fullNarration}
          </p>
        </div>
      )}

      {/* 3 & 5. VISUAL RECOMMENDATIONS + MOTION DESIGN DIRECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {data?.visual_recommendations_and_shot_types && (
          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-cyan-400" /> Visual Recommendations &amp; Shot Types:
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.visual_recommendations_and_shot_types}
            </p>
          </div>
        )}

        {data?.motion_design_directions && (
          <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 mb-2">
              <MonitorPlay className="w-4 h-4 text-indigo-400" /> On-Screen Graphics &amp; Motion Design:
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {data.motion_design_directions}
            </p>
          </div>
        )}
      </div>

      {/* Storyboard Scene Breakdown Cards */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Scene-by-Scene Storyboard Breakdown:</span>
        </h4>

        <div className="grid grid-cols-1 gap-3.5">
          {scenes.map((scene, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                currentSceneIndex === idx
                  ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-400/40 shadow-sm'
                  : 'bg-defense-900/70 border-defense-800 hover:border-defense-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-defense-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-purple-900/80 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center justify-center">
                    {scene.scene_number || idx + 1}
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-200">
                    Scene {scene.scene_number || idx + 1} ({scene.duration_sec || 15}s)
                  </span>
                  {scene.timestamp_range && (
                    <span className="px-2 py-0.5 rounded bg-defense-950 text-[10px] font-mono text-zinc-400 border border-defense-700">
                      {scene.timestamp_range}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-defense-950 text-[10px] font-mono text-cyan-400 border border-defense-700">
                    {scene.camera_cue}
                  </span>
                </div>

                <button
                  onClick={() => handlePlaySingleScene(scene.narration_script, idx)}
                  className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 bg-defense-950 px-2.5 py-1 rounded border border-defense-700 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen Scene</span>
                </button>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" /> Visual &amp; Animation Spec:
                  </span>
                  <p className="text-zinc-200 bg-defense-950/60 p-2.5 rounded-lg border border-defense-800/80 leading-relaxed">
                    {scene.visual_description}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-400" /> Voiceover Narration:
                  </span>
                  <p className="text-purple-200 bg-purple-950/30 p-2.5 rounded-lg border border-purple-900/40 leading-relaxed">
                    "{scene.narration_script}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 mt-2.5 pt-2 border-t border-defense-800/60">
                <span>On-Screen Text: <strong className="text-zinc-200">{scene.on_screen_text || 'N/A'}</strong></span>
                <span>Audio SFX: <strong className="text-zinc-300">{scene.audio_soundfx || 'Ambient electronic scan'}</strong></span>
              </div>

              {scene.motion_graphics_cue && (
                <div className="mt-2.5 pt-2 border-t border-defense-800/60 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <MonitorPlay className="w-3 h-3 text-indigo-400" /> Motion Graphics &amp; On-Screen Design:
                  </span>
                  <p className="text-zinc-300 bg-defense-950/60 p-2.5 rounded-lg border border-defense-800/80 leading-relaxed">
                    {scene.motion_graphics_cue}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subtitles SRT */}
      {srtContent && (
        <div className="p-4 rounded-xl bg-defense-900/80 border border-defense-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Subtitles Output (.SRT Format):
            </span>
            <button
              onClick={handleCopySRT}
              className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SRT'}</span>
            </button>
          </div>
          <pre className="p-3 bg-defense-950 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto max-h-40 border border-defense-800">
            {srtContent}
          </pre>
        </div>
      )}
    </div>
  );
}
