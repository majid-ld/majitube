import { notFound } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ShareButton from '@/components/ShareButton';
import LikeButton from '@/components/LikeButton';
import SaveToPlaylistButton from '@/components/SaveToPlaylistButton';
import CommentsSection from '@/components/CommentsSection';
import SubscribeButton from '@/components/SubscribeButton';
import type { Metadata } from 'next';
import { getDriveStreamUrls } from '@/lib/drive';
import { videosDb, vipDb } from '@/lib/db';
import { getSession } from '@/lib/session';
import VipLockScreen from '@/components/VipLockScreen';
import db from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const video = videosDb.getById.get(id);
  if (!video) return { title: 'Video Not Found — DashStream' };
  return {
    title: `${video.title} — DashStream`,
    description: video.description || `Watch "${video.title}" on DashStream`,
    openGraph: {
      title: video.title,
      description: video.description || '',
      images: [video.thumbnail_url || 'https://placehold.co/1200x630/1a1a1a/ffffff?text=Video+Thumbnail'],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;

  const video = videosDb.getById.get(id);
  if (!video) notFound();

  videosDb.incrementViews.run(id);

  const session = await getSession();
  
  const isOwner = session?.id === video.publisher_id;
  const isAdmin = session?.role === 'admin';
  let isAuthorized = true;
  let vipStatus: 'none' | 'pending' | 'accepted' | 'rejected' = 'none';

  if (video.visibility === 'private' && !isOwner && !isAdmin) {
    isAuthorized = false;
  } else if (video.visibility === 'vip' && !isOwner && !isAdmin) {
    if (!session) {
      isAuthorized = false;
    } else {
      const res = vipDb.getRequestStatus.get(session.id, video.publisher_id!);
      vipStatus = (res?.status as any) || 'none';
      if (vipStatus !== 'accepted') {
        isAuthorized = false;
      }
    }
  }

  const recommendedVideos = db.prepare(`
    SELECT v.*, u.username as publisher_username 
    FROM videos v
    JOIN users u ON v.publisher_id = u.id
    WHERE v.id != ? AND v.visibility = 'public'
    LIMIT 10
  `).all(id) as any[];

  const urls = getDriveStreamUrls(video.drive_id);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Sidebar />

      <main className="pt-14 md:ml-60 px-4 md:px-8 pb-12 max-w-[1700px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {!isAuthorized ? (
                <VipLockScreen 
                  publisherName={video.publisher_username || 'Publisher'} 
                  publisherId={video.publisher_id!} 
                  initialStatus={vipStatus} 
                  thumbnailUrl={video.thumbnail_url}
                />
              ) : (
                <VideoPlayer embedUrl={urls.embedUrl} title={video.title} />
              )}
            </div>

            {/* Video Meta */}
            <div className="mt-4">
              <h1 className="text-xl font-bold line-clamp-2 leading-tight">
                {video.title}
              </h1>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                <div className="flex items-center gap-3">
                  {video.publisher_id ? (
                    <Link href={`/${video.publisher_username || video.publisher_id}`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#272727]">
                        <img 
                          src={video.publisher_avatar || "https://lh3.googleusercontent.com/a/default-user"} 
                          alt={video.publisher_username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#272727] flex items-center justify-center">
                      <span className="material-symbols-outlined text-neutral-600">person</span>
                    </div>
                  )}
                  <div className="flex flex-col mr-4">
                    {video.publisher_id ? (
                      <Link href={`/${video.publisher_username || video.publisher_id}`} className="font-bold text-sm hover:text-neutral-300">
                        {video.publisher_username || 'DashTube Creator'}
                      </Link>
                    ) : (
                      <span className="font-bold text-sm">Unknown Creator</span>
                    )}
                    <span className="text-xs text-[#aaaaaa]">Creator</span>
                  </div>
                  {video.publisher_id && <SubscribeButton publisherId={video.publisher_id} />}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#272727] rounded-full overflow-hidden">
                    <LikeButton videoId={id} />
                    <div className="w-[1px] h-6 bg-white/10" />
                    <button className="px-4 py-2 hover:bg-[#3f3f3f] transition-colors flex items-center">
                       <span className="material-symbols-outlined">thumb_down</span>
                    </button>
                  </div>
                  <ShareButton />
                  <SaveToPlaylistButton videoId={id} />
                </div>
              </div>

              {/* Description Box */}
              <div className="mt-4 p-3 bg-[#272727] rounded-xl hover:bg-[#3f3f3f] transition-colors cursor-pointer group">
                <div className="flex gap-3 text-sm font-bold mb-1">
                  <span>{formatViews(video.views)} views</span>
                  <span>{formatDate(video.created_at)}</span>
                  {video.visibility === 'vip' && (
                    <span className="badge-vip">VIP</span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Comments */}
              <div className="mt-6">
                <CommentsSection videoId={id} />
              </div>
            </div>
          </div>

          {/* Sidebar - Recommendations */}
          <div className="lg:w-[400px] flex-shrink-0">
            <div className="flex flex-col gap-3">
              {recommendedVideos.map((v) => (
                <Link key={v.id} href={`/video/${v.id}`} className="flex gap-2 group">
                  <div className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-[#181818]">
                    {v.thumbnail_url ? (
                      <img 
                        src={v.thumbnail_url} 
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                        <span className="material-symbols-outlined text-neutral-700 text-xl">movie</span>
                      </div>
                    )}
                    {v.visibility === 'vip' && (
                      <div className="absolute top-1 right-1">
                         <span className="badge-vip !text-[8px] !px-1">VIP</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold line-clamp-2 leading-snug mb-1">
                      {v.title}
                    </h4>
                    <p className="text-xs text-[#aaaaaa] hover:text-white transition-colors truncate">
                      {v.publisher_username}
                    </p>
                    <p className="text-xs text-[#aaaaaa]">
                      {formatViews(v.views)} views • {formatDate(v.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
