import { NextResponse } from 'next/server';
import { usersDb, videosDb, vipDb, subscriptionsDb } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: publisherIdOrUsername } = await params;
    const session = await getSession();
    const currentUserId = session?.id;

    let publisher;
    if (publisherIdOrUsername.length === 36 && publisherIdOrUsername.includes('-')) {
      publisher = usersDb.getById.get(publisherIdOrUsername);
    } else {
      publisher = usersDb.getByUsername.get(publisherIdOrUsername);
    }

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 });
    }

    const publisherId = publisher.id;

    // Check VIP status
    let isVip = false;
    let vipStatus = null;
    if (currentUserId) {
      const vipCheck = vipDb.isVip.get(currentUserId, publisherId);
      isVip = vipCheck ? vipCheck.count > 0 : false;
      
      const statusCheck = vipDb.getRequestStatus.get(currentUserId, publisherId);
      vipStatus = statusCheck ? statusCheck.status : null;
    }

    // Get subscription status
    let isSubscribed = false;
    if (currentUserId) {
      const subCheck = subscriptionsDb.isSubscribed.get(currentUserId, publisherId);
      isSubscribed = subCheck ? subCheck.count > 0 : false;
    }

    const subscriberCount = subscriptionsDb.countSubscribers.get(publisherId)?.count || 0;

    // Get videos and filter by visibility
    const allVideos = videosDb.getByPublisherId.all(publisherId);
    const filteredVideos = allVideos.filter(video => {
      if (video.visibility === 'public') return true;
      if (currentUserId === publisherId) return true; // Owner can see everything
      if (video.visibility === 'vip' && isVip) return true;
      return false;
    });

    return NextResponse.json({
      publisher: {
        id: publisher.id,
        username: publisher.username,
        avatar_url: publisher.avatar_url,
        role: publisher.role,
        bio: publisher.bio,
        tiktok: publisher.tiktok,
        snapchat: publisher.snapchat,
        instagram: publisher.instagram,
        facebook: publisher.facebook,
        subscriberCount,
      },
      videos: filteredVideos,
      isVip,
      vipStatus,
      isSubscribed,
    });
  } catch (error) {
    console.error('Failed to get publisher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
