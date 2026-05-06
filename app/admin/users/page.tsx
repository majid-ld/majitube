'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        if (res.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
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
            <span className="material-symbols-outlined text-[--admin-accent] text-3xl">admin_panel_settings</span>
          </div>
          <div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Security Core</h1>
             <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Access Control & Identity Management</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-3xl mb-10 text-xs font-black uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">error</span>
            {error}
          </div>
        )}

        <div className="glass-card admin-card rounded-[2.5rem] overflow-hidden">
          {loading ? (
            <div className="py-32 flex justify-center">
               <span className="material-symbols-outlined animate-spin text-4xl text-violet-600">sync</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Authorized User</th>
                    <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Encryption Endpoint (Email)</th>
                    <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Privilege Level</th>
                    <th className="px-8 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] text-right">Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${
                            user.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                          }`}>
                            <span className="material-symbols-outlined text-xl">
                              {user.role === 'admin' ? 'security' : 'person'}
                            </span>
                          </div>
                          <div>
                             <p className="text-sm font-black text-white uppercase tracking-tighter">{user.username}</p>
                             <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">{user.email}</span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-lg ${
                          user.role === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/10' :
                          user.role === 'publisher' ? 'bg-violet-600/10 border-violet-500/30 text-violet-400 shadow-violet-600/10' :
                          'bg-neutral-800 border-neutral-700 text-neutral-400 shadow-black/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        {user.role !== 'admin' && (
                          <div className="relative inline-block">
                             <select
                               value={user.role}
                               onChange={(e) => updateRole(user.id, e.target.value)}
                               className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-violet-500/50 appearance-none hover:bg-white/10 transition-all cursor-pointer"
                             >
                               <option value="viewer">Viewer</option>
                               <option value="publisher">Publisher</option>
                             </select>
                             <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600 text-sm">expand_more</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </main>
      </div>
    </div>
  );
}

