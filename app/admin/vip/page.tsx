'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AdminVipPage() {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // form state for granting access
  const [userEmail, setUserEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [granting, setGranting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    setLoading(true);
    const res = await fetch('/api/users?role=publisher');
    if (res.ok) {
      const data = await res.json();
      setPublishers(data.users || []);
    }
    setLoading(false);
  };

  const fetchSubscribers = async (publisher: any) => {
    setLoading(true);
    const res = await fetch(`/api/admin/vip?publisherId=${publisher.id}`);
    if (res.ok) {
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setSelectedPublisher(publisher);
    }
    setLoading(false);
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPublisher) return;
    
    setGranting(true);
    setMessage('');
    
    const res = await fetch('/api/admin/vip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_email: userEmail, 
        publisher_email: selectedPublisher.email, 
        expires_at: expiresAt 
      })
    });

    if (res.ok) {
      setMessage('VIP access granted successfully!');
      setUserEmail('');
      setExpiresAt('');
      fetchSubscribers(selectedPublisher);
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error}`);
    }
    setGranting(false);
  };

  const handleBack = () => {
    setSelectedPublisher(null);
    setSubscribers([]);
    setMessage('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest font-inter">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-14 md:ml-60 px-6 pb-12 max-w-[1700px] mx-auto">
          
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-xl shadow-amber-500/10">
                <span className="material-symbols-outlined text-amber-500 text-3xl">stars</span>
              </div>
              <div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                   {selectedPublisher ? 'Subscriber Management' : 'Global VIP Control'}
                 </h1>
                 <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                   {selectedPublisher ? `Managing VIPs for ${selectedPublisher.username}` : 'Select a Publisher to Manage VIPs'}
                 </p>
              </div>
            </div>
            {selectedPublisher && (
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to Publishers
              </button>
            )}
          </div>

          {!selectedPublisher ? (
            /* Publisher List View */
            <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
              {loading ? (
                <div className="py-32 flex justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-amber-500">sync</span></div>
              ) : publishers.length === 0 ? (
                <div className="py-32 text-center"><p className="text-neutral-500 text-xs font-black uppercase tracking-widest">No publishers found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Publisher Identity</th>
                        <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Encryption Point</th>
                        <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {publishers.map((pub) => (
                        <tr key={pub.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <img src={pub.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-12 h-12 rounded-xl object-cover" alt="" />
                              <div>
                                <p className="text-sm font-black text-white uppercase tracking-tighter">{pub.username}</p>
                                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Active Creator</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">{pub.email}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => fetchSubscribers(pub)}
                              className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Manage VIPs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Subscriber Drill-down View */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Grant Access Form */}
              <div className="xl:col-span-4 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">add_moderator</span>
                  Grant Privilege
                </h3>
                <div className="glass-card rounded-[2.5rem] border-white/5 p-8">
                  <form onSubmit={handleGrantAccess} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Target Subscriber Email</label>
                      <input 
                        type="email" 
                        value={userEmail} 
                        onChange={e => setUserEmail(e.target.value)} 
                        required 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:border-amber-500/50 transition-all"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Expiration (Optional)</label>
                      <input 
                        type="date" 
                        value={expiresAt} 
                        onChange={e => setExpiresAt(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-bold outline-none focus:border-amber-500/50 transition-all"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={granting}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {granting ? 'PROCESSING...' : 'ACTIVATE VIP STATUS'}
                    </button>
                    {message && (
                      <p className={`text-center text-[10px] font-black uppercase tracking-widest ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                        {message}
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Subscriber Table */}
              <div className="xl:col-span-8 space-y-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500">verified</span>
                  Active VIP Members
                </h3>
                <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                  {loading ? (
                    <div className="py-20 flex justify-center"><span className="material-symbols-outlined animate-spin text-4xl text-amber-500">sync</span></div>
                  ) : subscribers.length === 0 ? (
                    <div className="py-20 text-center"><p className="text-neutral-500 text-xs font-black uppercase tracking-widest">No VIP members for this publisher</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/5">
                            <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Subscriber</th>
                            <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Expiry</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {subscribers.map((sub) => (
                            <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <img src={sub.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                  <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tighter">{sub.username || sub.subscriber_name}</p>
                                    <p className="text-[10px] font-bold text-neutral-600">{sub.email || sub.subscriber_email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Access</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-xs font-bold text-amber-500/80">
                                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'LIFETIME'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
