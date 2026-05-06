'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data.session));

    fetch('/api/videos?feed=subscriptions')
      .then(res => res.json())
      .then(data => {
        if (data.videos) setVideos(data.videos);
        setLoading(false);
      });
  }, []);

  if (!session && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-inter">
        <Navbar />
        <Sidebar />
        <main className="md:ml-64 pt-24 px-6 flex flex-col items-center justify-center min-h-[80vh]">
           <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/10">
              <span className="material-symbols-outlined text-4xl text-violet-400">lock</span>
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Protocol Restricted</h2>
           <p className="text-neutral-500 mb-8 font-medium">Please authenticate to access your personalized feed.</p>
           <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-600/20 transition-all active:scale-95">Enter Protocol</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-inter">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-64 pt-24 px-6 pb-12 max-w-[1600px] mx-auto min-h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center shadow-xl shadow-rose-600/10">
            <span className="material-symbols-outlined text-rose-500 text-3xl">subscriptions</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Subscribed Signals</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personalized Frequency Feed</p>
          </div>
        </div>

        <section>
          {loading ? (
             <div className="py-32 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
             </div>
          ) : videos.length === 0 ? (
            <div className="py-32 text-center glass-card rounded-[3rem] border-white/5">
                <span className="material-symbols-outlined text-neutral-800 text-6xl mb-6">rss_feed</span>
                <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">No subscription activity detected</p>
                <Link href="/" className="inline-block mt-8 text-violet-400 font-bold hover:text-violet-300 underline underline-offset-4 decoration-2">Find Creators</Link>
            </div>
          ) : (
            <VideoGrid videos={videos} />
          )}
        </section>
      </main>
    </div>
  );
}
