const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('data/videos.db');

try {
    const isReels = false;
    const session = null;

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
    const params = [
      isReels ? 1 : 0,
      session?.role || 'viewer',
      session?.id || 'null', 
      session?.id || 'null', 
      session?.id || 'null'
    ];

    sql += ` ORDER BY v.created_at DESC`;

    console.log('SQL:', sql);
    console.log('Params:', params);

    const videos = db.prepare(sql).all(...params);
    console.log('Success! Found videos:', videos.length);
} catch (error) {
    console.error('FAILED TO EXECUTE QUERY:');
    console.error(error);
    process.exit(1);
}
