# ============================================================
# DEEPGRAVITY â€“ backend/app/config.py
# Application Configuration
# ============================================================

import os
from datetime import timedelta


class Config:
    """Base configuration."""
    
    # ============================================================
    # SECURITY
    # ============================================================
    SECRET_KEY = os.environ.get('SECRET_KEY', 'deepgravity-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'deepgravity-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Token expires after 24 hours
    
    # ============================================================
    # DATABASE
    # ============================================================
    # Get the project root directory
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'deepgravity.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ============================================================
    # UPLOAD SETTINGS
    # ============================================================
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Allowed file extensions
    ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov'}
    
    # ============================================================
    # CORS SETTINGS
    # ============================================================
    CORS_ORIGINS = ['http://localhost:5000', 'http://127.0.0.1:5000', 'null']
    
    # ============================================================
    # RATE LIMITING
    # ============================================================
    RATE_LIMIT_REQUESTS = 100  # Max requests per window
    RATE_LIMIT_WINDOW = 60     # Window in seconds (1 minute)
    
    # ============================================================
    # PAGINATION
    # ============================================================
    POSTS_PER_PAGE = 20
    MESSAGES_PER_PAGE = 30
    COMMENTS_PER_PAGE = 10
    
    # ============================================================
    # ADMIN SETTINGS
    # ============================================================
    ADMIN_USERNAMES = ['gravity888', 'security8']
    
    # ============================================================
    # DEBUG
    # ============================================================
    DEBUG = os.environ.get('FLASK_DEBUG', '1') == '1'


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    # In production, use environment variables for secrets
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')


# Dictionary to easily select configuration
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}




