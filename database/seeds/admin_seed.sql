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
    '$2b$12$R.Sj9B/Kk98vS/Gv1.68qexfN6q2r9H/r9yLDe/250VdC7e2.4V9u',
    '888888',
    'Root Gravity Admin',
    '/assets/images/default.png',
    'System Administrator of DEEPGRAVITY. The gravity holds everything together.',
    1,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. SECURITY ADMIN USER
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
    '$2b$12$XyZAbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIj',
    '999999',
    'Security Administrator',
    '/assets/images/default.png',
    'Chief Security Officer of DEEPGRAVITY. Responsible for platform security and user safety.',
    1,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. NELI USER (NEW - REPLACED LILE)
-- ============================================================
-- Username: neli
-- Password: neli123456
-- Passkey: 777777
-- Display Name: Neli
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
    'neli',
    '$2b$12$AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKl',
    '777777',
    'Neli',
    '/assets/images/default.png',
    'Security & privacy enthusiast. Always learning new things. Crypto and encryption advocate.',
    0,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. NELIKO8 USER (NEW)
-- ============================================================
-- Username: neliko8
-- Password: neliko123456
-- Passkey: 555555
-- Display Name: Neliko
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
    'neliko8',
    '$2b$12$QrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWx',
    '555555',
    'Neliko',
    '/assets/images/default.png',
    'Privacy advocate and encryption specialist. Passionate about security and anonymity.',
    0,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. LUKA USER (UPDATED)
-- ============================================================
-- Username: luka
-- Password: luka123456
-- Passkey: 888000
-- Display Name: Luka
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
    'luka',
    '$2b$12$MnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUv',
    '888000',
    'Luka',
    '/assets/images/default.png',
    'Crypto trader and blockchain developer. Building the future of decentralized finance.',
    0,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. DEFAULT OPERATOR USER
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
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '123456',
    'Operator',
    '/assets/images/default.png',
    'Deepcore operator. Trading and encryption enthusiast. Building the future of privacy.',
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. DEMO USERS (for testing)
-- ============================================================

-- Demo User 1 – Shadow
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'shadow_user',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '111111',
    'Shadow',
    '/assets/images/default.png',
    'Trading in the shadows. Crypto and forex enthusiast. 5 years experience.',
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
    '/assets/images/default.png',
    'Encryption is the key to freedom. Privacy advocate. Cybersecurity expert.',
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
    '/assets/images/default.png',
    'Running dark relays since 2024. Network specialist. Tor and I2P expert.',
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
    '/assets/images/default.png',
    'You never see me coming. Stealth trader. Dark web marketplace expert.',
    0,
    0,
    datetime('now', '-1 day'),
    datetime('now', '-90 days')
);

-- Demo User 5 – Neo
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'neo_node',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '555555',
    'Neo',
    '/assets/images/default.png',
    'The Matrix has you. Follow the white rabbit. AI and machine learning enthusiast.',
    0,
    1,
    CURRENT_TIMESTAMP,
    datetime('now', '-7 days')
);

-- Demo User 6 – Vortex
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'vortex_node',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '666666',
    'Vortex',
    '/assets/images/default.png',
    'Diving deep into the dark web. Information is power. Data analyst.',
    0,
    0,
    datetime('now', '-3 hours'),
    datetime('now', '-45 days')
);

-- Demo User 7 – Eclipse
INSERT OR IGNORE INTO users (
    username, password_hash, passkey, display_name, avatar, bio, is_admin, is_online, last_seen, created_at
) VALUES (
    'eclipse_node',
    '$2b$12$LJ3m4ys3GZfnYMz8kVsTDOqGkOq7qHn6mX5Wx1Yk0JpPf8rNtZVbq',
    '777000',
    'Eclipse',
    '/assets/images/default.png',
    'Darkness is my ally. Privacy is my shield. Security researcher.',
    0,
    1,
    CURRENT_TIMESTAMP,
    datetime('now', '-20 days')
);

-- ============================================================
-- 8. DEMO POSTS (MORE ENGAGING)
-- ============================================================
INSERT OR IGNORE INTO posts (user_id, content, image_path, created_at) VALUES
(2, 'Just closed a successful long on BTC/USD. Entry 67,200, exit 68,500. +$650. The breakout was clean. Analysis: Strong support at 67,000. Next target 70,000.', '', datetime('now', '-1 hour')),
(3, 'Encrypted note to self: review the Black Rock Project files before Monday. Key stored in Vault Box C2. Dont forget to backup the encryption keys.', '', datetime('now', '-3 hours')),
(4, 'Updated the SHA-256 hashing library in the cipher module. All operators should refresh their Vault keys. Performance improved by 15%.', '', datetime('now', '-5 hours')),
(2, 'Network relay is stable. All nodes green. Uptime: 99.8% this month. New routing protocol deployed.', '', datetime('now', '-8 hours')),
(5, 'New trading strategy backtested. 68% win rate over 200 trades. Sharing details soon. Based on machine learning models.', '', datetime('now', '-12 hours')),
(1, 'DEEPGRAVITY platform is now live! Welcome to all operators. Security protocols are active. Stay safe. Stay anonymous.', '', datetime('now', '-24 hours')),
(6, 'Security audit completed. All systems passed. Encryption verified. No vulnerabilities found.', '', datetime('now', '-48 hours')),
(7, 'Just discovered a new exploit in the encryption layer. Patching now. Update your clients ASAP.', '', datetime('now', '-30 minutes')),
(8, 'Trading bot is live. 24/7 automated trading with 72% success rate. Join our channel for live updates.', '', datetime('now', '-2 hours')),
(9, 'Dark web marketplace is expanding. New vendors added this week. Check the new listings.', '', datetime('now', '-4 hours')),
(10, 'Privacy is not a crime. Stay anonymous. Stay safe. Keep your identity hidden.', '', datetime('now', '-6 hours')),
(1, 'New security update rolled out. All users must update their passkeys. Visit settings to change your passkey.', '', datetime('now', '-12 hours'));

-- ============================================================
-- 9. DEMO CHAT ROOMS (ENHANCED)
-- ============================================================
INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private, created_at) VALUES
('General Chat', 1, 0, datetime('now', '-90 days')),
('Trading Signals', 2, 0, datetime('now', '-60 days')),
('Encryption Talk', 3, 0, datetime('now', '-45 days')),
('Dark Web News', 4, 0, datetime('now', '-30 days')),
('Newcomers', 1, 0, datetime('now', '-15 days')),
('Security Operations', 6, 1, datetime('now', '-10 days')),
('Crypto Traders', 7, 0, datetime('now', '-5 days')),
('Privacy Hub', 8, 0, datetime('now', '-3 days'));

-- ============================================================
-- 10. DEMO FRIENDSHIPS (ENHANCED)
-- ============================================================
INSERT OR IGNORE INTO friendships (user_id, friend_id, status, created_at) VALUES
(1, 2, 'accepted', datetime('now', '-80 days')),
(1, 3, 'accepted', datetime('now', '-75 days')),
(2, 4, 'accepted', datetime('now', '-50 days')),
(3, 5, 'accepted', datetime('now', '-40 days')),
(4, 6, 'accepted', datetime('now', '-20 days')),
(6, 1, 'accepted', datetime('now', '-5 days')),
(2, 6, 'pending', datetime('now', '-1 day')),
(7, 8, 'accepted', datetime('now', '-10 days')),
(8, 9, 'accepted', datetime('now', '-7 days')),
(9, 10, 'pending', datetime('now', '-2 days'));

-- ============================================================
-- 11. DEMO NOTIFICATIONS (ENHANCED)
-- ============================================================
INSERT OR IGNORE INTO notifications (user_id, type, content, is_read, created_at) VALUES
(1, 'system', 'Welcome to DEEPGRAVITY! Your admin account has been created. You have full control over the platform.', 0, datetime('now', '-90 days')),
(3, 'system', 'Welcome to DEEPGRAVITY! Your operator account has been created. You can now trade and chat securely.', 0, datetime('now', '-80 days')),
(2, 'friend_request', 'shadow_user has sent you a friend request. Accept or reject.', 0, datetime('now', '-10 days')),
(4, 'friend_accept', 'cipher_node accepted your friend request. You are now connected.', 0, datetime('now', '-5 days')),
(1, 'admin_alert', 'New user neli has joined the platform. Welcome neli!', 0, datetime('now', '-1 day')),
(1, 'admin_alert', 'New user neliko8 has joined the platform. Welcome neliko8!', 0, datetime('now', '-2 hours'));

-- ============================================================
-- 12. DEMO CHAT MESSAGES (ENHANCED)
-- ============================================================
INSERT OR IGNORE INTO chat_messages (room_id, user_id, content, created_at) VALUES
(1, 1, 'Welcome to General Chat! Feel free to introduce yourself. This is a safe space for all operators.', datetime('now', '-90 days')),
(1, 2, 'Thanks! Shadow here. Looking forward to connecting with everyone and sharing trading insights.', datetime('now', '-85 days')),
(1, 3, 'Cipher here. Encryption is my passion. Lets talk privacy, security and encryption tools.', datetime('now', '-80 days')),
(1, 4, 'Relay reporting in. Network is stable. All nodes operational.', datetime('now', '-75 days')),
(1, 5, 'Phantom here. I prefer to stay in the shadows. Privacy first.', datetime('now', '-70 days')),
(1, 1, 'Newcomers channel is now open for new users. Join and introduce yourself.', datetime('now', '-15 days')),
(1, 6, 'Security audit completed. All good. No vulnerabilities found.', datetime('now', '-10 days')),
(1, 7, 'Trading bot is live. Join Trading Signals channel for live updates.', datetime('now', '-5 days')),
(1, 8, 'Privacy Hub is now open. Discuss encryption and privacy tools.', datetime('now', '-3 days'));

-- ============================================================
-- 13. SYSTEM LOGS (ENHANCED)
-- ============================================================
INSERT OR IGNORE INTO system_logs (user_id, action, details, ip_address, created_at) VALUES
(1, 'database_init', 'Initial database schema created with sample data. DEEPGRAVITY platform is ready.', '127.0.0.1', datetime('now', '-90 days')),
(1, 'user_create', 'Created user: shadow_user. Role: trader', '127.0.0.1', datetime('now', '-15 days')),
(1, 'user_create', 'Created user: cipher_node. Role: encryption specialist', '127.0.0.1', datetime('now', '-30 days')),
(1, 'user_create', 'Created user: dark_relay. Role: network specialist', '127.0.0.1', datetime('now', '-60 days')),
(1, 'user_create', 'Created user: phantom_user. Role: stealth trader', '127.0.0.1', datetime('now', '-90 days')),
(1, 'user_create', 'Created user: neo_node. Role: AI researcher', '127.0.0.1', datetime('now', '-7 days')),
(6, 'security_check', 'Security audit completed. All systems passed. No vulnerabilities found.', '127.0.0.1', datetime('now', '-10 days')),
(1, 'user_create', 'Created user: neli. Role: security and privacy enthusiast', '127.0.0.1', datetime('now', '-1 day')),
(1, 'user_create', 'Created user: neliko8. Role: privacy advocate and encryption specialist', '127.0.0.1', datetime('now', '-2 hours'));

-- ============================================================
-- 14. VERIFICATION
-- ============================================================
SELECT 
    '✅ Seed Complete' as status,
    COUNT(*) as total_users,
    SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_count,
    SUM(CASE WHEN is_online = 1 THEN 1 ELSE 0 END) as online_count
FROM users;