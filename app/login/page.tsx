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
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] font-sans overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6 mt-14">
        <div className="w-full max-w-[400px] bg-[#0f0f0f] border border-[#303030] rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#303030] flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-3xl text-white">account_circle</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to DashTube</h1>
            <p className="text-neutral-400 text-sm">Continue to your account</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#3ea6ff] transition-all text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#303030] rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#3ea6ff] transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3ea6ff] hover:bg-[#65b8ff] text-black font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#303030] text-center">
            <p className="text-sm text-neutral-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#3ea6ff] hover:text-[#65b8ff] font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

