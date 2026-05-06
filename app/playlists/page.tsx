'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

interface Playlist {
  id: string;
  name: string;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = async () => {
    const res = await fetch('/api/playlists');
    if (res.ok) {
      const data = await res.json();
      setPlaylists(data.playlists);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlaylistName })
    });

    if (res.ok) {
      setNewPlaylistName('');
      fetchPlaylists();
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    if (res.ok) fetchPlaylists();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />
      <main className="md:ml-60 pt-14 px-8 min-h-screen">
        <div className="max-w-6xl mx-auto py-10">
          <div className="flex items-center gap-4 mb-10">
            <span className="material-symbols-outlined text-4xl">video_library</span>
            <h1 className="text-3xl font-bold">Playlists</h1>
          </div>

          <form onSubmit={createPlaylist} className="flex gap-4 mb-12 max-w-xl">
            <input
              type="text"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="flex-1 bg-transparent border-b border-[#303030] py-2 px-1 focus:outline-none focus:border-white transition-all"
            />
            <button type="submit" disabled={!newPlaylistName.trim()} className="text-[#3ea6ff] font-bold text-sm uppercase tracking-wider hover:bg-[#263850] px-4 py-2 rounded-full transition-all disabled:opacity-0">
              Create
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center py-20">
               <span className="material-symbols-outlined animate-spin text-4xl text-neutral-500">sync</span>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-neutral-700 text-6xl mb-6">folder_off</span>
              <p className="text-neutral-500 font-medium">No playlists created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {playlists.map(playlist => (
                <div key={playlist.id} className="group relative bg-[#1e1e1e] rounded-xl p-6 hover:bg-[#2a2a2a] transition-all flex flex-col justify-between aspect-square">
                  <div>
                     <span className="material-symbols-outlined text-neutral-500 mb-4">playlist_play</span>
                     <h3 className="text-xl font-bold line-clamp-2">{playlist.name}</h3>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Link href={`/playlists/${playlist.id}`} className="text-[#3ea6ff] text-sm font-bold hover:underline">
                      View full playlist
                    </Link>
                    <button onClick={() => deletePlaylist(playlist.id)} className="text-neutral-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

