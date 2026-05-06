'use client';

import { useState, useEffect } from 'react';

export default function LikeButton({ videoId }: { videoId: string }) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/videos/${videoId}/like`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.count);
        setHasLiked(data.hasLiked);
        setLoading(false);
      });
  }, [videoId]);

  const toggleLike = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, { method: 'POST' });
      if (!res.ok) {
        if (res.status === 401) alert('Please login to like this video');
        return;
      }
      const data = await res.json();
      setHasLiked(data.isLiked);
      setLikes(prev => data.isLiked ? prev + 1 : prev - 1);
    } catch (e) {
      console.error(e);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-wider
        ${hasLiked 
          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
          : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/30 hover:text-white'
        }`}
    >
      <span 
        className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${hasLiked ? 'scale-110' : 'group-hover:scale-110'}`}
        style={{ fontVariationSettings: hasLiked ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
      <span>{formatCount(likes)}</span>
    </button>
  );
}

