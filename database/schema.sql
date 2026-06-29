/* ============================================================
   DEEPGRAVITY – database/schema.sql (ENHANCED)
   Complete Database Schema with Relationships & Indexes
   ============================================================ */

-- ============================================================
-- 1. USERS TABLE
-- Stores all registered users, including admin accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    passkey TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT DEFAULT '/assets/images/default.png',
    bio TEXT DEFAULT '',
    is_admin INTEGER DEFAULT 0,
    is_online INTEGER DEFAULT 0,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- 2. POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT,
    image_path TEXT,
    video_path TEXT,
    is_deleted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- ============================================================
-- 3. PRIVATE MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- ============================================================
-- 4. CHAT ROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    is_private INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. CHAT MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_id);

-- ============================================================
-- 6. CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);

-- ============================================================
-- 7. FRIENDSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- ============================================================
-- 8. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    reference_id INTEGER,
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================
-- 9. SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 10. BANNED USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS banned_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reason TEXT,
    banned_by INTEGER NOT NULL,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (banned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 11. SYSTEM LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 12. DEFAULT DATA
-- ============================================================

-- Admin user: gravity888 / 888dhssbk
INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online)
VALUES (
    'gravity888',
    '$2b$12$R.Sj9B/Kk98vS/Gv1.68qexfN6q2r9H/r9yLDe/250VdC7e2.4V9u',
    '888888',
    'Root Gravity Admin',
    '/assets/images/default.png',
    'System Administrator of DEEPGRAVITY. The gravity holds everything together.',
    1,
    0
);

-- Security Admin
INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online)
VALUES (
    'security8',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '123456',
    'Security Administrator',
    '/assets/images/default.png',
    'Security admin. Monitoring and protecting the platform.',
    1,
    0
);

-- Default operator user: operator / operator
INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online)
VALUES (
    'operator',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '123456',
    'Operator',
    '/assets/images/default.png',
    'Deepcore operator. Trading and encryption enthusiast.',
    0,
    0
);

-- Default chat rooms
INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private)
VALUES ('General Chat', 1, 0);

INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private)
VALUES ('Trading Hub', 1, 0);

INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private)
VALUES ('Encryption Lab', 1, 0);

-- Add admin to General Chat
INSERT OR IGNORE INTO chat_members (room_id, user_id)
VALUES (1, 1);

-- Add operator to General Chat
INSERT OR IGNORE INTO chat_members (room_id, user_id)
VALUES (1, 3);

-- Sample posts
INSERT OR IGNORE INTO posts (user_id, content, created_at)
VALUES (1, 'Welcome to DEEPGRAVITY! This is the most secure anonymous social platform.', datetime('now'));

INSERT OR IGNORE INTO posts (user_id, content, created_at)
VALUES (3, 'Stay encrypted. Stay anonymous. The gravity holds us together.', datetime('now'));

-- Sample notifications
INSERT OR IGNORE INTO notifications (user_id, type, content, is_read)
VALUES (3, 'admin_alert', 'Welcome to DEEPGRAVITY! Your account has been created successfully.', 0);

INSERT OR IGNORE INTO notifications (user_id, type, content, is_read)
VALUES (1, 'system', 'New user operator has joined the platform.', 0);

-- Sample system log
INSERT OR IGNORE INTO system_logs (user_id, action, details)
VALUES (1, 'database_init', 'Initial database schema created with sample data.');