'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import VipRequestsList from '@/components/VipRequestsList';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats(data.stats);
          setTopVideos(data.topVideos || []);
        }
        setLoading(false);
      });
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-violet-500">sync</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-60 pt-14 px-8 min-h-screen">
        <div className="max-w-6xl mx-auto py-10">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">Channel Dashboard</h1>
            <Link href="/upload" className="bg-[#3ea6ff] hover:bg-[#65b8ff] text-black font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">upload</span>
              Upload
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Stats */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Total Views</h3>
               <p className="text-4xl font-bold">{stats?.total_views || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Total Videos</h3>
               <p className="text-4xl font-bold">{stats?.total_videos || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Storage Used</h3>
               <p className="text-4xl font-bold">{formatSize(stats?.total_size || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
             {/* VIP Requests */}
             <div className="bg-[#1e1e1e] rounded-xl border border-[#303030] overflow-hidden">
                <div className="p-4 border-b border-[#303030] flex items-center justify-between">
                   <h3 className="font-bold">VIP Requests</h3>
                   <span className="bg-[#f1c40f] text-black text-[10px] font-bold px-2 py-0.5 rounded">PENDING</span>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto">
                   <VipRequestsList />
                </div>
             </div>

             {/* Top Videos */}
             <div className="bg-[#1e1e1e] rounded-xl border border-[#303030] overflow-hidden">
                <div className="p-4 border-b border-[#303030]">
                   <h3 className="font-bold">Top Performing Videos</h3>
                </div>
                <div className="p-4">
                   <div className="space-y-4">
                      {topVideos.map((video, idx) => (
                        <Link key={video.id} href={`/video/${video.id}`} className="flex items-center gap-4 group">
                           <div className="w-8 text-[#aaaaaa] font-bold">#{idx + 1}</div>
                           <div className="w-24 aspect-video rounded overflow-hidden flex-shrink-0">
                              <img src={video.thumbnailUrl || video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold truncate group-hover:text-[#3ea6ff] transition-colors">{video.title}</h4>
                              <p className="text-xs text-[#aaaaaa]">{video.views} views</p>
                           </div>
                        </Link>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

