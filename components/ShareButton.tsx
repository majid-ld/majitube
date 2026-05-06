'use client';

import { useState } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      id="share-video-btn"
      onClick={handleShare}
      className={`group flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-wider
        ${copied 
          ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
          : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/30 hover:text-white'
        }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {copied ? 'check_circle' : 'share'}
      </span>
      <span>{copied ? 'Copied' : 'Share'}</span>
    </button>
  );
}

