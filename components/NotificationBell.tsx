'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      await fetch('/api/notifications', { method: 'PUT' });
    }
  };

  return (
    <div className="relative font-inter" ref={menuRef}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-neutral-400 hover:text-white"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-[#1e1e1e] border border-white/20 rounded-3xl shadow-2xl z-[150] overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h3 className="font-black text-white uppercase tracking-tighter">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-violet-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-neutral-700 text-4xl mb-3">notifications_off</span>
                <p className="text-neutral-500 text-xs font-black uppercase tracking-widest">All caught up</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-6 border-b border-white/10 hover:bg-white/5 transition-all relative group ${!notif.is_read ? 'bg-violet-600/10' : ''}`}>
                  {!notif.is_read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-full" />}
                  {notif.link ? (
                    <Link href={notif.link} onClick={() => setIsOpen(false)} className="block text-sm text-neutral-200 group-hover:text-white transition-colors font-bold tracking-tight mb-2 leading-snug">
                      {notif.message}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-200 font-bold tracking-tight mb-2 leading-snug">{notif.message}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[12px] text-neutral-600">schedule</span>
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-black/20 border-t border-white/10 text-center">
            <button className="text-[10px] font-black text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors">Mark all as read</button>
          </div>
        </div>
      )}
    </div>
  );
}

