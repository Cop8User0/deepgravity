# ============================================================
# DEEPGRAVITY â€“ backend/app/database.py
# Database Connection & Helper Functions
# ============================================================

import sqlite3
import os
from flask import g


# ============================================================
# DATABASE PATH
# ============================================================

def get_db_path():
    """Get the absolute path to the SQLite database file."""
    # This file is in: DEEPGRAVITY/backend/app/
    # Go up 3 levels to get project root
    current_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/app
    backend_dir = os.path.dirname(current_dir)                  # .../backend
    base_dir = os.path.dirname(backend_dir)                     # .../DEEPGRAVITY
    db_path = os.path.join(base_dir, 'database', 'deepgravity.db')
    return db_path


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_db():
    """
    Get a database connection.
    Uses Flask's 'g' object to reuse connection within same request.
    """
    if 'db' not in g:
        db_path = get_db_path()
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row  # Return rows as dictionaries
        g.db.execute("PRAGMA foreign_keys = ON")  # Enable foreign keys
    return g.db


def close_db(error=None):
    """
    Close the database connection at the end of a request.
    Called automatically by Flask's teardown_appcontext.
    """
    db = g.pop('db', None)
    if db is not None:
        db.close()


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def init_db():
    """
    Initialize the database by running the schema migration.
    Creates all tables if they don't exist.
    """
    db_path = get_db_path()
    
    # Ensure database directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # ============================================================
    # CREATE TABLES
    # ============================================================
    
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
    # SEED DEFAULT DATA
    # ============================================================
    
    import hashlib
    
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    # Check if users table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Seed admin users only if table is empty
        cursor.execute(
            "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ('gravity888', hash_password('888dhssbk'), '888888', 'Root Gravity Admin', '/uploads/profiles/admin.png', 'System Administrator of DEEPGRAVITY.', 1)
        )
        
        cursor.execute(
            "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)",
            ('security8', hash_password('lukaguntaishvili8'), '999999', 'Security Administrator', '/uploads/profiles/security.png', 'Chief Security Officer of DEEPGRAVITY.', 1)
        )
        
        cursor.execute(
            "INSERT OR IGNORE INTO users (username, password_hash, passkey, display_name, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)",
            ('operator', hash_password('operator'), '123456', 'Operator', '/uploads/profiles/default.png', 'Deepcore operator.')
        )
        
        # Create default chat room
        cursor.execute(
            "INSERT OR IGNORE INTO chat_rooms (name, created_by, is_private) VALUES (?, ?, ?)",
            ('General Chat', 1, 0)
        )
    
    # Commit and close
    conn.commit()
    conn.close()
    
    print("[DATABASE] Database initialized successfully!")


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def query_db(query, args=(), one=False):
    """
    Execute a query and return results.
    Usage:
        query_db("SELECT * FROM users WHERE id = ?", [user_id], one=True)
        query_db("SELECT * FROM users")
    """
    conn = get_db()
    cursor = conn.execute(query, args)
    rows = cursor.fetchall()
    cursor.close()
    
    if rows:
        if one:
            return dict(rows[0])
        return [dict(row) for row in rows]
    return None if one else []


def insert_db(query, args=()):
    """
    Execute an INSERT/UPDATE/DELETE query.
    Returns the last inserted row ID.
    """
    conn = get_db()
    cursor = conn.execute(query, args)
    conn.commit()
    last_id = cursor.lastrowid
    cursor.close()
    return last_id


def init_app(app):
    """
    Register database functions with the Flask app.
    Called when creating the Flask application.
    """
    # Register teardown function to close DB connection
    app.teardown_appcontext(close_db)
    
    # Initialize database tables
    with app.app_context():
        init_db()




