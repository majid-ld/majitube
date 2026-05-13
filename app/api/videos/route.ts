import { NextRequest, NextResponse } from 'next/server';
import db, { videosDb, subscriptionsDb } from '@/lib/db';
import { getDriveStreamUrls } from '@/lib/drive';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort'); // 'newest', 'popular'
    const feed = searchParams.get('feed'); // 'all', 'subscriptions'
    const isReels = searchParams.get('reels') === 'true';

    const session = await getSession();
    
    let sql = `
      SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
      FROM videos v
      LEFT JOIN users u ON v.publisher_id = u.id
      WHERE v.is_reel = ? AND (v.visibility = 'public' 
             OR ? = 'admin'
             OR (v.visibility = 'private' AND v.publisher_id = ?)
             OR (v.visibility = 'vip' AND (v.publisher_id = ? OR EXISTS (
               SELECT 1 FROM vip_requests r 
               WHERE r.user_id = ? AND r.publisher_id = v.publisher_id AND r.status = 'accepted'
             ))))
    `;
    const params: any[] = [
      isReels ? 1 : 0,
      session?.role || 'viewer',
      session?.id || 'null', 
      session?.id || 'null', 
      session?.id || 'null'
    ];

    if (query && query.trim()) {
      sql += ` AND v.title LIKE ?`;
      params.push(`%${query.trim()}%`);
    }

    if (category && category !== 'All') {
      sql += ` AND v.category = ?`;
      params.push(category);
    }

    if (feed === 'subscriptions') {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      const subRes = subscriptionsDb.getSubscribedPublisherIds.all(session.id) as {publisher_id: string}[];
      const publisherIds = subRes.map(s => s.publisher_id);
      
      if (publisherIds.length > 0) {
        sql += ` AND v.publisher_id IN (${publisherIds.map(() => '?').join(',')})`;
        params.push(...publisherIds);
      } else {
        // user has no subscriptions, return empty
        return NextResponse.json({ videos: [] });
      }
    }

    if (sort === 'popular') {
      sql += ` ORDER BY v.views DESC`;
    } else {
      sql += ` ORDER BY v.created_at DESC`;
    }

    const videos = db.prepare(sql).all(...params) as any[];

    // Enrich with streaming URLs
    const enriched = videos.map((v) => {
      const urls = getDriveStreamUrls(v.drive_id);
      return {
        ...v,
        streamUrl: urls.streamUrl,
        embedUrl: urls.embedUrl,
        thumbnailUrl: v.thumbnail_url || urls.thumbnailUrl,
      };
    });

    return NextResponse.json({ videos: enriched });
  } catch (error: any) {
    console.error('Videos list error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch videos' }, { status: 500 });
  }
}
