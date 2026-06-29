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
    username TEXT UNIQUE NOT NULL,           -- Login username (e.g., 'gravity888')
    password_hash TEXT NOT NULL,             -- bcrypt hashed password (never plain text!)
    passkey TEXT NOT NULL,                   -- 6-digit recovery passkey
    display_name TEXT NOT NULL,              -- Public display name (e.g., 'Root Gravity Admin')
    avatar TEXT DEFAULT 'default.png',       -- Profile picture filename or data URL
    bio TEXT DEFAULT '',                     -- Short user biography
    is_admin INTEGER DEFAULT 0,             -- 1 = admin, 0 = regular user
    is_online INTEGER DEFAULT 0,            -- 1 = currently online, 0 = offline
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Last activity timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Account creation date
);

-- Index for faster username lookups during login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- 2. POSTS TABLE
-- Anonymous posts – author stored for moderation but hidden
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,               -- Author ID (hidden from public, used for moderation)
    content TEXT,                            -- Post text content
    image_path TEXT,                         -- Optional attached image URL/path
    video_path TEXT,                         -- Optional attached video URL/path
    is_deleted INTEGER DEFAULT 0,           -- Soft delete flag (0 = active, 1 = deleted)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- ============================================================
-- 3. PRIVATE MESSAGES TABLE
-- End-to-end encrypted private conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,             -- Who sent the message
    receiver_id INTEGER NOT NULL,           -- Who receives the message
    content TEXT NOT NULL,                   -- Message content (encrypted)
    image_path TEXT,                         -- Optional attached image
    is_read INTEGER DEFAULT 0,              -- 0 = unread, 1 = read
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- ============================================================
-- 4. CHAT ROOMS TABLE
-- Group chat rooms (public or private)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                      -- Room name (e.g., 'General Chat')
    created_by INTEGER NOT NULL,            -- Creator's user ID
    is_private INTEGER DEFAULT 0,           -- 0 = public, 1 = private (invite only)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. CHAT MEMBERS TABLE
-- Tracks which users are in which rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,               -- Which room
    user_id INTEGER NOT NULL,               -- Which user
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)                -- A user can't join the same room twice
);

CREATE INDEX IF NOT EXISTS idx_chat_members_room ON chat_members(room_id);

-- ============================================================
-- 6. CHAT MESSAGES TABLE
-- Messages sent in group chat rooms
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,               -- Which room
    user_id INTEGER NOT NULL,               -- Who sent it
    content TEXT NOT NULL,                   -- Message content
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);

-- ============================================================
-- 7. FRIENDSHIPS TABLE
-- Manages friend relationships between users
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,               -- Who initiated the request
    friend_id INTEGER NOT NULL,             -- Who receives the request
    status TEXT DEFAULT 'pending',           -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, friend_id)              -- Can't send duplicate requests
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- ============================================================
-- 8. NOTIFICATIONS TABLE
-- System notifications for users
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,               -- Who receives the notification
    type TEXT NOT NULL,                      -- 'friend_request', 'friend_accept', 'new_message', 'admin_alert'
    content TEXT NOT NULL,                   -- Notification message
    reference_id INTEGER,                   -- Optional reference to related item (post ID, user ID, etc.)
    is_read INTEGER DEFAULT 0,             -- 0 = unread, 1 = read
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================
-- 9. SESSIONS TABLE (Optional – for token management)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,             -- JWT or session token
    expires_at TIMESTAMP NOT NULL,          -- When the session expires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 10. DEFAULT DATA – Admin Seeding
-- ============================================================
-- Admin user: gravity888 / 888dhssbk
-- Password hash below is a bcrypt placeholder – replace with real hash
INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online)
VALUES (
    'gravity888',
    '$2b$12$R.Sj9B/Kk98vS/Gv1.68qexfN6q2r9H/r9yLDe/250VdC7e2.4V9u',  -- bcrypt hash of '888dhssbk'
    '888888',
    'Root Gravity Admin',
    '/uploads/profiles/admin.png',
    'System Administrator of DEEPGRAVITY. The gravity holds everything together.',
    1,
    0
);

-- Default operator user: operator / operator
INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online)
VALUES (
    'operator',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',  -- bcrypt hash of 'operator'
    '123456',
    'Operator',
    '/uploads/profiles/default.png',
    'Deepcore operator. Trading and encryption enthusiast.',
    0,
    0
);

-- Default chat room
INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private)
VALUES ('General Chat', 1, 0);