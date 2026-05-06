'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Uncategorized');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'vip'>('public');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selected: File) => {
    if (!selected.type.includes('mp4') && !selected.type.includes('video')) {
      setErrorMsg('Only video files are supported (MP4 recommended).');
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    setErrorMsg('');
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }, [title]);

  const uploadChunked = async () => {
    if (!file || !title.trim()) return;
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    let customThumbnailUrl = '';
    if (thumbnailFile) {
      try {
        const thumbData = new FormData();
        thumbData.append('file', thumbnailFile);
        const thumbRes = await fetch('/api/upload/thumbnail', {
          method: 'POST',
          body: thumbData
        });
        if (thumbRes.ok) {
          const { url } = await thumbRes.json();
          customThumbnailUrl = url;
        }
      } catch (err) {
        console.error('Failed to upload thumbnail', err);
      }
    }

    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('uploadId', uploadId);
        formData.append('fileName', file.name);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('visibility', visibility);
        if (customThumbnailUrl) formData.append('thumbnailUrl', customThumbnailUrl);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Server error on chunk ${i}`);
        }

        const data = await response.json();

        const chunkProgress = Math.round(((i + 1) / totalChunks) * 90);
        setProgress(chunkProgress);

        if (i === totalChunks - 1) {
          setStatus('processing');
          setProgress(100);
          setTimeout(() => {
            setStatus('success');
            if (data.video?.id) {
              setTimeout(() => router.push(`/video/${data.video.id}`), 1500);
            }
          }, 1000);
        }
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setThumbnailFile(null);
    setTitle('');
    setDescription('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="max-w-4xl mx-auto font-inter">
      <div className="glass-card rounded-3xl border-white/5 p-8 backdrop-blur-3xl shadow-2xl shadow-violet-900/10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: File Selection */}
          <div className="lg:w-1/2 space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`
                relative h-[400px] flex flex-col items-center justify-center text-center transition-all duration-500 rounded-3xl overflow-hidden
                ${isDragging ? 'bg-violet-600/10 scale-[1.02]' : 'bg-white/2'}
                ${file ? 'border-2 border-green-500/30' : 'upload-dashed border-0 cursor-pointer hover:bg-white/5'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              
              {file ? (
                <div className="space-y-4 px-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <span className="material-symbols-outlined text-4xl text-green-400">movie</span>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg line-clamp-2">{file.name}</h3>
                    <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest mt-1">{formatSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-neutral-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Change Video
                  </button>
                </div>
              ) : (
                <div className="space-y-4 px-6 relative z-10 pointer-events-none">
                  <div className="w-20 h-20 rounded-3xl bg-violet-600/10 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-600/20">
                    <span className="material-symbols-outlined text-5xl text-violet-500">cloud_upload</span>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-2xl tracking-tighter uppercase mb-2">Drop your files here</h3>
                    <p className="text-neutral-500 font-medium text-sm">MP4 recommended — Up to 5GB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 glass-card rounded-2xl border-white/5">
              <label className="block text-xs font-black text-neutral-500 uppercase tracking-[0.2em] mb-4">Custom Thumbnail</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white/10 file:text-white hover:file:bg-violet-600 file:transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="lg:w-1/2 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The future of cinema..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details about your content..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all resize-none font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold text-sm appearance-none"
                  >
                    <option value="Uncategorized">Other</option>
                    <option value="Tech">Tech</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="Music">Music</option>
                    <option value="Life">Life</option>
                    <option value="Trending">Trending</option>
                    <option value="Exclusive">Exclusive</option>
                    <option value="New">New</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-violet-500/50 transition-all font-bold text-sm appearance-none"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="vip">VIP Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status & Progress */}
            <div className="pt-4 space-y-4">
              {(status === 'uploading' || status === 'processing') && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.1em]">
                      {status === 'processing' ? 'Processing on Drive...' : `Uploading... ${progress}%`}
                    </span>
                    <span className="text-[10px] font-black text-white">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3">
                  <span className="material-symbols-outlined">check_circle</span>
                  Cinematic Content Uploaded Successfully!
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-3">
                  <span className="material-symbols-outlined">error</span>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={uploadChunked}
                disabled={!file || !title.trim() || status === 'uploading' || status === 'processing' || status === 'success'}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-2xl shadow-violet-600/30 transition-all active:scale-95"
              >
                {status === 'uploading' || status === 'processing' ? 'UPLOAD IN PROGRESS...' : 'PUBLISH TO DASHSTREAM'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

