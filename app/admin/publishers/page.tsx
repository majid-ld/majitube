'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AdminPublishersPage() {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pubRes, reqRes] = await Promise.all([
      fetch('/api/users?role=publisher'),
      fetch('/api/admin/role-requests')
    ]);
    
    if (pubRes.ok) {
      const data = await pubRes.json();
      setPublishers(data.users || []);
    }
    
    if (reqRes.ok) {
      const data = await reqRes.json();
      setRequests(data.requests || []);
    }
    setLoading(false);
  };

  const handleRoleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`/api/admin/role-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchData();
    }
  };

  const removePublisher = async (userId: string) => {
    if (!confirm('Are you sure you want to downgrade this publisher to viewer?')) return;
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'viewer' })
    });
    if (res.ok) {
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
            <div className="w-12 h-12 rounded-2xl bg-[--admin-accent-soft] border border-[--admin-border] flex items-center justify-center shadow-xl shadow-[--admin-accent]/10">
              <span className="material-symbols-outlined text-[--admin-accent] text-3xl">verified</span>
            </div>
            <div>
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Publisher Core</h1>
               <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage Creator Privileges & Applications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Pending Requests */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-[--admin-accent]">pending_actions</span>
                Role Applications
              </h3>
              <div className="glass-card admin-card rounded-[2.5rem] overflow-hidden">
                {requests.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">No pending applications</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/5">
                        {requests.map((req) => (
                          <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img src={req.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                <div>
                                  <p className="text-sm font-black text-white uppercase tracking-tighter">{req.username}</p>
                                  <p className="text-[10px] font-bold text-neutral-600 truncate max-w-[150px]">{req.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => handleRoleAction(req.id, 'accepted')} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">APPROVE</button>
                                <button onClick={() => handleRoleAction(req.id, 'rejected')} className="bg-white/5 hover:bg-red-600/20 text-neutral-600 hover:text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">REJECT</button>
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

            {/* Active Publishers */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-[--admin-accent]">groups</span>
                Active Publishers
              </h3>
              <div className="glass-card admin-card rounded-[2.5rem] overflow-hidden">
                {publishers.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">No publishers found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-white/5">
                        {publishers.map((pub) => (
                          <tr key={pub.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <img src={pub.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                <div>
                                  <p className="text-sm font-black text-white uppercase tracking-tighter">{pub.username}</p>
                                  <p className="text-[10px] font-bold text-neutral-600">Publisher since {new Date(pub.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => removePublisher(pub.id)} className="text-[10px] font-black text-neutral-600 hover:text-red-400 uppercase tracking-widest transition-colors">REVOKE ACCESS</button>
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
