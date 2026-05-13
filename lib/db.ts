import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not defined');
}

export const client = createClient({
  url: url,
  authToken: authToken,
});

// Helper to handle the transition from synchronous better-sqlite3 to async libsql
// This will return the same structure but with async methods

export interface Video {
  id: string;
  drive_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  views: number;
  size: number;
  category: string;
  publisher_id?: string;
  publisher_username?: string; // JOINed
  publisher_avatar?: string; // JOINed
  visibility: 'public' | 'private' | 'vip';
  is_reel: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: string; // 'admin', 'publisher', 'viewer'
  avatar_url?: string;
  bio?: string;
  tiktok?: string;
  snapchat?: string;
  instagram?: string;
  facebook?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  username?: string; // JOINed
  avatar_url?: string; // JOINed
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export const videosDb = {
  async insert(id: string, drive_id: string, title: string, description: string, thumbnail_url: string, size: number, category: string, publisher_id: string | null, visibility: string, is_reel: number) {
    return await client.execute({
      sql: `INSERT INTO videos (id, drive_id, title, description, thumbnail_url, size, category, publisher_id, visibility, is_reel)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, drive_id, title, description, thumbnail_url, size, category, publisher_id, visibility, is_reel]
    });
  },

  async getAll() {
    const res = await client.execute(`
      SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
      FROM videos v
      LEFT JOIN users u ON v.publisher_id = u.id
      WHERE v.is_reel = 0
      ORDER BY v.created_at DESC
    `);
    return res.rows as unknown as Video[];
  },

  async getAllReels() {
    const res = await client.execute(`
      SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
      FROM videos v
      LEFT JOIN users u ON v.publisher_id = u.id
      WHERE v.is_reel = 1
      ORDER BY v.created_at DESC
    `);
    return res.rows as unknown as Video[];
  },

  async getById(id: string) {
    const res = await client.execute({
      sql: `SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
            FROM videos v
            LEFT JOIN users u ON v.publisher_id = u.id
            WHERE v.id = ?`,
      args: [id]
    });
    return (res.rows[0] as unknown as Video) || null;
  },

  async incrementViews(id: string) {
    return await client.execute({
      sql: `UPDATE videos SET views = views + 1 WHERE id = ?`,
      args: [id]
    });
  },

  async search(query: string) {
    const res = await client.execute({
      sql: `SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
            FROM videos v
            LEFT JOIN users u ON v.publisher_id = u.id
            WHERE v.title LIKE ? AND v.is_reel = 0 ORDER BY v.created_at DESC`,
      args: [`%${query}%`]
    });
    return res.rows as unknown as Video[];
  },

  async delete(id: string) {
    return await client.execute({
      sql: `DELETE FROM videos WHERE id = ?`,
      args: [id]
    });
  },

  async getByPublisherId(publisherId: string) {
    const res = await client.execute({
      sql: `SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
            FROM videos v
            LEFT JOIN users u ON v.publisher_id = u.id
            WHERE v.publisher_id = ?
            ORDER BY v.created_at DESC`,
      args: [publisherId]
    });
    return res.rows as unknown as Video[];
  },

  async update(title: string, description: string, visibility: string, thumbnail_url: string, category: string, is_reel: number, id: string) {
    return await client.execute({
      sql: `UPDATE videos SET title = ?, description = ?, visibility = ?, thumbnail_url = ?, category = ?, is_reel = ? WHERE id = ?`,
      args: [title, description, visibility, thumbnail_url, category, is_reel, id]
    });
  },
};

export const usersDb = {
  async insert(id: string, username: string, email: string, password_hash: string, role: string) {
    return await client.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      args: [id, username, email, password_hash, role]
    });
  },

  async getByEmail(email: string) {
    const res = await client.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email]
    });
    return (res.rows[0] as unknown as User) || null;
  },

  async getAll() {
    const res = await client.execute(`SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`);
    return res.rows as unknown as User[];
  },

  async updateRole(id: string, role: string) {
    return await client.execute({
      sql: `UPDATE users SET role = ? WHERE id = ?`,
      args: [role, id]
    });
  },

  async getById(id: string) {
    const res = await client.execute({
      sql: `SELECT id, username, email, role, avatar_url, bio, tiktok, snapchat, instagram, facebook, created_at FROM users WHERE id = ?`,
      args: [id]
    });
    return (res.rows[0] as unknown as User) || null;
  },

  async getByUsername(username: string) {
    const res = await client.execute({
      sql: `SELECT id, username, email, role, avatar_url, bio, tiktok, snapchat, instagram, facebook, created_at FROM users WHERE username = ?`,
      args: [username]
    });
    return (res.rows[0] as unknown as User) || null;
  },

  async updateProfile(username: string, email: string, avatar_url: string | undefined, bio: string | undefined, tiktok: string | undefined, snapchat: string | undefined, instagram: string | undefined, facebook: string | undefined, id: string) {
    return await client.execute({
      sql: `UPDATE users SET username = ?, email = ?, avatar_url = ?, bio = ?, tiktok = ?, snapchat = ?, instagram = ?, facebook = ? WHERE id = ?`,
      args: [username, email, avatar_url, bio, tiktok, snapchat, instagram, facebook, id]
    });
  },

  async updatePassword(password_hash: string, id: string) {
    return await client.execute({
      sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
      args: [password_hash, id]
    });
  },

  async count() {
    const res = await client.execute(`SELECT COUNT(*) as count FROM users`);
    return (res.rows[0] as unknown as { count: number }).count;
  },

  async getAllPublishers() {
    const res = await client.execute(`SELECT id, username, email, role, avatar_url, created_at FROM users WHERE role = 'publisher' ORDER BY created_at DESC`);
    return res.rows as unknown as User[];
  },
};

export const commentsDb = {
  async insert(id: string, video_id: string, user_id: string, content: string, parent_id: string | null) {
    return await client.execute({
      sql: `INSERT INTO comments (id, video_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)`,
      args: [id, video_id, user_id, content, parent_id]
    });
  },
  async getByVideoId(video_id: string) {
    const res = await client.execute({
      sql: `SELECT c.*, u.username, u.avatar_url 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.video_id = ? ORDER BY c.created_at ASC`,
      args: [video_id]
    });
    return res.rows as unknown as Comment[];
  },
  async getById(id: string) {
    const res = await client.execute({
      sql: `SELECT c.*, u.username, u.avatar_url 
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?`,
      args: [id]
    });
    return (res.rows[0] as unknown as Comment) || null;
  }
};

export const likesDb = {
  async toggle(video_id: string, user_id: string) {
    const tx = await client.transaction("write");
    try {
      const exists = await tx.execute({
        sql: `SELECT count(*) as count FROM likes WHERE video_id = ? AND user_id = ?`,
        args: [video_id, user_id]
      });
      const count = (exists.rows[0] as unknown as { count: number }).count;
      
      if (count > 0) {
        await tx.execute({
          sql: `DELETE FROM likes WHERE video_id = ? AND user_id = ?`,
          args: [video_id, user_id]
        });
        await tx.commit();
        return false;
      } else {
        await tx.execute({
          sql: `INSERT INTO likes (video_id, user_id) VALUES (?, ?)`,
          args: [video_id, user_id]
        });
        await tx.commit();
        return true;
      }
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
  async count(video_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM likes WHERE video_id = ?`,
      args: [video_id]
    });
    return (res.rows[0] as unknown as { count: number }).count;
  },
  async hasLiked(video_id: string, user_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM likes WHERE video_id = ? AND user_id = ?`,
      args: [video_id, user_id]
    });
    return (res.rows[0] as unknown as { count: number }).count > 0;
  }
};

export const playlistsDb = {
  async create(id: string, user_id: string, name: string) {
    return await client.execute({
      sql: `INSERT INTO playlists (id, user_id, name) VALUES (?, ?, ?)`,
      args: [id, user_id, name]
    });
  },
  async getByUserId(user_id: string) {
    const res = await client.execute({
      sql: `SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC`,
      args: [user_id]
    });
    return res.rows as unknown as Playlist[];
  },
  async addVideo(playlist_id: string, video_id: string) {
    return await client.execute({
      sql: `INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id) VALUES (?, ?)`,
      args: [playlist_id, video_id]
    });
  },
  async removeVideo(playlist_id: string, video_id: string) {
    return await client.execute({
      sql: `DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`,
      args: [playlist_id, video_id]
    });
  },
  async getVideos(playlist_id: string) {
    const res = await client.execute({
      sql: `SELECT v.* FROM videos v 
            JOIN playlist_videos pv ON v.id = pv.video_id 
            WHERE pv.playlist_id = ? ORDER BY pv.added_at DESC`,
      args: [playlist_id]
    });
    return res.rows as unknown as Video[];
  },
  async delete(id: string, user_id: string) {
    return await client.execute({
      sql: `DELETE FROM playlists WHERE id = ? AND user_id = ?`,
      args: [id, user_id]
    });
  }
};

export const historyDb = {
  async add(user_id: string, video_id: string) {
    return await client.execute({
      sql: `INSERT OR REPLACE INTO history (user_id, video_id, watched_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      args: [user_id, video_id]
    });
  },
  async getByUserId(user_id: string) {
    const res = await client.execute({
      sql: `SELECT v.*, h.watched_at FROM videos v 
            JOIN history h ON v.id = h.video_id 
            WHERE h.user_id = ? ORDER BY h.watched_at DESC LIMIT 50`,
      args: [user_id]
    });
    return res.rows as unknown as Video[];
  }
};

export const watchLaterDb = {
  async toggle(user_id: string, video_id: string) {
    const tx = await client.transaction("write");
    try {
      const exists = await tx.execute({
        sql: `SELECT count(*) as count FROM watch_later WHERE user_id = ? AND video_id = ?`,
        args: [user_id, video_id]
      });
      const count = (exists.rows[0] as unknown as { count: number }).count;
      
      if (count > 0) {
        await tx.execute({
          sql: `DELETE FROM watch_later WHERE user_id = ? AND video_id = ?`,
          args: [user_id, video_id]
        });
        await tx.commit();
        return false;
      } else {
        await tx.execute({
          sql: `INSERT INTO watch_later (user_id, video_id) VALUES (?, ?)`,
          args: [user_id, video_id]
        });
        await tx.commit();
        return true;
      }
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
  async getByUserId(user_id: string) {
    const res = await client.execute({
      sql: `SELECT v.*, w.added_at FROM videos v 
            JOIN watch_later w ON v.id = w.video_id 
            WHERE w.user_id = ? ORDER BY w.added_at DESC`,
      args: [user_id]
    });
    return res.rows as unknown as Video[];
  },
  async isInWatchLater(user_id: string, video_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM watch_later WHERE user_id = ? AND video_id = ?`,
      args: [user_id, video_id]
    });
    return (res.rows[0] as unknown as { count: number }).count > 0;
  }
};

export const analyticsDb = {
  async getStats() {
    const res = await client.execute(`
      SELECT 
        COALESCE(SUM(views), 0) as total_views, 
        COUNT(id) as total_videos, 
        COALESCE(SUM(size), 0) as total_size 
      FROM videos
    `);
    return res.rows[0] as unknown as { total_views: number, total_videos: number, total_size: number };
  },
  async getTopVideos() {
    const res = await client.execute(`SELECT * FROM videos ORDER BY views DESC LIMIT 5`);
    return res.rows as unknown as Video[];
  }
};

export const subscriptionsDb = {
  async toggle(subscriber_id: string, publisher_id: string) {
    const tx = await client.transaction("write");
    try {
      const exists = await tx.execute({
        sql: `SELECT count(*) as count FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`,
        args: [subscriber_id, publisher_id]
      });
      const count = (exists.rows[0] as unknown as { count: number }).count;
      
      if (count > 0) {
        await tx.execute({
          sql: `DELETE FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`,
          args: [subscriber_id, publisher_id]
        });
        await tx.commit();
        return false;
      } else {
        await tx.execute({
          sql: `INSERT INTO subscriptions (subscriber_id, publisher_id) VALUES (?, ?)`,
          args: [subscriber_id, publisher_id]
        });
        await tx.commit();
        return true;
      }
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
  async countSubscribers(publisher_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM subscriptions WHERE publisher_id = ?`,
      args: [publisher_id]
    });
    return (res.rows[0] as unknown as { count: number }).count;
  },
  async isSubscribed(subscriber_id: string, publisher_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`,
      args: [subscriber_id, publisher_id]
    });
    return (res.rows[0] as unknown as { count: number }).count > 0;
  },
  async getSubscribedPublisherIds(subscriber_id: string) {
    const res = await client.execute({
      sql: `SELECT publisher_id FROM subscriptions WHERE subscriber_id = ?`,
      args: [subscriber_id]
    });
    return res.rows as unknown as { publisher_id: string }[];
  }
};

export const notificationsDb = {
  async create(id: string, user_id: string, message: string, link: string | null) {
    return await client.execute({
      sql: `INSERT INTO notifications (id, user_id, message, link) VALUES (?, ?, ?, ?)`,
      args: [id, user_id, message, link]
    });
  },
  async getUnreadCount(user_id: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      args: [user_id]
    });
    return (res.rows[0] as unknown as { count: number }).count;
  },
  async getByUserId(user_id: string) {
    const res = await client.execute({
      sql: `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      args: [user_id]
    });
    return res.rows as unknown as Notification[];
  },
  async markAsRead(user_id: string) {
    return await client.execute({
      sql: `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      args: [user_id]
    });
  }
};

export const vipDb = {
  async request(id: string, user_id: string, publisher_id: string) {
    return await client.execute({
      sql: `INSERT INTO vip_requests (id, user_id, publisher_id) VALUES (?, ?, ?)
            ON CONFLICT(user_id, publisher_id) DO UPDATE SET status = 'pending', created_at = CURRENT_TIMESTAMP`,
      args: [id, user_id, publisher_id]
    });
  },
  
  async updateStatus(id: string, status: string) {
    return await client.execute({
      sql: `UPDATE vip_requests SET status = ? WHERE id = ?`,
      args: [status, id]
    });
  },
  
  async getById(id: string) {
    const res = await client.execute({
      sql: `SELECT * FROM vip_requests WHERE id = ?`,
      args: [id]
    });
    return res.rows[0] || null;
  },
  
  async getRequestsForPublisher(publisherId: string) {
    const res = await client.execute({
      sql: `SELECT r.*, u.username, u.avatar_url 
            FROM vip_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.publisher_id = ? AND r.status = 'pending'
            ORDER BY r.created_at DESC`,
      args: [publisherId]
    });
    return res.rows;
  },
  
  async getAcceptedVipsForPublisher(publisherId: string) {
    const res = await client.execute({
      sql: `SELECT r.*, u.username, u.avatar_url 
            FROM vip_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.publisher_id = ? AND r.status = 'accepted'
            ORDER BY r.created_at DESC`,
      args: [publisherId]
    });
    return res.rows;
  },
  
  async isVip(userId: string, publisherId: string) {
    const res = await client.execute({
      sql: `SELECT COUNT(*) as count FROM vip_requests 
            WHERE user_id = ? AND publisher_id = ? AND status = 'accepted'
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
      args: [userId, publisherId]
    });
    return (res.rows[0] as unknown as { count: number }).count > 0;
  },
  
  async getRequestStatus(userId: string, publisherId: string) {
    const res = await client.execute({
      sql: `SELECT status FROM vip_requests WHERE user_id = ? AND publisher_id = ?`,
      args: [userId, publisherId]
    });
    return (res.rows[0] as unknown as { status: string })?.status || null;
  },

  async getVipSubscribers(publisherId: string) {
    const res = await client.execute({
      sql: `SELECT r.*, u.username, u.avatar_url, u.email 
            FROM vip_requests r
            JOIN users u ON r.user_id = u.id
            WHERE r.publisher_id = ? AND r.status = 'accepted'
            ORDER BY r.created_at DESC`,
      args: [publisherId]
    });
    return res.rows;
  },

  async updateExpiry(expiresAt: string | null, id: string) {
    return await client.execute({
      sql: `UPDATE vip_requests SET expires_at = ? WHERE id = ?`,
      args: [expiresAt, id]
    });
  },

  async getAllGlobal() {
    const res = await client.execute(`
      SELECT r.*, u.username as subscriber_name, p.username as publisher_name, u.avatar_url, u.email as subscriber_email
      FROM vip_requests r
      JOIN users u ON r.user_id = u.id
      JOIN users p ON r.publisher_id = p.id
      WHERE r.status = 'accepted'
      ORDER BY r.created_at DESC
    `);
    return res.rows;
  },

  async grantAccess(id: string, user_id: string, publisher_id: string, expires_at: string | null) {
    return await client.execute({
      sql: `INSERT INTO vip_requests (id, user_id, publisher_id, expires_at, status)
            VALUES (?, ?, ?, ?, 'accepted')
            ON CONFLICT(user_id, publisher_id) DO UPDATE SET 
              status = 'accepted', 
              expires_at = EXCLUDED.expires_at,
              created_at = CURRENT_TIMESTAMP`,
      args: [id, user_id, publisher_id, expires_at]
    });
  },

  async getAllPendingGlobal() {
    const res = await client.execute(`
      SELECT r.*, u.username as subscriber_name, p.username as publisher_name, u.avatar_url, u.email as subscriber_email
      FROM vip_requests r
      JOIN users u ON r.user_id = u.id
      JOIN users p ON r.publisher_id = p.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);
    return res.rows;
  },
};

export const roleRequestsDb = {
  async create(id: string, user_id: string, requested_role: string) {
    return await client.execute({
      sql: `INSERT INTO role_requests (id, user_id, requested_role) VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET status = 'pending', created_at = CURRENT_TIMESTAMP`,
      args: [id, user_id, requested_role]
    });
  },
  
  async updateStatus(id: string, status: string) {
    return await client.execute({
      sql: `UPDATE role_requests SET status = ? WHERE id = ?`,
      args: [status, id]
    });
  },
  
  async getAll() {
    const res = await client.execute(`
      SELECT r.*, u.username, u.email, u.avatar_url 
      FROM role_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);
    return res.rows;
  },

  async getByUserId(userId: string) {
    const res = await client.execute({
      sql: `SELECT * FROM role_requests WHERE user_id = ?`,
      args: [userId]
    });
    return res.rows[0] || null;
  },

  async getById(id: string) {
    const res = await client.execute({
      sql: `SELECT * FROM role_requests WHERE id = ?`,
      args: [id]
    });
    return res.rows[0] || null;
  }
};

export default client;
