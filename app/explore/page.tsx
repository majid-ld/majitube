'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import VideoGrid from '@/components/VideoGrid';

const EXPLORE_CATEGORIES = [
  { name: 'Cyberpunk', icon: 'settings_input_component', color: 'bg-violet-600', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800' },
  { name: 'Exclusive', icon: 'stars', color: 'bg-amber-500', img: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800' },
  { name: 'Music', icon: 'music_note', color: 'bg-rose-500', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' },
  { name: 'Tech', icon: 'memory', color: 'bg-blue-500', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800' },
  { name: 'New', icon: 'fiber_new', color: 'bg-emerald-500', img: 'https://images.unsplash.com/photo-1492619334798-242330737a6b?auto=format&fit=crop&q=80&w=800' },
  { name: 'Trending', icon: 'trending_up', color: 'bg-indigo-600', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800' },
];

export default function ExplorePage() {
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
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-600/10">
            <span className="material-symbols-outlined text-violet-500 text-3xl">explore</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Cinematic Hub</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Discover New Immersion Layers</p>
          </div>
        </div>

        {/* Categories Grid */}
        <section className="mb-20">
           <h2 className="text-sm font-black text-neutral-600 uppercase tracking-[0.3em] mb-8">Classification Nodes</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {EXPLORE_CATEGORIES.map(cat => (
                <div key={cat.name} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl shadow-black/40 border border-white/5 hover:border-violet-500/30 transition-all duration-500">
                   <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                   <div className="absolute bottom-6 left-0 w-full px-6 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl ${cat.color}/20 border border-${cat.color.split('-')[1]}-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                         <span className={`material-symbols-outlined text-${cat.color.split('-')[1]}-400 text-2xl`}>{cat.icon}</span>
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{cat.name}</span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Popular Stream */}
        <section>
          <h2 className="text-sm font-black text-neutral-600 uppercase tracking-[0.3em] mb-8">High Energy Signal (Popular)</h2>
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
