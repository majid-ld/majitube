'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data.session))
      .catch(() => {});
  }, [pathname]);

  const [isOpen, setIsOpen] = useState(false);

  // Listen for mobile menu toggle from Navbar (via window event or state)
  useEffect(() => {
    const handleToggle = () => setIsOpen(!isOpen);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, [isOpen]);

  const links = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
  ];

  const personalLinks = [
    { href: '/playlists', label: 'Library', icon: 'video_library' },
    { href: '/history', label: 'History', icon: 'history' },
    { href: '/watch-later', label: 'Watch Later', icon: 'schedule' },
    { href: '/profile', label: 'Your Profile', icon: 'account_circle' },
  ];

  const publisherLinks = [
    { href: '/dashboard', label: 'YouTube Studio', icon: 'dashboard' },
    { href: '/dashboard/vip', label: 'VIP Management', icon: 'verified_user' },
    { href: '/upload', label: 'Upload', icon: 'upload' },
  ];

  const adminLinks = [
    { href: '/admin/users', label: 'User Control', icon: 'security' },
    { href: '/admin/publishers', label: 'Publisher Core', icon: 'verified' },
    { href: '/admin/vip', label: 'Global VIP', icon: 'stars' },
  ];

  return (
    <>
    {/* Mobile Overlay */}
    {isOpen && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setIsOpen(false)}
      />
    )}

    <aside className={`fixed left-0 top-0 h-full w-64 bg-[#05060f] border-r border-white/10 flex-col pt-16 z-50 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="flex flex-col px-4 overflow-y-auto h-full py-6">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2.5 mb-1 flex items-center gap-5 transition-colors rounded-xl text-sm font-medium ${
                isActive ? 'bg-[#272727]' : 'hover:bg-[#272727]'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        <div className="my-3 border-t border-white/10" />

        {personalLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2.5 mb-1 flex items-center gap-5 transition-colors rounded-xl text-sm font-medium ${
                isActive ? 'bg-[#272727]' : 'hover:bg-[#272727]'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}

        {(session?.role === 'publisher' || session?.role === 'admin') && (
          <>
            <div className="my-3 border-t border-white/10" />
            {publisherLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 mb-1 flex items-center gap-5 transition-colors rounded-xl text-sm font-medium ${
                    isActive ? 'bg-[#272727]' : 'hover:bg-[#272727]'
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </>
        )}

        {session?.role === 'admin' && (
          <>
            <div className="my-3 border-t border-white/10" />
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 mb-1 flex items-center gap-5 transition-colors rounded-xl text-sm font-medium ${
                    isActive ? 'bg-[#272727]' : 'hover:bg-[#272727]'
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </>
        )}
      </div>
    </aside>
    </>
  );
}
