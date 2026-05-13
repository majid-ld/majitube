'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';

export default function WatchLaterPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/videos/watch-later')
      .then(res => res.json())
      .then(data => {
        if (data.videos) {
          setVideos(data.videos);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-60 pt-14">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <span className="material-symbols-outlined text-3xl">schedule</span>
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter">Watch Later</h1>
                <p className="text-neutral-400 text-sm">{videos.length} videos</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-4xl text-neutral-500">sync</span>
              </div>
            ) : videos.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-[3rem] border-white/5">
                <span className="material-symbols-outlined text-neutral-800 text-6xl mb-6">history_toggle_off</span>
                <p className="text-neutral-500 text-sm font-black uppercase tracking-widest">Your Watch Later list is empty.</p>
                <p className="text-neutral-600 text-xs mt-2 font-medium">Add videos here to watch them later.</p>
              </div>
            ) : (
              <VideoGrid videos={videos} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
