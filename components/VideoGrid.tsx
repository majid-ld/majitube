'use client';

import Link from 'next/link';

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

function VideoCard({ video }: { video: VideoMeta }) {
  return (
    <div className="flex flex-col gap-3 group">
      <Link href={`/video/${video.id}`} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#181818]">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {video.visibility === 'vip' && (
              <span className="badge-vip flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                VIP
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="flex gap-3">
        <Link href={`/publisher/${video.publisher_id}`} className="shrink-0 pt-0.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#272727]">
            <img 
              src={video.publisher_avatar || "https://lh3.googleusercontent.com/a/default-user"} 
              alt={video.publisher_username}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        <div className="flex-1 overflow-hidden">
          <Link href={`/video/${video.id}`}>
            <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-1 group-hover:text-neutral-300">
              {video.title}
            </h3>
          </Link>
          <div className="flex flex-col text-[13px] text-[#aaaaaa]">
            <Link href={`/publisher/${video.publisher_id}`} className="hover:text-white transition-colors">
              {video.publisher_username || 'DashTube Creator'}
            </Link>
            <div className="flex items-center gap-1">
               <span>{formatViews(video.views)} views</span>
               <span className="w-0.5 h-0.5 rounded-full bg-neutral-600" />
               <span>{timeAgo(video.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function VideoGrid({ videos }: VideoGridProps) {
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
        <VideoCard key={video.id} video={video} />
      ))}
    </section>
  );
}


