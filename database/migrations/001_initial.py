# ============================================================
# DEEPGRAVITY – database/migrations/001_initial.py
# Initial Migration – Creates all tables + seeds admin data
# Run: python3 database/migrations/001_initial.py
# ============================================================

import sqlite3
import os
import hashlib
import sys


def get_db_path():
    """Get the database path relative to this migration file."""
    # This file is in: DEEPGRAVITY/database/migrations/
    # We need to go up to: DEEPGRAVITY/
    current_dir = os.path.dirname(os.path.abspath(__file__))  # .../migrations
    migrations_dir = os.path.dirname(current_dir)              # .../database
    base_dir = os.path.dirname(migrations_dir)                 # .../DEEPGRAVITY
    db_path = os.path.join(base_dir, 'database', 'deepgravity.db')
    return db_path


def migrate():
    """Run the initial database migration."""
    
    db_path = get_db_path()
    
    # Ensure database directory exists
    db_dir = os.path.dirname(db_path)
    os.makedirs(db_dir, exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"[MIGRATION] Connected to: {db_path}")
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # ============================================================
    # CREATE TABLES
    # ============================================================
    
    print("[MIGRATION] Creating tables...")
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            passkey TEXT NOT NULL,
            display_name TEXT NOT NULL,
            avatar TEXT DEFAULT 'default.png',
            bio TEXT DEFAULT '',
            is_admin INTEGER DEFAULT 0,
            is_online INTEGER DEFAULT 0,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT,
            image_path TEXT,
            video_path TEXT,
            is_deleted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Messages table
    cursor.execute("""
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
        )
    """)
    
    # Chat rooms table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_by INTEGER NOT NULL,
            is_private INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Chat members table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(room_id, user_id)
        )
    """)
    
    # Chat messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Friendships table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, friend_id)
        )
    """)
    
    # Notifications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            reference_id INTEGER,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # ============================================================
    # CREATE INDEXES
    # ============================================================
    
    print("[MIGRATION] Creating indexes...")
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)")
    
    # ============================================================
    # SEED ADMIN USERS
    # ============================================================
    
    print("[MIGRATION] Seeding admin users...")
    
    # Simple hash function
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    # Root Admin: gravity888 / 888dhssbk
    cursor.execute(
        "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('gravity888', hash_password('888dhssbk'), '888888', 'Root Gravity Admin', '/uploads/profiles/admin.png', 'System Administrator of DEEPGRAVITY.', 1)
    )
    
    # Security Admin: security8 / lukaguntaishvili8
    cursor.execute(
        "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('security8', hash_password('lukaguntaishvili8'), '999999', 'Security Administrator', '/uploads/profiles/security.png', 'Chief Security Officer of DEEPGRAVITY.', 1)
    )
    
    # Operator: operator / operator
    cursor.execute(
        "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)",
        ('operator', hash_password('operator'), '123456', 'Operator', '/uploads/profiles/default.png', 'Deepcore operator.')
    )
    
    # ============================================================
    # SEED DEFAULT CHAT ROOM
    # ============================================================
    
    print("[MIGRATION] Creating default chat room...")
    cursor.execute(
        "INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private) VALUES (?, ?, ?)",
        ('General Chat', 1, 0)
    )
    
    # ============================================================
    # COMMIT & CLOSE
    # ============================================================
    
    conn.commit()
    conn.close()
    
    print("[MIGRATION] Migration 001 completed successfully!")
    print("[MIGRATION] Database created at: " + db_path)


def rollback():
    """Rollback migration – deletes database file."""
    db_path = get_db_path()
    
    if os.path.exists(db_path):
        os.remove(db_path)
        print("[ROLLBACK] Database deleted: " + db_path)
    else:
        print("[ROLLBACK] No database found to delete.")


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback()
    else:
        migrate()