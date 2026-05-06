'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';

export default function TrendingPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/videos?sort=popular')
      .then(res => res.json())
      .then(data => {
        if (data.videos) setVideos(data.videos);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest font-inter">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-64 pt-24 px-6 pb-12 max-w-[1600px] mx-auto min-h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xl shadow-amber-600/10">
            <span className="material-symbols-outlined text-amber-500 text-3xl">bolt</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">High Energy Signals</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Trending Across the Network</p>
          </div>
        </div>

        <section>
          {loading ? (
             <div className="py-32 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
             </div>
          ) : (
            <VideoGrid videos={videos} />
          )}
        </section>
      </main>
    </div>
  );
}
