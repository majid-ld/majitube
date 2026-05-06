'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-container-lowest font-inter overflow-hidden relative">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md glass-card rounded-[2.5rem] border-white/5 p-10 shadow-2xl shadow-black/60 backdrop-blur-3xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
               <span className="material-symbols-outlined text-4xl text-violet-500">lock_open</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 leading-none">Welcome Back</h1>
            <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">Access the Cinematic Universe</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-xs font-black uppercase tracking-wider flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-neutral-700 focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                placeholder="neo@matrix.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-neutral-700 focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-violet-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              New to DashStream?{' '}
              <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors">
                Initialize Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

