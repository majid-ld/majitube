'use client';

import { useState, useEffect } from 'react';
import { VIDEO_CATEGORIES } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import VipRequestsList from '@/components/VipRequestsList';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [myVideos, setMyVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', visibility: '', thumbnail_url: '', category: 'Uncategorized' });
  const [savingVideo, setSavingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch('/api/analytics').then(res => res.json()),
      fetch('/api/videos/my').then(res => res.json())
    ]).then(([analyticsData, myVideosData]) => {
      if (analyticsData.stats) {
        setStats(analyticsData.stats);
        setTopVideos(analyticsData.topVideos || []);
      }
      if (myVideosData.videos) {
        setMyVideos(myVideosData.videos);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (video: any) => {
    setEditingVideo(video);
    setEditForm({ 
      title: video.title, 
      description: video.description || '', 
      visibility: video.visibility, 
      thumbnail_url: video.thumbnailUrl || video.thumbnail_url || '',
      category: video.category || 'Uncategorized'
    });
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingVideo(true);
    try {
      const res = await fetch(`/api/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingVideo(null);
        fetchData();
      } else {
        alert('Failed to save changes');
      }
    } catch (e) {
      console.error(e);
    }
    setSavingVideo(false);
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

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-violet-500">sync</span>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />
      
      <main className="md:ml-60 pt-14 px-8 min-h-screen">
        <div className="max-w-6xl mx-auto py-10">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold">Channel Dashboard</h1>
            <Link href="/upload" className="bg-[#3ea6ff] hover:bg-[#65b8ff] text-black font-bold py-2 px-6 rounded-full flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">upload</span>
              Upload
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Stats */}
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Total Views</h3>
               <p className="text-4xl font-bold">{stats?.total_views || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Total Videos</h3>
               <p className="text-4xl font-bold">{stats?.total_videos || 0}</p>
            </div>
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#303030]">
               <h3 className="text-[#aaaaaa] text-sm font-bold uppercase mb-4">Storage Used</h3>
               <p className="text-4xl font-bold">{formatSize(stats?.total_size || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
             {/* VIP Requests */}
             <div className="bg-[#1e1e1e] rounded-xl border border-[#303030] overflow-hidden">
                <div className="p-4 border-b border-[#303030] flex items-center justify-between">
                   <h3 className="font-bold">VIP Audience</h3>
                   <span className="bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">MANAGE</span>
                </div>
                <div className="p-4 max-h-[400px] overflow-y-auto">
                   <VipRequestsList />
                </div>
             </div>

             {/* Top Videos */}
             <div className="bg-[#1e1e1e] rounded-xl border border-[#303030] overflow-hidden">
                <div className="p-4 border-b border-[#303030]">
                   <h3 className="font-bold">Top Performing Videos</h3>
                </div>
                <div className="p-4">
                   <div className="space-y-4">
                      {topVideos.map((video, idx) => (
                        <Link key={video.id} href={`/video/${video.id}`} className="flex items-center gap-4 group">
                           <div className="w-8 text-[#aaaaaa] font-bold">#{idx + 1}</div>
                           <div className="w-24 aspect-video rounded overflow-hidden flex-shrink-0 bg-neutral-900">
                              {(video.thumbnailUrl || video.thumbnail_url) ? (
                                <img src={video.thumbnailUrl || video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-neutral-700">movie</span>
                                </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold truncate group-hover:text-[#3ea6ff] transition-colors">{video.title}</h4>
                              <p className="text-xs text-[#aaaaaa]">{video.views} views</p>
                           </div>
                        </Link>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-[#1e1e1e] rounded-xl border border-[#303030] overflow-hidden mb-10">
             <div className="p-4 border-b border-[#303030]">
                <h3 className="font-bold">Manage Videos</h3>
             </div>
             <div className="p-4">
                <div className="space-y-4">
                   {myVideos.map((video) => (
                     <div key={video.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="w-32 aspect-video rounded overflow-hidden flex-shrink-0 relative bg-neutral-900">
                           {(video.thumbnailUrl || video.thumbnail_url) ? (
                              <img src={video.thumbnailUrl || video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                 <span className="material-symbols-outlined text-neutral-700">movie</span>
                              </div>
                           )}
                           <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold uppercase">{video.visibility}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-bold truncate text-white">{video.title}</h4>
                           <p className="text-xs text-[#aaaaaa] mt-1 line-clamp-2">{video.description || 'No description'}</p>
                           <p className="text-xs text-[#aaaaaa] mt-1">{video.views} views • {new Date(video.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openEditModal(video)} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-sm">edit</span>
                           </button>
                           <button onClick={() => handleDelete(video.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors">
                              <span className="material-symbols-outlined text-sm">delete</span>
                           </button>
                        </div>
                     </div>
                   ))}
                   {myVideos.length === 0 && (
                     <p className="text-center text-neutral-500 py-10">You haven't uploaded any videos yet.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Video</h2>
              <button onClick={() => setEditingVideo(null)} className="text-neutral-400 hover:text-white">
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors" 
                  rows={4} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Visibility</label>
                <select 
                  value={editForm.visibility} 
                  onChange={e => setEditForm({...editForm, visibility: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors"
                >
                  <option value="public" className="bg-[#181818]">Public</option>
                  <option value="private" className="bg-[#181818]">Private</option>
                  <option value="vip" className="bg-[#181818]">VIP Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Category</label>
                <select 
                  value={editForm.category} 
                  onChange={e => setEditForm({...editForm, category: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-violet-500 transition-colors"
                >
                  {VIDEO_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-[#181818]">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 mb-2">Thumbnail</label>
                <div 
                  className="relative w-full h-32 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-white/5 transition-all overflow-hidden group"
                  onClick={() => document.getElementById(`dash-thumb-upload-${editingVideo.id}`)?.click()}
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
                  <input type="file" id={`dash-thumb-upload-${editingVideo.id}`} className="hidden" accept="image/*" onChange={handleThumbUpload} disabled={uploadingThumb} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingVideo(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-neutral-300 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={savingVideo} className="bg-[#3ea6ff] hover:bg-[#65b8ff] text-black px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {savingVideo ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

