'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';

function formatSocialUrl(input: string, platform: 'tiktok' | 'snapchat' | 'instagram' | 'facebook'): string {
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  const cleanInput = input.replace(/^@/, '');
  switch (platform) {
    case 'tiktok': return `https://www.tiktok.com/@${cleanInput}`;
    case 'snapchat': return `https://www.snapchat.com/add/${cleanInput}`;
    case 'instagram': return `https://www.instagram.com/${cleanInput}`;
    case 'facebook': return `https://www.facebook.com/${cleanInput}`;
    default: return `https://${input}`;
  }
}

export default function PublisherProfilePage() {
  const { username } = useParams() as { username: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetch(`/api/publishers/${username}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [username]);

  const handleVipRequest = async () => {
    setRequesting(true);
    const res = await fetch('/api/vip/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publisherId: data?.publisher?.id }),
    });
    if (res.ok) {
      setData((prev: any) => ({ ...prev, vipStatus: 'pending' }));
    }
    setRequesting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
       <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
    </div>
  );

  if (!data?.publisher) return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center text-white">
       Publisher not found
    </div>
  );

  const { publisher, videos, isVip, vipStatus, isSubscribed } = data;

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-14 md:ml-60 px-4 md:px-8 pb-12">
          <div className="max-w-7xl mx-auto mt-8">
            <div className="relative mb-12 rounded-[3rem] overflow-hidden bg-[#1e1e1e] p-8 md:p-12 border border-white/5">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-40 h-40 rounded-[3.5rem] bg-violet-600/10 border border-violet-500/20 p-1.5 relative shrink-0">
                  <div className="w-full h-full rounded-[3rem] overflow-hidden bg-[#272727]">
                    <img 
                      src={publisher.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${publisher.username}`}
                      alt={publisher.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">@{publisher.username}</h1>
              
              <div className="flex items-center justify-center md:justify-start gap-8 mb-6 text-neutral-500">
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg">group</span>
                   <span className="text-xs font-black uppercase tracking-widest">{publisher.subscriberCount} Subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-lg">movie</span>
                   <span className="text-xs font-black uppercase tracking-widest">{videos.length} Videos</span>
                </div>
              </div>

              {publisher.bio && (
                <p className="text-sm text-neutral-400 mb-6 max-w-2xl text-center md:text-left">{publisher.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                {publisher.tiktok && (
                  <a href={formatSocialUrl(publisher.tiktok, 'tiktok')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00f2ea]/20 hover:border-[#00f2ea] hover:text-white transition-all text-neutral-400 font-bold text-xs">
                    <img src="https://icongr.am/simple/tiktok.svg?color=ffffff" alt="TikTok" className="w-4 h-4 opacity-80" />
                    TikTok
                  </a>
                )}
                {publisher.snapchat && (
                  <a href={formatSocialUrl(publisher.snapchat, 'snapchat')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#fffc00]/20 hover:border-[#fffc00] hover:text-white transition-all text-neutral-400 font-bold text-xs">
                    <img src="https://icongr.am/simple/snapchat.svg?color=ffffff" alt="Snapchat" className="w-4 h-4 opacity-80" />
                    Snapchat
                  </a>
                )}
                {publisher.instagram && (
                  <a href={formatSocialUrl(publisher.instagram, 'instagram')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#E1306C]/20 hover:border-[#E1306C] hover:text-white transition-all text-neutral-400 font-bold text-xs">
                    <img src="https://icongr.am/simple/instagram.svg?color=ffffff" alt="Instagram" className="w-4 h-4 opacity-80" />
                    Instagram
                  </a>
                )}
                {publisher.facebook && (
                  <a href={formatSocialUrl(publisher.facebook, 'facebook')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#1877F2]/20 hover:border-[#1877F2] hover:text-white transition-all text-neutral-400 font-bold text-xs">
                    <img src="https://icongr.am/simple/facebook.svg?color=ffffff" alt="Facebook" className="w-4 h-4 opacity-80" />
                    Facebook
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                {vipStatus === 'accepted' ? (
                  <div className="metallic-gold text-black px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    VIP ACCREDITED
                  </div>
                ) : vipStatus === 'pending' ? (
                  <button disabled className="bg-white/5 border border-white/10 text-neutral-500 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3">
                    <span className="material-symbols-outlined text-lg animate-pulse">hourglass_top</span>
                    REQUEST PENDING
                  </button>
                ) : (
                  <button 
                    onClick={handleVipRequest}
                    disabled={requesting}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-violet-600/20"
                  >
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    {requesting ? 'SENDING...' : 'REQUEST VIP ACCESS'}
                  </button>
                )}

                <button className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Sections */}
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <span className="material-symbols-outlined text-violet-500 text-3xl">grid_view</span>
              Cinematic Library
            </h2>
            <div className="flex gap-2">
               <button className="bg-white/5 border border-violet-500/30 text-violet-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Public</button>
               <button className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isVip ? 'bg-white/5 border border-violet-500/30 text-violet-400' : 'bg-transparent border border-white/5 text-neutral-700 cursor-not-allowed'}`}>VIP Exclusive</button>
            </div>
          </div>

          <VideoGrid videos={videos.map((v: any) => ({
            ...v,
            thumbnailUrl: v.thumbnail_url || 'https://placehold.co/1920x1080/1a1a1a/ffffff?text=Video+Thumbnail',
            publisherId: v.publisher_id
          }))} />
          
          {videos.length === 0 && (
            <div className="py-32 text-center glass-card rounded-[3rem] border-white/5">
              <span className="material-symbols-outlined text-neutral-800 text-6xl mb-6">movie_off</span>
              <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">No cinematic content available</p>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
</div>
  );
}
