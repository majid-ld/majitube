'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ReelCard from '@/components/ReelCard';

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/videos?reels=true')
      .then(res => res.json())
      .then(data => {
        setReels(data.videos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollPos = scrollContainerRef.current.scrollTop;
    const windowHeight = scrollContainerRef.current.clientHeight;
    const index = Math.round(scrollPos / windowHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-violet-500">sync</span>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Navbar />
        <Sidebar />
        <main className="md:ml-60 pt-14 h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-neutral-800 mb-4">movie_off</span>
            <h3 className="text-xl font-bold">No Reels Available</h3>
            <p className="text-neutral-500 text-sm mt-1">Check back later for cinematic shorts.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-60 relative h-full">
          {/* Mobile Back Button */}
          <button 
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white md:hidden"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          {/* Reels Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide flex flex-col items-center"
            style={{ scrollBehavior: 'smooth' }}
          >
            {reels.map((reel, idx) => (
              <div key={reel.id} className="h-full w-full max-w-[450px] snap-start shrink-0 relative">
                 <ReelCard reel={reel} isActive={idx === activeIndex} />
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-40">
            <button 
              onClick={() => {
                if (activeIndex > 0) {
                  scrollContainerRef.current?.scrollTo({ top: (activeIndex - 1) * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
                }
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all"
            >
              <span className="material-symbols-outlined">keyboard_arrow_up</span>
            </button>
            <button 
              onClick={() => {
                if (activeIndex < reels.length - 1) {
                  scrollContainerRef.current?.scrollTo({ top: (activeIndex + 1) * scrollContainerRef.current.clientHeight, behavior: 'smooth' });
                }
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all"
            >
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
