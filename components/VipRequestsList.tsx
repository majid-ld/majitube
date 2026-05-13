'use client';

import { useState, useEffect } from 'react';

export default function VipRequestsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [accepted, setAccepted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/vip/requests');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
      if (data.accepted) setAccepted(data.accepted);
    } catch (error) {
      console.error('Failed to fetch VIP requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    setActionId(requestId);
    try {
      const res = await fetch(`/api/vip/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        if (status === 'accepted') {
          // Move from requests to accepted
          const acceptedReq = requests.find(r => r.id === requestId);
          if (acceptedReq) {
            setAccepted(prev => [acceptedReq, ...prev]);
            setRequests(prev => prev.filter(r => r.id !== requestId));
          }
        } else {
          // It was rejected or revoked
          setRequests(prev => prev.filter(r => r.id !== requestId));
          setAccepted(prev => prev.filter(r => r.id !== requestId));
        }
      }
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
    } finally {
      setActionId(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-12">
      <span className="material-symbols-outlined animate-spin text-4xl text-violet-500">sync</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {requests.length > 0 && <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-6 mb-2">Pending Requests</h4>}
      {requests.map((req) => (
        <div key={req.id} className="p-5 glass-card rounded-[1.5rem] border-white/5 flex items-center justify-between group hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 p-0.5 overflow-hidden transition-all group-hover:scale-110">
              <img 
                src={req.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} 
                alt={req.username} 
                className="w-full h-full object-cover rounded-xl" 
              />
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tighter">@{req.username}</p>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">
                Requested {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAction(req.id, 'accepted')}
              disabled={!!actionId}
              className="w-10 h-10 rounded-2xl bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-violet-600/5 border border-violet-500/20"
              title="Approve Access"
            >
              {actionId === req.id ? (
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              ) : (
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </button>
            <button
              onClick={() => handleAction(req.id, 'rejected')}
              disabled={!!actionId}
              className="w-10 h-10 rounded-2xl bg-white/5 text-neutral-600 hover:bg-red-600/20 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-50 border border-white/5"
              title="Reject Request"
            >
              <span className="material-symbols-outlined text-xl">block</span>
            </button>
          </div>
        </div>
      ))}

      {accepted.length > 0 && <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-6 mb-2">Current VIPs</h4>}
      {accepted.map((req) => (
        <div key={req.id} className="p-5 glass-card rounded-[1.5rem] border-white/5 flex items-center justify-between group hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 p-0.5 overflow-hidden transition-all group-hover:scale-110">
              <img 
                src={req.avatar_url || "https://lh3.googleusercontent.com/a/default-user"} 
                alt={req.username} 
                className="w-full h-full object-cover rounded-xl" 
              />
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tighter">@{req.username}</p>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">
                Accepted {new Date(req.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { if(confirm('Are you sure you want to revoke VIP access for this user?')) handleAction(req.id, 'rejected'); }}
              disabled={!!actionId}
              className="w-10 h-10 rounded-2xl bg-white/5 text-neutral-600 hover:bg-red-600/20 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-50 border border-white/5"
              title="Revoke Access"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        </div>
      ))}

      {requests.length === 0 && accepted.length === 0 && (
        <div className="py-20 text-center glass-card rounded-[2rem] border-white/5 bg-white/[0.01]">
          <span className="material-symbols-outlined text-neutral-800 text-5xl mb-4">verified_user</span>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">No Audience</p>
        </div>
      )}
    </div>
  );
}


