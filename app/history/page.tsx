'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data.session));

    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        if (data.history) setHistory(data.history);
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
              <span className="material-symbols-outlined text-4xl text-violet-400">history</span>
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Timeline Restricted</h2>
           <p className="text-neutral-500 mb-8 font-medium">Authentication is required to synchronize your cinematic history.</p>
           <Link href="/login" className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-600/20 transition-all active:scale-95">Sync Identity</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-inter">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-64 pt-24 px-6 pb-12 max-w-4xl mx-auto min-h-screen">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-xl shadow-indigo-600/10">
              <span className="material-symbols-outlined text-indigo-500 text-3xl">history</span>
            </div>
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Chronology</h1>
               <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Recorded Visual Signatures</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-neutral-600 uppercase tracking-widest hover:text-white transition-colors border border-white/5 px-4 py-2 rounded-xl">Purge Timeline</button>
        </div>

        <section className="space-y-6">
          {loading ? (
             <div className="py-32 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
             </div>
          ) : history.length === 0 ? (
            <div className="py-32 text-center glass-card rounded-[3rem] border-white/5 bg-white/[0.01]">
                <span className="material-symbols-outlined text-neutral-800 text-6xl mb-6">history_toggle_off</span>
                <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">The timeline is devoid of data</p>
                <Link href="/" className="inline-block mt-8 text-violet-400 font-bold hover:text-violet-300 underline underline-offset-4 decoration-2">Begin Recording</Link>
            </div>
          ) : (
            <div className="space-y-4">
               {history.map((video, idx) => (
                 <div key={`${video.id}-${idx}`} className="group relative flex gap-6 p-4 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-violet-500/30 transition-all duration-500">
                    <Link href={`/video/${video.id}`} className="shrink-0 w-64 aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-white/5">
                       <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                    </Link>
                    <div className="flex-1 flex flex-col py-2">
                       <Link href={`/video/${video.id}`}>
                          <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight group-hover:text-violet-400 transition-colors line-clamp-1 mb-2">{video.title}</h3>
                       </Link>
                       <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-auto">{video.publisher_username || 'DashStream Creator'}</p>
                       <div className="flex items-center gap-3 mt-4">
                          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                             Watched {new Date(video.watched_at).toLocaleDateString()}
                          </span>
                       </div>
                    </div>
                    <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-red-500 transition-all">
                       <span className="material-symbols-outlined">close</span>
                    </button>
                 </div>
               ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
