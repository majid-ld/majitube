'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [search, setSearch] = useState('');
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data.session))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className={`fixed top-0 w-full z-50 ${isAdminPage ? 'bg-[#07080f]' : 'bg-[#0f0f0f]'} h-14 px-4 flex items-center justify-between`}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          className="p-2 hover:bg-[#272727] rounded-full transition-colors md:hidden text-white"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link href="/" className="flex items-center gap-1 group">
          <span className="material-symbols-outlined text-red-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
          <span className="text-xl font-bold tracking-tighter text-white">{isAdminPage ? 'DashTube Admin' : 'DashTube'}</span>
        </Link>
      </div>

      {/* Center - Search */}
      <div className="hidden sm:flex flex-1 max-w-[720px] mx-4">
        <form onSubmit={(e) => { e.preventDefault(); router.push(`/?q=${search}`); }} className="flex w-full">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#121212] border border-[#303030] rounded-l-full py-2 px-4 focus:outline-none focus:border-[#065fd4] transition-all text-sm placeholder-neutral-500"
            />
          </div>
          <button type="submit" className="bg-[#222222] border border-l-0 border-[#303030] rounded-r-full px-5 hover:bg-[#272727] transition-colors">
            <span className="material-symbols-outlined text-neutral-400">search</span>
          </button>
        </form>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {session?.role === 'publisher' || session?.role === 'admin' ? (
          <Link href="/upload" className="p-2 hover:bg-[#272727] rounded-full transition-colors hidden sm:block" title="Create">
            <span className="material-symbols-outlined">video_call</span>
          </Link>
        ) : null}
        
        <button className="p-2 hover:bg-[#272727] rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
        {session ? (
          <div className="flex items-center gap-2 ml-2">
            <Link href="/profile">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 cursor-pointer">
                <img 
                  src={session.avatar || "https://lh3.googleusercontent.com/a/default-user"} 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-[#272727] rounded-full transition-colors"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-neutral-400">logout</span>
            </button>
          </div>
        ) : (
          <Link href="/login" className="ml-2 flex items-center gap-2 border border-[#3e3e3e] text-[#3ea6ff] px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[#263850] hover:border-transparent transition-all">
            <span className="material-symbols-outlined text-xl">account_circle</span>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
