'use client';

import { useState, useEffect } from 'react';

export default function SubscribeButton({ publisherId }: { publisherId: string }) {
  const [subscribers, setSubscribers] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/subscriptions?publisher_id=${publisherId}`)
      .then(res => res.json())
      .then(data => {
        setSubscribers(data.subscribers || 0);
        setIsSubscribed(data.isSubscribed || false);
        setLoading(false);
      });
  }, [publisherId]);

  const toggleSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisher_id: publisherId })
      });
      if (!res.ok) {
        if (res.status === 401) alert('Please login to subscribe');
        return;
      }
      const data = await res.json();
      setIsSubscribed(data.isSubscribed);
      setSubscribers(prev => data.isSubscribed ? prev + 1 : prev - 1);
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
      onClick={toggleSubscription}
      disabled={loading}
      className={`group relative flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-xs font-black uppercase tracking-widest overflow-hidden
        ${isSubscribed 
          ? 'bg-white/5 text-neutral-400 border border-white/10 hover:border-violet-500/50 hover:text-white' 
          : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 active:scale-95'
        }`}
    >
      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isSubscribed ? "'FILL' 1" : "'FILL' 0" }}>
        {isSubscribed ? 'notifications_active' : 'notifications'}
      </span>
      <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
      <span className={`px-2 py-0.5 rounded-md text-[10px] ${isSubscribed ? 'bg-white/5 text-neutral-500' : 'bg-black/20 text-white/80'}`}>
        {formatCount(subscribers)}
      </span>
      
      {/* Glow effect on hover for non-subscribed */}
      {!isSubscribed && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
    </button>
  );
}

