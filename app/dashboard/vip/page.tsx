'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function VipManagementPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [reqRes, subRes] = await Promise.all([
      fetch('/api/vip/requests'),
      fetch('/api/vip/subscribers')
    ]);
    
    if (reqRes.ok) {
      const data = await reqRes.json();
      setRequests(data.requests || []);
    }
    
    if (subRes.ok) {
      const data = await subRes.json();
      setSubscribers(data.subscribers || []);
    }
    setLoading(false);
  };

  const handleStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`/api/vip/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleUpdateExpiry = async (requestId: string) => {
    const res = await fetch(`/api/vip/subscribers/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_at: expiryDate }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchData();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-inter">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-14 md:ml-60 px-6 pb-12 max-w-[1700px] mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-600/10">
              <span className="material-symbols-outlined text-violet-500 text-3xl">verified_user</span>
            </div>
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">VIP Registry</h1>
               <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage Exclusive Audience Access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Requests Table */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-500">pending_actions</span>
                Pending Requests
              </h3>
              <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                {loading ? (
                  <div className="py-20 flex justify-center"><span className="material-symbols-outlined animate-spin text-violet-600">sync</span></div>
                ) : requests.length === 0 ? (
                  <div className="py-20 text-center"><p className="text-neutral-500 text-xs font-black uppercase tracking-widest">No pending requests</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/5">
                        {requests.map((req) => (
                          <tr key={req.id} className="group hover:bg-white/[0.02]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={req.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                <span className="text-sm font-bold text-white uppercase tracking-tighter">{req.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleStatus(req.id, 'accepted')} className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">APPROVE</button>
                                <button onClick={() => handleStatus(req.id, 'rejected')} className="bg-white/5 text-neutral-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">REJECT</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Active VIP Members Table */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-violet-500">stars</span>
                Active VIP Members
              </h3>
              <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                {loading ? (
                  <div className="py-20 flex justify-center"><span className="material-symbols-outlined animate-spin text-violet-600">sync</span></div>
                ) : subscribers.length === 0 ? (
                  <div className="py-20 text-center"><p className="text-neutral-500 text-xs font-black uppercase tracking-widest">No active VIP members</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                          <th className="px-6 py-4">Subscriber</th>
                          <th className="px-6 py-4">Expiry Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="group hover:bg-white/[0.02]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={sub.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                <div>
                                  <p className="text-sm font-bold text-white uppercase tracking-tighter">{sub.username}</p>
                                  <p className="text-[10px] text-neutral-500 font-bold">{sub.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {editingId === sub.id ? (
                                <input 
                                  type="date" 
                                  value={expiryDate} 
                                  onChange={e => setExpiryDate(e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none"
                                />
                              ) : (
                                <span className="text-xs font-bold text-neutral-400">
                                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Lifetime'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {editingId === sub.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleUpdateExpiry(sub.id)} className="text-violet-400 text-[10px] font-black uppercase tracking-widest">SAVE</button>
                                  <button onClick={() => setEditingId(null)} className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">CANCEL</button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setEditingId(sub.id);
                                    setExpiryDate(sub.expires_at ? sub.expires_at.split('T')[0] : '');
                                  }} 
                                  className="text-neutral-600 hover:text-white transition-colors"
                                >
                                  <span className="material-symbols-outlined text-lg">edit_calendar</span>
                                </button>
                              )}
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
        </main>
      </div>
    </div>
  );
}
