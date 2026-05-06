'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function PlaylistDetailsPage() {
  const { id } = useParams() as { id: string };
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    const res = await fetch(`/api/playlists/${id}`);
    if (res.ok) {
      const data = await res.json();
      setVideos(data.videos || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [id]);

  const removeVideo = async (videoId: string) => {
    if (!confirm('Remove this video from the collection?')) return;
    const res = await fetch(`/api/playlists/${id}?video_id=${videoId}`, { method: 'DELETE' });
    if (res.ok) fetchVideos();
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest font-inter">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-14 md:ml-60 px-6 pb-12 max-w-[1700px] mx-auto">
        <Link href="/playlists" className="inline-flex items-center gap-2 text-[10px] font-black text-neutral-500 hover:text-white transition-all uppercase tracking-widest mb-10 group">
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Collections
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-600/10">
            <span className="material-symbols-outlined text-violet-500 text-3xl">subscriptions</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Collection Stream</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personalized Cinematic Sequence</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-[3rem] border-white/5">
            <span className="material-symbols-outlined text-neutral-800 text-6xl mb-6">layers_clear</span>
            <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">This collection is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos.map(video => (
              <div key={video.id} className="group relative">
                <div className="block glass-card rounded-[2rem] overflow-hidden border-white/5 hover:border-violet-500/30 transition-all duration-500 h-full shadow-2xl shadow-black/40">
                  <div className="aspect-video relative bg-neutral-900 overflow-hidden">
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" />
                    <Link href={`/video/${video.id}`} className="absolute inset-0 z-10" />
                    
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                       <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                       </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-sm font-bold text-neutral-300 line-clamp-2 leading-tight group-hover:text-white transition-colors">{video.title}</h3>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                       <span className="material-symbols-outlined text-[12px]">schedule</span>
                       <span>Added {new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeVideo(video.id)}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                  title="Remove from playlist"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

