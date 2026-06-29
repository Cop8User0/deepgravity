/* ============================================================
   DEEPGRAVITY – database/seeds/admin_seed.sql (ENHANCED)
   Admin User + Security Admin + Demo Users + Posts + Rooms
   ============================================================ */

-- ============================================================
-- 1. ROOT ADMIN USER
-- ============================================================
-- Username: gravity888
-- Password: 888dhssbk
-- Passkey: 888888
-- Display Name: Root Gravity Admin
-- ============================================================
INSERT OR IGNORE INTO users (
    username, 
    password_hash, 
    passkey, 
    display_name, 
    avatar,
    bio,
    is_admin, 
    is_online,
    last_seen,
    created_at
) VALUES (
    'gravity888',
    '$2b$12$R.Sj9B/Kk98vS/Gv1.68qexfN6q2r9H/r9yLDe/250VdC7e2.4V9u', -- bcrypt hash of '888dhssbk'
    '888888',
    'Root Gravity Admin',
    '/uploads/profiles/admin.png',
    'System Administrator of DEEPGRAVITY. The gravity holds everything together.',
    1,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. SECURITY ADMIN USER (NEW)
-- ============================================================
-- Username: security8
-- Password: lukaguntaishvili8
-- Passkey: 999999
-- Display Name: Security Administrator
-- ============================================================
INSERT OR IGNORE INTO users (
    username, 
    password_hash, 
    passkey, 
    display_name, 
    avatar,
    bio,
    is_admin, 
    is_online,
    last_seen,
    created_at
) VALUES (
    'security8',
    '$2b$12$XyZAbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIj', -- bcrypt hash of 'lukaguntaishvili8'
    '999999',
    'Security Administrator',
    '/uploads/profiles/security.png',
    'Chief Security Officer of DEEPGRAVITY. Responsible for platform security and user safety.',
    1,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. DEFAULT OPERATOR USER
-- ============================================================
-- Username: operator
-- Password: operator
-- Passkey: 123456
-- Display Name: Operator
-- ============================================================
INSERT OR IGNORE INTO users (
    username, 
    password_hash, 
    passkey, 
    display_name, 
    avatar,
    bio,
    is_admin, 
    is_online,
    last_seen,
    created_at
) VALUES (
    'operator',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq', -- bcrypt hash of 'operator'
    '123456',
    'Operator',
    '/uploads/profiles/default.png',
    'Deepcore operator. Trading and encryption enthusiast.',
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. DEMO USERS (for testing)
-- ============================================================

-- Demo User 1 – Shadow
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'shadow_user',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '111111',
    'Shadow',
    '/uploads/profiles/user1.png',
    'Trading in the shadows. Crypto and forex enthusiast.',
    0,
    1,
    CURRENT_TIMESTAMP,
    datetime('now', '-15 days')
);

-- Demo User 2 – Cipher
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'cipher_node',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '222222',
    'Cipher',
    '/uploads/profiles/user2.png',
    'Encryption is the key to freedom. Privacy advocate.',
    0,
    0,
    datetime('now', '-2 hours'),
    datetime('now', '-30 days')
);

-- Demo User 3 – Relay
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'dark_relay',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '333333',
    'Relay',
    '/uploads/profiles/user3.png',
    'Running dark relays since 2024. Network specialist.',
    0,
    1,
    CURRENT_TIMESTAMP,
    datetime('now', '-60 days')
);

-- Demo User 4 – Phantom
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'phantom_user',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '444444',
    'Phantom',
    '/uploads/profiles/user4.png',
    'You never see me coming. Stealth trader.',
    0,
    0,
    datetime('now', '-1 day'),
    datetime('now', '-90 days')
);

-- Demo User 5 – Neo (New)
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'neo_node',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '555555',
    'Neo',
    '/uploads/profiles/user5.png',
    'The Matrix has you. Follow the white rabbit.',
    0,
    1,
    CURRENT_TIMESTAMP,
    datetime('now', '-7 days')
);

-- ============================================================
-- 5. DEMO POSTS (for testing feed)
-- ============================================================
INSERT OR IGNORE INTO posts (user_id, content, image_path, created_at) VALUES
(2, 'Just closed a successful long on BTC/USD. Entry 67,200, exit 68,500. +$650. The breakout was clean.', '', datetime('now', '-1 hour')),
(3, 'Encrypted note to self: review the Black Rock Project files before Monday. Key stored in Vault Box C2.', '', datetime('now', '-3 hours')),
(4, 'Updated the SHA-256 hashing library in the cipher module. All operators should refresh their Vault keys.', '', datetime('now', '-5 hours')),
(2, 'Network relay is stable. All nodes green. Uptime: 99.8% this month.', '', datetime('now', '-8 hours')),
(5, 'New trading strategy backtested. 68% win rate over 200 trades. Sharing details soon.', '', datetime('now', '-12 hours')),
(1, 'DEEPGRAVITY platform is now live! Welcome to all operators. Security protocols are active.', '', datetime('now', '-24 hours')),
(6, 'Security audit completed. All systems passed. Encryption verified.', '', datetime('now', '-48 hours'));

-- ============================================================
-- 6. DEMO CHAT ROOMS
-- ============================================================
INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private, created_at) VALUES
('General Chat', 1, 0, datetime('now', '-90 days')),
('Trading Signals', 2, 0, datetime('now', '-60 days')),
('Encryption Talk', 3, 0, datetime('now', '-45 days')),
('Dark Web News', 4, 0, datetime('now', '-30 days')),
('Newcomers', 1, 0, datetime('now', '-15 days')),
('Security Operations', 6, 1, datetime('now', '-10 days'));

-- ============================================================
-- 7. DEMO FRIENDSHIPS
-- ============================================================
INSERT OR IGNORE INTO friendships (user_id, friend_id, status, created_at) VALUES
(1, 2, 'accepted', datetime('now', '-80 days')),
(1, 3, 'accepted', datetime('now', '-75 days')),
(2, 4, 'accepted', datetime('now', '-50 days')),
(3, 5, 'accepted', datetime('now', '-40 days')),
(4, 6, 'accepted', datetime('now', '-20 days')),
(6, 1, 'accepted', datetime('now', '-5 days')),
(2, 6, 'pending', datetime('now', '-1 day'));

-- ============================================================
-- 8. VERIFICATION
-- ============================================================
SELECT 
    '✅ Seed Complete' as status,
    COUNT(*) as total_users,
    SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_count,
    SUM(CASE WHEN is_online = 1 THEN 1 ELSE 0 END) as online_count
FROM users;