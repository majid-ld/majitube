import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'videos.db');

// Ensure the data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    drive_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    views INTEGER DEFAULT 0,
    size INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    video_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    video_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY(video_id, user_id),
    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS playlist_videos (
    playlist_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(playlist_id, video_id),
    FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS history (
    user_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, video_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS watch_later (
    user_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, video_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    subscriber_id TEXT NOT NULL,
    publisher_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(subscriber_id, publisher_id),
    FOREIGN KEY(subscriber_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(publisher_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS vip_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    publisher_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(publisher_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, publisher_id)
  );

  CREATE TABLE IF NOT EXISTS role_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    requested_role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id)
  );
`);

// Add columns safely
try { db.exec("ALTER TABLE videos ADD COLUMN category TEXT DEFAULT 'Uncategorized'"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN bio TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN tiktok TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN snapchat TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN instagram TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE users ADD COLUMN facebook TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE videos ADD COLUMN publisher_id TEXT"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE videos ADD COLUMN visibility TEXT DEFAULT 'public'"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE vip_requests ADD COLUMN expires_at DATETIME"); } catch (e) { /* column exists */ }
try { db.exec("ALTER TABLE videos ADD COLUMN is_reel BOOLEAN DEFAULT 0"); } catch (e) { /* column exists */ }

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

export const videosDb = {
  insert: db.prepare<[string, string, string, string, string, number, string, string | null, string, number]>(`
    INSERT INTO videos (id, drive_id, title, description, thumbnail_url, size, category, publisher_id, visibility, is_reel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  getAll: db.prepare<[], Video>(`
    SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
    FROM videos v
    LEFT JOIN users u ON v.publisher_id = u.id
    WHERE v.is_reel = 0
    ORDER BY v.created_at DESC
  `),

  getAllReels: db.prepare<[], Video>(`
    SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
    FROM videos v
    LEFT JOIN users u ON v.publisher_id = u.id
    WHERE v.is_reel = 1
    ORDER BY v.created_at DESC
  `),

  getById: db.prepare<[string], Video>(`
    SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
    FROM videos v
    LEFT JOIN users u ON v.publisher_id = u.id
    WHERE v.id = ?
  `),

  incrementViews: db.prepare<[string]>(`
    UPDATE videos SET views = views + 1 WHERE id = ?
  `),

  search: db.prepare<[string], Video>(`
    SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
    FROM videos v
    LEFT JOIN users u ON v.publisher_id = u.id
    WHERE v.title LIKE ? AND v.is_reel = 0 ORDER BY v.created_at DESC
  `),

  delete: db.prepare<[string]>(`
    DELETE FROM videos WHERE id = ?
  `),

  getByPublisherId: db.prepare<[string], Video>(`
    SELECT v.*, u.username as publisher_username, u.avatar_url as publisher_avatar 
    FROM videos v
    LEFT JOIN users u ON v.publisher_id = u.id
    WHERE v.publisher_id = ?
    ORDER BY v.created_at DESC
  `),

  update: db.prepare<[string, string, string, string, string, number, string]>(`
    UPDATE videos SET title = ?, description = ?, visibility = ?, thumbnail_url = ?, category = ?, is_reel = ? WHERE id = ?
  `),
};

export const usersDb = {
  insert: db.prepare<[string, string, string, string, string]>(`
    INSERT INTO users (id, username, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `),

  getByEmail: db.prepare<[string], User>(`
    SELECT * FROM users WHERE email = ?
  `),

  getAll: db.prepare<[], User>(`
    SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC
  `),

  updateRole: db.prepare<[string, string]>(`
    UPDATE users SET role = ? WHERE id = ?
  `),

  getById: db.prepare<[string], User>(`
    SELECT id, username, email, role, avatar_url, bio, tiktok, snapchat, instagram, facebook, created_at FROM users WHERE id = ?
  `),

  getByUsername: db.prepare<[string], User>(`
    SELECT id, username, email, role, avatar_url, bio, tiktok, snapchat, instagram, facebook, created_at FROM users WHERE username = ?
  `),

  updateProfile: db.prepare<[string, string, string, string, string, string, string, string, string]>(`
    UPDATE users SET username = ?, email = ?, avatar_url = ?, bio = ?, tiktok = ?, snapchat = ?, instagram = ?, facebook = ? WHERE id = ?
  `),

  updatePassword: db.prepare<[string, string]>(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `),

  count: db.prepare<[], { count: number }>(`
    SELECT COUNT(*) as count FROM users
  `),

  getAllPublishers: db.prepare<[], User>(`
    SELECT id, username, email, role, avatar_url, created_at FROM users WHERE role = 'publisher' ORDER BY created_at DESC
  `),
};

export const commentsDb = {
  insert: db.prepare<[string, string, string, string, string | null]>(`
    INSERT INTO comments (id, video_id, user_id, content, parent_id) VALUES (?, ?, ?, ?, ?)
  `),
  getByVideoId: db.prepare<[string], Comment>(`
    SELECT c.*, u.username, u.avatar_url 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.video_id = ? ORDER BY c.created_at ASC
  `),
  getById: db.prepare<[string], Comment>(`
    SELECT c.*, u.username, u.avatar_url 
    FROM comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.id = ?
  `)
};

export const likesDb = {
  toggle: db.transaction((video_id: string, user_id: string) => {
    const exists = db.prepare<[string, string], {count: number}>(`SELECT count(*) as count FROM likes WHERE video_id = ? AND user_id = ?`).get(video_id, user_id);
    if (exists && exists.count > 0) {
      db.prepare<[string, string]>(`DELETE FROM likes WHERE video_id = ? AND user_id = ?`).run(video_id, user_id);
      return false; // unliked
    } else {
      db.prepare<[string, string]>(`INSERT INTO likes (video_id, user_id) VALUES (?, ?)`).run(video_id, user_id);
      return true; // liked
    }
  }),
  count: db.prepare<[string], {count: number}>(`SELECT COUNT(*) as count FROM likes WHERE video_id = ?`),
  hasLiked: db.prepare<[string, string], {count: number}>(`SELECT COUNT(*) as count FROM likes WHERE video_id = ? AND user_id = ?`)
};

export const playlistsDb = {
  create: db.prepare<[string, string, string]>(`INSERT INTO playlists (id, user_id, name) VALUES (?, ?, ?)`),
  getByUserId: db.prepare<[string], Playlist>(`SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC`),
  addVideo: db.prepare<[string, string]>(`INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id) VALUES (?, ?)`),
  removeVideo: db.prepare<[string, string]>(`DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?`),
  getVideos: db.prepare<[string], Video>(`
    SELECT v.* FROM videos v 
    JOIN playlist_videos pv ON v.id = pv.video_id 
    WHERE pv.playlist_id = ? ORDER BY pv.added_at DESC
  `),
  delete: db.prepare<[string, string]>(`DELETE FROM playlists WHERE id = ? AND user_id = ?`)
};

export const historyDb = {
  add: db.prepare<[string, string]>(`INSERT OR REPLACE INTO history (user_id, video_id, watched_at) VALUES (?, ?, CURRENT_TIMESTAMP)`),
  getByUserId: db.prepare<[string], Video>(`
    SELECT v.*, h.watched_at FROM videos v 
    JOIN history h ON v.id = h.video_id 
    WHERE h.user_id = ? ORDER BY h.watched_at DESC LIMIT 50
  `)
};

export const watchLaterDb = {
  toggle: db.transaction((user_id: string, video_id: string) => {
    const exists = db.prepare<[string, string], {count: number}>(`SELECT count(*) as count FROM watch_later WHERE user_id = ? AND video_id = ?`).get(user_id, video_id);
    if (exists && exists.count > 0) {
      db.prepare<[string, string]>(`DELETE FROM watch_later WHERE user_id = ? AND video_id = ?`).run(user_id, video_id);
      return false; // removed
    } else {
      db.prepare<[string, string]>(`INSERT INTO watch_later (user_id, video_id) VALUES (?, ?)`).run(user_id, video_id);
      return true; // added
    }
  }),
  getByUserId: db.prepare<[string], Video>(`
    SELECT v.*, w.added_at FROM videos v 
    JOIN watch_later w ON v.id = w.video_id 
    WHERE w.user_id = ? ORDER BY w.added_at DESC
  `),
  isInWatchLater: db.prepare<[string, string], {count: number}>(`SELECT COUNT(*) as count FROM watch_later WHERE user_id = ? AND video_id = ?`)
};

export const analyticsDb = {
  getStats: db.prepare<[], { total_views: number, total_videos: number, total_size: number }>(`
    SELECT 
      COALESCE(SUM(views), 0) as total_views, 
      COUNT(id) as total_videos, 
      COALESCE(SUM(size), 0) as total_size 
    FROM videos
  `),
  getTopVideos: db.prepare<[], Video>(`SELECT * FROM videos ORDER BY views DESC LIMIT 5`)
};

export const subscriptionsDb = {
  toggle: db.transaction((subscriber_id: string, publisher_id: string) => {
    const exists = db.prepare<[string, string], {count: number}>(`SELECT count(*) as count FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`).get(subscriber_id, publisher_id);
    if (exists && exists.count > 0) {
      db.prepare<[string, string]>(`DELETE FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`).run(subscriber_id, publisher_id);
      return false; // unsubscribed
    } else {
      db.prepare<[string, string]>(`INSERT INTO subscriptions (subscriber_id, publisher_id) VALUES (?, ?)`).run(subscriber_id, publisher_id);
      return true; // subscribed
    }
  }),
  countSubscribers: db.prepare<[string], {count: number}>(`SELECT COUNT(*) as count FROM subscriptions WHERE publisher_id = ?`),
  isSubscribed: db.prepare<[string, string], {count: number}>(`SELECT COUNT(*) as count FROM subscriptions WHERE subscriber_id = ? AND publisher_id = ?`),
  getSubscribedPublisherIds: db.prepare<[string], {publisher_id: string}>(`SELECT publisher_id FROM subscriptions WHERE subscriber_id = ?`)
};

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export const notificationsDb = {
  create: db.prepare<[string, string, string, string | null]>(`INSERT INTO notifications (id, user_id, message, link) VALUES (?, ?, ?, ?)`),
  getUnreadCount: db.prepare<[string], {count: number}>(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`),
  getByUserId: db.prepare<[string], Notification>(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`),
  markAsRead: db.prepare<[string]>(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`)
};

export const vipDb = {
  request: db.prepare<[string, string, string]>(`
    INSERT INTO vip_requests (id, user_id, publisher_id) VALUES (?, ?, ?)
    ON CONFLICT(user_id, publisher_id) DO UPDATE SET status = 'pending', created_at = CURRENT_TIMESTAMP
  `),
  
  updateStatus: db.prepare<[string, string]>(`
    UPDATE vip_requests SET status = ? WHERE id = ?
  `),
  
  getById: db.prepare<[string], any>(`
    SELECT * FROM vip_requests WHERE id = ?
  `),
  
  getRequestsForPublisher: db.prepare<[string], any>(`
    SELECT r.*, u.username, u.avatar_url 
    FROM vip_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.publisher_id = ? AND r.status = 'pending'
    ORDER BY r.created_at DESC
  `),
  
  getAcceptedVipsForPublisher: db.prepare<[string], any>(`
    SELECT r.*, u.username, u.avatar_url 
    FROM vip_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.publisher_id = ? AND r.status = 'accepted'
    ORDER BY r.created_at DESC
  `),
  
  isVip: db.prepare<[string, string], { count: number }>(`
    SELECT COUNT(*) as count FROM vip_requests 
    WHERE user_id = ? AND publisher_id = ? AND status = 'accepted'
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `),
  
  getRequestStatus: db.prepare<[string, string], { status: string }>(`
    SELECT status FROM vip_requests WHERE user_id = ? AND publisher_id = ?
  `),

  getVipSubscribers: db.prepare<[string], any>(`
    SELECT r.*, u.username, u.avatar_url, u.email 
    FROM vip_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.publisher_id = ? AND r.status = 'accepted'
    ORDER BY r.created_at DESC
  `),

  updateExpiry: db.prepare<[string | null, string]>(`
    UPDATE vip_requests SET expires_at = ? WHERE id = ?
  `),

  getAllGlobal: db.prepare<[], any>(`
    SELECT r.*, u.username as subscriber_name, p.username as publisher_name, u.avatar_url, u.email as subscriber_email
    FROM vip_requests r
    JOIN users u ON r.user_id = u.id
    JOIN users p ON r.publisher_id = p.id
    WHERE r.status = 'accepted'
    ORDER BY r.created_at DESC
  `),

  grantAccess: db.prepare<[string, string, string, string | null, string]>(`
    INSERT INTO vip_requests (id, user_id, publisher_id, expires_at, status)
    VALUES (?, ?, ?, ?, 'accepted')
    ON CONFLICT(user_id, publisher_id) DO UPDATE SET 
      status = 'accepted', 
      expires_at = EXCLUDED.expires_at,
      created_at = CURRENT_TIMESTAMP
  `),

  getAllPendingGlobal: db.prepare<[], any>(`
    SELECT r.*, u.username as subscriber_name, p.username as publisher_name, u.avatar_url, u.email as subscriber_email
    FROM vip_requests r
    JOIN users u ON r.user_id = u.id
    JOIN users p ON r.publisher_id = p.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
  `),
};

export const roleRequestsDb = {
  create: db.prepare<[string, string, string]>(`
    INSERT INTO role_requests (id, user_id, requested_role) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET status = 'pending', created_at = CURRENT_TIMESTAMP
  `),
  
  updateStatus: db.prepare<[string, string]>(`
    UPDATE role_requests SET status = ? WHERE id = ?
  `),
  
  getAll: db.prepare<[], any>(`
    SELECT r.*, u.username, u.email, u.avatar_url 
    FROM role_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
  `),

  getByUserId: db.prepare<[string], any>(`
    SELECT * FROM role_requests WHERE user_id = ?
  `),

  getById: db.prepare<[string], any>(`
    SELECT * FROM role_requests WHERE id = ?
  `)
};

export default db;
