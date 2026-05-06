'use client';

import React, { useState } from 'react';

interface VipLockScreenProps {
  publisherName: string;
  publisherId: string;
  initialStatus: 'none' | 'pending' | 'accepted' | 'rejected';
  thumbnailUrl?: string;
}

export default function VipLockScreen({ publisherName, publisherId, initialStatus, thumbnailUrl }: VipLockScreenProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestVip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vip/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId }),
      });
      if (res.ok) {
        setStatus('pending');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send request');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center bg-[#1e1e1e] rounded-xl">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-6">
        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-[#f1c40f]">lock</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">VIP Exclusive Content</h2>
        <p className="text-[#aaaaaa] text-sm mb-8 leading-relaxed">
          This video is restricted to VIP subscribers of <span className="text-white font-bold">@{publisherName}</span>. 
          Request access to join their private community.
        </p>

        <div className="w-full space-y-4">
          {status === 'none' && (
            <button
              onClick={handleRequestVip}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined text-xl">sync</span>
              ) : (
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              )}
              {loading ? 'Sending Request...' : 'Request VIP Access'}
            </button>
          )}

          {status === 'pending' && (
            <div className="w-full bg-black/20 text-[#f1c40f] font-bold py-3 rounded-full flex items-center justify-center gap-3 border border-[#f1c40f]/20">
              <span className="material-symbols-outlined animate-spin text-xl">hourglass_empty</span>
              Pending Approval
            </div>
          )}

          {status === 'rejected' && (
            <div className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-full flex items-center justify-center gap-3 border border-red-500/20">
              <span className="material-symbols-outlined text-xl">block</span>
              Request Declined
            </div>
          )}

          {error && <p className="text-red-500 text-xs font-bold mt-2">{error}</p>}
        </div>

        <div className="mt-8">
           <span className="text-[10px] font-bold tracking-widest text-[#aaaaaa] uppercase">DashTube VIP Protocol</span>
        </div>
      </div>
    </div>
  );
}

