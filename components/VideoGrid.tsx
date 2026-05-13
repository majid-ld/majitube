'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import ShareButton from './ShareButton';
import SaveToPlaylistButton from './SaveToPlaylistButton';
import { useRouter } from 'next/navigation';

export interface VideoMeta {
  id: string;
  drive_id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  views: number;
  created_at: string;
  visibility: 'public' | 'private' | 'vip';
  publisher_id?: string;
  publisher_username?: string;
  publisher_avatar?: string;
  category?: string;
}

interface VideoGridProps {
  videos: VideoMeta[];
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Just now';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function VideoCard({ video, session, onRefresh }: { video: VideoMeta, session: any, onRefresh?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: video.title, description: video.description || '', visibility: video.visibility, thumbnail_url: video.thumbnailUrl || '' });
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canManage = session?.role === 'admin' || session?.id === video.publisher_id;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(`${window.location.origin}/video/${video.id}`);
      setMenuOpen(false);
      alert('Link copied to clipboard!');
    }
  };

  const handleWatchLater = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/videos/${video.id}/watchlater`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(data.added ? 'Added to Watch Later' : 'Removed from Watch Later');
        setMenuOpen(false);
      } else {
        alert('Please sign in to use Watch Later');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Video deleted successfully');
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert('Failed to delete video');
      }
    } catch (err) {
      console.error(err);
    }
    setMenuOpen(false);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditing(false);
        if (onRefresh) onRefresh();
        else window.location.reload();
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditForm({ ...editForm, thumbnail_url: data.url });
      } else {
        alert('Failed to upload thumbnail');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingThumb(false);
    }
  };


  return (
    <div className="flex flex-col gap-3 group relative">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#181818]">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-2 left-2 flex gap-2">
            {video.visibility === 'vip' && (
              <span className="badge-vip flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                VIP
              </span>
            )}
            {video.category && video.category !== 'Uncategorized' && (
              <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-white/10">
                {video.category}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="flex gap-3 relative">
        {video.publisher_id ? (
          <Link href={`/${video.publisher_username || video.publisher_id}`} className="shrink-0 pt-0.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#272727]">
              <img 
                src={video.publisher_avatar || "https://lh3.googleusercontent.com/a/default-user"} 
                alt={video.publisher_username}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        ) : (
          <div className="shrink-0 pt-0.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#272727]">
              <span className="material-symbols-outlined text-neutral-600 w-full h-full flex items-center justify-center">person</span>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden pr-6">
          <Link href={`/video/${video.id}`}>
            <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-neutral-300">
              {video.title}
            </h3>
          </Link>
          <div className="flex flex-col text-[13px] text-[#aaaaaa]">
            {video.publisher_id ? (
              <Link href={`/${video.publisher_username || video.publisher_id}`} className="hover:text-white transition-colors">
                {video.publisher_username || 'DashTube Creator'}
              </Link>
            ) : (
              <span>Unknown Creator</span>
            )}
            <div className="flex items-center gap-1">
               <span>{formatViews(video.views)} views</span>
               <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
               <span>{timeAgo(video.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 3-dot menu button */}
        <div className="absolute right-0 top-0" ref={menuRef}>
          <button 
            onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-[#1e1e1e] border border-white/20 shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col rounded-xl">
              <button onClick={handleWatchLater} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Watch Later
              </button>
              <div className="px-2" onClick={(e) => e.stopPropagation()}>
                <SaveToPlaylistButton videoId={video.id} />
              </div>
              <button onClick={handleShare} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
                <span className="material-symbols-outlined text-[18px]">share</span>
                Share
              </button>
              {canManage && (
                <>
                  <div className="my-1 border-t border-white/10" />
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Edit Video
                  </button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete Video
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[#181818] border border-white/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Video</h2>
              <button onClick={(e) => { e.preventDefault(); setEditing(false); }} className="text-neutral-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveVideo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Title</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors" 
                  rows={4} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Visibility</label>
                <select 
                  value={editForm.visibility} 
                  onChange={e => setEditForm({...editForm, visibility: e.target.value as any})} 
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors"
                >
                  <option value="public" className="bg-[#181818]">Public</option>
                  <option value="private" className="bg-[#181818]">Private</option>
                  <option value="vip" className="bg-[#181818]">VIP Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Thumbnail</label>
                <div 
                  className="relative w-full h-32 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-white/5 transition-all overflow-hidden group"
                  onClick={() => document.getElementById(`thumb-upload-${video.id}`)?.click()}
                >
                  {uploadingThumb ? (
                    <span className="material-symbols-outlined animate-spin text-white text-3xl">sync</span>
                  ) : editForm.thumbnail_url ? (
                    <>
                      <img src={editForm.thumbnail_url} alt="Thumbnail preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-3xl mb-1">upload</span>
                        <span className="text-xs font-bold text-white">Change Thumbnail</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center opacity-70 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-neutral-400 text-3xl mb-1">upload</span>
                      <span className="text-xs font-bold text-neutral-400">Upload Thumbnail</span>
                    </div>
                  )}
                  <input type="file" id={`thumb-upload-${video.id}`} className="hidden" accept="image/*" onChange={handleThumbUpload} disabled={uploadingThumb} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={(e) => { e.preventDefault(); setEditing(false); }} className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-300 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-[#3ea6ff] hover:bg-[#65b8ff] text-black px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function VideoGrid({ videos, onRefresh }: VideoGridProps & { onRefresh?: () => void }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data.session))
      .catch(() => {});
  }, []);

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center glass-card rounded-[3rem] border-white/5">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-2xl">
          <span className="material-symbols-outlined text-neutral-700 text-5xl">movie_off</span>
        </div>
        <h3 className="text-white text-2xl font-black uppercase tracking-tighter mb-2">The Screen is Dark</h3>
        <p className="text-neutral-500 font-medium max-w-xs mx-auto">Upload your first cinematic masterpiece to illuminate the platform.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} session={session} onRefresh={onRefresh} />
      ))}
    </section>
  );
}


