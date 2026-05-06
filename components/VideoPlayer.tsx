'use client';

import { useRef, useState, useEffect } from 'react';

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
}

export default function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    
    // Log history
    const id = window.location.pathname.split('/').pop();
    if (id) fetch(`/api/videos/${id}/history`, { method: 'POST' });

    return () => document.removeEventListener('fullscreenchange', handler);
  }, [embedUrl, title]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden bg-neutral-950 shadow-2xl shadow-black/80 group border border-white/5"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Cinematic Vignette Overlay (Non-interactive) */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      {/* Google Drive Embed iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 relative z-0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
      />

      {/* Control Bar Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="material-symbols-outlined text-white/40 text-sm animate-pulse">sensors</span>
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Stream Infrastructure</span>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all active:scale-90"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="material-symbols-outlined text-2xl">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

