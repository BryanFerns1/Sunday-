import React, { useState } from 'react';
import { 
  Linkedin, Twitter, Copy, Check, Sparkles, MessageCircle, 
  Repeat, Heart, Share2, MoreHorizontal, ShieldCheck 
} from 'lucide-react';

export default function SocialMediaViewer({ linkedinData, twitterData }) {
  const [activeTab, setActiveTab] = useState(linkedinData ? 'linkedin' : 'twitter');
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Sub-Tab Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-defense-800">
        <div className="flex items-center gap-2">
          {linkedinData && (
            <button
              onClick={() => setActiveTab('linkedin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                activeTab === 'linkedin'
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/60 shadow-sm'
                  : 'bg-defense-900 text-zinc-400 border-defense-800 hover:border-defense-700'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn Post</span>
            </button>
          )}

          {twitterData && (
            <button
              onClick={() => setActiveTab('twitter')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                activeTab === 'twitter'
                  ? 'bg-sky-600/30 text-sky-300 border-sky-500/60 shadow-sm'
                  : 'bg-defense-900 text-zinc-400 border-defense-800 hover:border-defense-700'
              }`}
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              <span>Twitter / X Thread</span>
            </button>
          )}
        </div>

        {/* Global Copy */}
        {activeTab === 'linkedin' && linkedinData && (
          <button
            onClick={() => handleCopy(linkedinData.full_text || linkedinData.core_narrative, 'linkedin-all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-defense-900 hover:bg-defense-800 border border-defense-700 rounded-lg text-zinc-200 transition-all"
          >
            {copiedKey === 'linkedin-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'linkedin-all' ? 'Copied!' : 'Copy Post'}</span>
          </button>
        )}

        {activeTab === 'twitter' && twitterData && (
          <button
            onClick={() => handleCopy(twitterData.full_thread_text, 'twitter-all')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-defense-900 hover:bg-defense-800 border border-defense-700 rounded-lg text-zinc-200 transition-all"
          >
            {copiedKey === 'twitter-all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'twitter-all' ? 'Copied!' : 'Copy Thread'}</span>
          </button>
        )}
      </div>

      {/* 1. LINKEDIN POST PREVIEW */}
      {activeTab === 'linkedin' && linkedinData && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-defense-900/90 rounded-2xl border border-defense-700/80 p-5 shadow-xl space-y-4">
            {/* LinkedIn Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black font-mono text-sm border border-cyan-400/40">
                  SUNDAY
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-zinc-100">
                      the Organisation
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Govt of India • Official Intelligence &amp; Technology Agency • 1h • 🌐
                  </p>
                </div>
              </div>
              <button className="text-zinc-500 hover:text-zinc-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Body */}
            <div className="text-sm text-zinc-200 leading-relaxed space-y-3 font-sans whitespace-pre-line">
              <p className="font-bold text-cyan-300">
                {linkedinData.hook}
              </p>
              <p>
                {linkedinData.core_narrative}
              </p>

              {linkedinData.key_takeaways && (
                <div className="space-y-1.5 pt-1">
                  <strong className="text-xs font-mono uppercase text-zinc-400">Key Strategic Takeaways:</strong>
                  {linkedinData.key_takeaways.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              )}

              {linkedinData.call_to_action && (
                <p className="text-xs italic text-zinc-300 pt-2 border-t border-defense-800">
                  {linkedinData.call_to_action}
                </p>
              )}

              {/* Hashtag Pills */}
              {linkedinData.hashtags && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {linkedinData.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Graphic Cue */}
            {linkedinData.image_prompt && (
              <div className="p-3 rounded-lg bg-defense-950/80 border border-defense-800 text-xs">
                <span className="font-mono text-[10px] text-cyan-400 font-bold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3" /> Recommended LinkedIn Image Prompt:
                </span>
                <p className="text-zinc-400 italic">
                  "{linkedinData.image_prompt}"
                </p>
              </div>
            )}

            {/* Fake Social Interaction Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-defense-800">
              <span className="hover:text-blue-400 cursor-pointer flex items-center gap-1">
                <Heart className="w-4 h-4" /> 1,248 Reactions
              </span>
              <span className="hover:text-blue-400 cursor-pointer">
                142 Comments • 89 Reposts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TWITTER / X THREAD PREVIEW */}
      {activeTab === 'twitter' && twitterData && (
        <div className="max-w-xl mx-auto space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>Thread: <strong className="text-sky-400">{twitterData.thread_title || 'Intelligence Brief'}</strong></span>
            <span>Total: <strong className="text-zinc-200">{twitterData.total_tweets || twitterData.tweets?.length || 5} Tweets</strong></span>
          </div>

          <div className="space-y-3">
            {(twitterData.tweets || []).map((tweet, idx) => (
              <div
                key={idx}
                className="bg-defense-900/90 rounded-xl border border-defense-700/80 p-4 shadow-md space-y-3 relative group"
              >
                {/* Tweet Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-sky-400 border border-sky-500/40">
                      X
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-zinc-100">Sunday</span>
                        <span className="text-[10px] text-zinc-500 font-mono">@sunday • Tweet {tweet.tweet_number || idx + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      (tweet.character_count || tweet.text.length) > 280
                        ? 'bg-red-950 text-red-400 border border-red-500/40'
                        : 'bg-defense-950 text-zinc-400 border border-defense-800'
                    }`}>
                      {tweet.character_count || tweet.text.length}/280 chars
                    </span>

                    <button
                      onClick={() => handleCopy(tweet.text, `tweet-${idx}`)}
                      className="p-1 text-zinc-400 hover:text-sky-400"
                      title="Copy Tweet"
                    >
                      {copiedKey === `tweet-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tweet Text */}
                <p className="text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line pl-10">
                  {tweet.text}
                </p>

                {/* Tweet Media Recommendation */}
                {tweet.media_prompt && (
                  <div className="ml-10 p-2 rounded bg-defense-950/80 border border-defense-800 text-[11px] text-zinc-400 italic">
                    📷 Media prompt: {tweet.media_prompt}
                  </div>
                )}

                {/* Engagement Mock */}
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-defense-800/60 pl-10">
                  <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer"><MessageCircle className="w-3.5 h-3.5" /> 34</span>
                  <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer"><Repeat className="w-3.5 h-3.5" /> 112</span>
                  <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer"><Heart className="w-3.5 h-3.5" /> 489</span>
                  <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer"><Share2 className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
