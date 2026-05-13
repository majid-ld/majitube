'use client';

import { useState, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
  nextVideoId?: string;
  prevVideoId?: string;
}

export default function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [iframeSrc, setIframeSrc] = useState(embedUrl);

  /* ── History log ── */
  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    if (id) fetch(`/api/videos/${id}/history`, { method: 'POST' });
  }, []);

  /* ── Retry logic ── */
  const handleRetry = useCallback(() => {
    setLoadState('loading');
    setIframeSrc(`${embedUrl}&_r=${Date.now()}`);
  }, [embedUrl]);

  return (
    <div className="w-full">
      {/* ─── Player area ─── */}
      <div 
        className="relative w-full overflow-hidden bg-black rounded-2xl shadow-2xl shadow-black/70"
        style={{ paddingBottom: '56.25%' }} /* 16:9 Aspect Ratio */
      >
        {/* Loading skeleton */}
        {loadState === 'loading' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0a]">
            <div className="relative flex items-center justify-center mb-5">
              <div className="absolute w-20 h-20 rounded-full border-2 border-violet-500/20 animate-ping" />
              <div className="absolute w-14 h-14 rounded-full border-2 border-violet-400/30 animate-ping [animation-delay:0.25s]" />
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              </div>
            </div>
          </div>
        )}

        {/* Drive processing / error */}
        {loadState === 'error' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0a] px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <span className="material-symbols-outlined text-amber-400 text-3xl">hourglass_top</span>
            </div>
            <h3 className="text-white font-bold text-base mb-2">Video is processing</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-6">
              Google Drive is transcoding this file. Please retry shortly.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase tracking-wider transition-all"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Drive iframe */}
        <div className="absolute inset-0 z-0">
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={title}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onLoad={() => setTimeout(() => setLoadState('loaded'), 600)}
            onError={() => setLoadState('error')}
          />
        </div>
      </div>
    </div>
  );
}
