'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import CommentsSection from './CommentsSection';

interface ReelCardProps {
  reel: any;
  isActive: boolean;
}

export default function ReelCard({ reel, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black snap-start flex items-center justify-center overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.streamUrl}
        className="h-full w-full object-contain"
        loop
        playsInline
        onClick={(e) => {
          const v = e.currentTarget;
          v.paused ? v.play() : v.pause();
        }}
      />

      {/* Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
        <LikeButton videoId={reel.id} isReel={true} />

        <div className="flex flex-col items-center">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
          >
            <span className="material-symbols-outlined text-white">chat_bubble</span>
          </button>
          <span className="text-[11px] font-black mt-0.5 text-white">Discuss</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
            <ShareButton isReel={true} />
          </div>
          <span className="text-[11px] font-black mt-0.5 text-white">Spread</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/${reel.publisher_username}`} className="shrink-0">
            <div className="w-11 h-11 rounded-full border-2 border-white/20 overflow-hidden bg-[#272727]">
              <img 
                src={reel.publisher_avatar || "https://lh3.googleusercontent.com/a/default-user"} 
                alt={reel.publisher_username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <Link href={`/${reel.publisher_username}`} className="font-black text-white text-sm hover:underline tracking-tight">
              @{reel.publisher_username || 'DashTube Creator'}
            </Link>
            <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Cinematic Reel</span>
          </div>
        </div>

        <h3 className="text-white text-base font-bold mb-2 line-clamp-2 leading-tight">
          {reel.title}
        </h3>
        <p className="text-neutral-300 text-xs line-clamp-2 leading-relaxed opacity-80 font-medium max-w-[80%]">
          {reel.description}
        </p>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute inset-0 bg-[#0f0f0f] z-30 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold">Comments</h3>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <CommentsSection videoId={reel.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
