'use client';

import { useState, useEffect, useCallback } from 'react';
import VideoGrid from '@/components/VideoGrid';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import type { VideoMeta } from '@/components/VideoGrid';
import Link from 'next/link';
import { VIDEO_CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [feed, setFeed] = useState('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchVideos = useCallback(async (searchQuery: string, cat: string, srt: string, fd: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (cat !== 'All') params.append('category', cat);
      if (srt !== 'newest') params.append('sort', srt);
      if (fd !== 'all') params.append('feed', fd);
      
      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error('Failed to load videos:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos(debouncedQuery, category, sort, feed);
  }, [debouncedQuery, category, sort, feed, fetchVideos]);

  const categories = ['All', ...VIDEO_CATEGORIES];

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white font-inter">
      <Navbar />
      <Sidebar />

      <main className="md:ml-60 pt-14 min-h-screen">
        {/* Chips Filters */}
        <div className="sticky top-14 z-30 bg-[#0f0f0f] py-3 px-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? 'All' : cat)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${(category === cat || (cat === 'All' && category === 'All'))
                  ? 'bg-white text-black' 
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <span className="material-symbols-outlined text-4xl text-neutral-500 animate-spin">sync</span>
              <p className="text-neutral-500 text-sm font-medium">Loading...</p>
            </div>
          ) : (
            <VideoGrid videos={videos} />
          )}
        </div>
      </main>
    </div>
  );
}


