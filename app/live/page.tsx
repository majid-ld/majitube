'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function LivePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest font-inter">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-64 pt-24 px-6 pb-12 max-w-[1600px] mx-auto min-h-screen">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center shadow-xl shadow-red-600/10">
            <span className="material-symbols-outlined text-red-500 text-3xl">sensors</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Live Protocol</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Real-Time Immersion Sync</p>
          </div>
        </div>

        {/* Feature Hero for Live */}
        <div className="relative h-[600px] rounded-[3rem] overflow-hidden mb-16 border border-white/5 shadow-2xl shadow-black/60 group">
           <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000" alt="Live Stream" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
           
           <div className="absolute top-10 left-10 flex gap-4">
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-red-600/30">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 LIVE NOW
              </div>
              <div className="bg-black/40 backdrop-blur-md text-white border border-white/10 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                 12.4K VIEWERS
              </div>
           </div>

           <div className="absolute bottom-12 left-12 max-w-2xl">
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight mb-4">Cyber-Arena Finals:<br />Midnight Circuit</h2>
              <p className="text-neutral-400 font-bold mb-8 text-lg">Watch the top ranked pilots compete in the ultimate high-speed neural race. Real-time data sync active.</p>
              <button className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95">Enter Protocol</button>
           </div>
        </div>

        {/* Upcoming Grid */}
        <section>
          <h2 className="text-sm font-black text-neutral-600 uppercase tracking-[0.3em] mb-8">Scheduled Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-[2.5rem] border-white/5 p-8 flex flex-col group hover:border-violet-500/30 transition-all duration-500">
                   <div className="aspect-video rounded-3xl bg-neutral-900 mb-6 overflow-hidden relative border border-white/5">
                      <img src={`https://images.unsplash.com/photo-${1550745165 + i}-9bc0b252726f?auto=format&fit=crop&q=80&w=800`} alt="" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-1000" />
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">Starts in 4h</div>
                   </div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 group-hover:text-violet-400 transition-colors">Neural Sync Session {i}</h3>
                   <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-6">Hosted by CyberNet</p>
                   <button className="mt-auto w-full py-3 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all">Set Reminder</button>
                </div>
             ))}
          </div>
        </section>
      </main>
    </div>
  );
}
