'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [roleRequest, setRoleRequest] = useState<any>(null);
  const [requesting, setRequesting] = useState(false);

  // form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetch('/api/users/profile')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setHistory(data.history || []);
          setUsername(data.user.username);
          setEmail(data.user.email);
          setAvatarUrl(data.user.avatar_url || '');
        }
        setLoading(false);
      });
    
    fetch('/api/users/request-publisher')
      .then(res => res.json())
      .then(data => setRoleRequest(data.request));
  }, []);

  const handleRequestPublisher = async () => {
    setRequesting(true);
    const res = await fetch('/api/users/request-publisher', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setRoleRequest({ status: 'pending' });
      setMessage('Publisher request submitted!');
      setTimeout(() => setMessage(''), 3000);
    }
    setRequesting(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const body: any = { username, email, avatar_url: avatarUrl };
    if (newPassword) body.new_password = newPassword;

    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setMessage('Profile updated successfully!');
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
       <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-inter">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Info (Bento style) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-[60px] -mr-16 -mt-16" />
            
            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="w-28 h-28 rounded-[2rem] bg-violet-600/10 border border-violet-500/20 p-1 mb-6 relative group">
                <div className="w-full h-full rounded-[1.75rem] overflow-hidden">
                  <img 
                    src={avatarUrl || "https://lh3.googleusercontent.com/a/default-user"} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xl border border-white/10">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">{username}</h2>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{user?.role || 'Explorer'}</p>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="material-symbols-outlined text-violet-400">mail</span>
                  <div className="flex-1 overflow-hidden">
                     <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Email Identity</p>
                     <p className="text-sm font-bold text-neutral-300 truncate">{email}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="material-symbols-outlined text-violet-400">event</span>
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Authorized Since</p>
                     <p className="text-sm font-bold text-neutral-300">May 2024</p>
                  </div>
               </div>
            </div>

             {user?.role === 'viewer' && (
               <div className="mt-8 p-6 rounded-3xl bg-violet-600/10 border border-violet-500/20 text-center relative overflow-hidden group">
                  <div className="relative z-10">
                    <span className="material-symbols-outlined text-violet-400 text-3xl mb-3">video_call</span>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Creator Program</h4>
                    <p className="text-[10px] font-medium text-neutral-500 mb-4 px-2">Apply to upload cinematic content and manage your own audience.</p>
                    
                    {roleRequest?.status === 'pending' ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl py-3 text-[10px] font-black text-violet-400 uppercase tracking-widest">
                        REQUEST PENDING
                      </div>
                    ) : roleRequest?.status === 'rejected' ? (
                       <button 
                        onClick={handleRequestPublisher}
                        disabled={requesting}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20"
                      >
                        {requesting ? 'RETRYING...' : 'RE-APPLY NOW'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleRequestPublisher}
                        disabled={requesting}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20"
                      >
                        {requesting ? 'PROCESSING...' : 'BECOME PUBLISHER'}
                      </button>
                    )}
                  </div>
               </div>
             )}
          </div>

          <div className="glass-card rounded-[2rem] border-white/5 p-6 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
             <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-neutral-600 group-hover:text-violet-400 transition-colors">security</span>
                <span className="text-xs font-black text-white uppercase tracking-widest">Privacy Controls</span>
             </div>
             <span className="material-symbols-outlined text-neutral-800 group-hover:text-white transition-colors">chevron_right</span>
          </div>
        </div>

        {/* Right Column: Main Area (History & Edit) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Edit Profile */}
          <div className="glass-card rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-500">settings</span>
                Configuration
              </h3>
              {message && (
                <div className="flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {message}
                </div>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] ml-1">Update Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-violet-500/50 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] ml-1">Avatar Link</label>
                  <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-violet-500/50 transition-all outline-none" placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] ml-1">Security Update (Optional)</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold focus:border-violet-500/50 transition-all outline-none" placeholder="Leave blank to keep current password" />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-violet-600/20 transition-all active:scale-[0.98] disabled:opacity-50">
                {saving ? 'SYNCING DATA...' : 'COMMIT CHANGES'}
              </button>
            </form>
          </div>

          {/* Section: Watch History */}
          <div className="glass-card rounded-[2.5rem] border-white/5 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-500">history</span>
                Chronology
              </h3>
              <button className="text-[10px] font-black text-neutral-600 uppercase tracking-widest hover:text-white transition-colors">Clear History</button>
            </div>
            
            {history.length === 0 ? (
              <div className="py-20 text-center">
                 <span className="material-symbols-outlined text-neutral-800 text-6xl mb-4">history_toggle_off</span>
                 <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">The timeline is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map(video => (
                  <Link key={video.id} href={`/video/${video.id}`} className="group flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-violet-500/30 transition-all">
                    <div className="w-24 aspect-video bg-neutral-900 rounded-xl overflow-hidden shrink-0">
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-bold text-neutral-300 line-clamp-1 group-hover:text-white transition-colors tracking-tight">{video.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                         <span className="material-symbols-outlined text-[12px] text-neutral-600">schedule</span>
                         <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                           {new Date(video.watched_at).toLocaleDateString()}
                         </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

