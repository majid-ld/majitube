'use client';

import { useState, useEffect, useRef } from 'react';

interface Playlist {
  id: string;
  name: string;
}

export default function SaveToPlaylistButton({ videoId }: { videoId: string }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);

  const [inWatchLater, setInWatchLater] = useState(false);

  useEffect(() => {
    if (isOpen && playlists.length === 0) {
      Promise.all([
        fetch('/api/playlists').then(res => res.json()),
        fetch(`/api/videos/${videoId}/watchlater`).then(res => res.json())
      ]).then(([playlistsData, watchLaterData]) => {
        if (playlistsData.playlists) setPlaylists(playlistsData.playlists);
        setInWatchLater(!!watchLaterData.inWatchLater);
        setLoading(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePlaylist = async (playlistId: string) => {
    try {
      const method = addedPlaylists.has(playlistId) ? 'DELETE' : 'POST';
      const body = method === 'POST' ? JSON.stringify({ video_id: videoId }) : undefined;
      const url = method === 'DELETE' ? `/api/playlists/${playlistId}?video_id=${videoId}` : `/api/playlists/${playlistId}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (res.ok) {
        setAddedPlaylists(prev => {
          const next = new Set(prev);
          if (method === 'POST') next.add(playlistId);
          else next.delete(playlistId);
          return next;
        });
      } else if (res.status === 401) {
        alert('Please login to save to playlists');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWatchLater = async () => {
    try {
      const res = await fetch(`/api/videos/${videoId}/watchlater`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInWatchLater(data.added);
      } else if (res.status === 401) {
        alert('Please login to use Watch Later');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative font-inter" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-neutral-400 border border-white/10 hover:border-white/30 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-wider"
      >
        <span className="material-symbols-outlined text-[18px]">playlist_add</span>
        SAVE
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 glass-card rounded-2xl border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Add to Collection</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 flex justify-center">
                <span className="material-symbols-outlined animate-spin text-violet-500">sync</span>
              </div>
            ) : (
              <>
                <button
                  onClick={toggleWatchLater}
                  className="w-full text-left px-4 py-3 text-sm text-neutral-400 hover:bg-white/5 hover:text-white flex items-center justify-between transition-all group border-b border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="truncate font-bold tracking-tight group-hover:translate-x-1 transition-transform">Watch Later</span>
                  </div>
                  {inWatchLater ? (
                    <span className="material-symbols-outlined text-violet-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-neutral-800 text-lg group-hover:text-neutral-500 transition-colors">radio_button_unchecked</span>
                  )}
                </button>
                {playlists.length === 0 ? (
                  <p className="p-6 text-center text-[10px] font-black text-neutral-600 uppercase tracking-widest leading-relaxed">No collections found.</p>
                ) : (
                  playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      onClick={() => togglePlaylist(playlist.id)}
                      className="w-full text-left px-4 py-3 text-sm text-neutral-400 hover:bg-white/5 hover:text-white flex items-center justify-between transition-all group"
                    >
                      <span className="truncate font-bold tracking-tight group-hover:translate-x-1 transition-transform">{playlist.name}</span>
                      {addedPlaylists.has(playlist.id) ? (
                        <span className="material-symbols-outlined text-violet-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-neutral-800 text-lg group-hover:text-neutral-500 transition-colors">radio_button_unchecked</span>
                      )}
                    </button>
                  ))
                )}
              </>
            )}
          </div>
          <div className="p-3 bg-white/[0.02] border-t border-white/5">
             <button className="w-full py-2 rounded-lg text-[10px] font-black text-violet-400 hover:text-violet-300 uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                CREATE NEW
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

