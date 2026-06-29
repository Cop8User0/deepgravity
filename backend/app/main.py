# ============================================================
# DEEPGRAVITY â€“ backend/app/main.py
# Flask Application Factory â€“ Creates and configures the app
# ============================================================

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
import os

# Import database
from backend.app.database import init_db, close_db

# Import routes
from backend.app.routes import register_blueprints


def create_app():
    """
    Application factory â€“ creates and configures the Flask app.
    Returns: (app, socketio)
    """
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object('backend.app.config.DevelopmentConfig')
    
    # Secret key for sessions
    app.secret_key = os.environ.get('SECRET_KEY', 'deepgravity-secret-key-change-in-production')
    
    # ============================================================
    # CORS SETUP
    # ============================================================
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "null"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # ============================================================
    # SOCKET.IO SETUP
    # ============================================================
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
    
    # ============================================================
    # DATABASE SETUP
    # ============================================================
    init_db()
    app.teardown_appcontext(close_db)
    
    # ============================================================
    # REGISTER API BLUEPRINTS
    # ============================================================
    register_blueprints(app)
    
    # ============================================================
    # BASIC ROUTES
    # ============================================================
    
    @app.route('/')
    def index():
        """Root endpoint â€“ API status check."""
        return jsonify({
            "success": True,
            "message": "DEEPGRAVITY API is running.",
            "version": "1.0.0"
        })
    
    @app.route('/api/health')
    def health_check():
        """Health check endpoint."""
        return jsonify({
            "status": "online",
            "version": "1.0.0",
            "database": "connected"
        })
    
    # ============================================================
    # ERROR HANDLERS
    # ============================================================
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Endpoint not found."}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"success": False, "message": "Internal server error."}), 500
    
    # ============================================================
    # SOCKET.IO EVENTS
    # ============================================================
    
    @socketio.on('connect')
    def handle_connect():
        print("[Socket] Client connected")
    
    @socketio.on('disconnect')
    def handle_disconnect():
        print("[Socket] Client disconnected")
    
    @socketio.on('join_chat_room')
    def handle_join_room(data):
        room_id = data.get('room_id')
        if room_id:
            from flask_socketio import join_room
            join_room(room_id)
            print(f"[Socket] User joined room: {room_id}")
    
    @socketio.on('leave_chat_room')
    def handle_leave_room(data):
        room_id = data.get('room_id')
        if room_id:
            from flask_socketio import leave_room
            leave_room(room_id)
            print(f"[Socket] User left room: {room_id}")
    
    @socketio.on('send_room_message')
    def handle_room_message(data):
        room_id = data.get('room_id')
        user_id = data.get('user_id')
        content = data.get('content')
        if room_id and content:
            from flask_socketio import emit
            emit('room_message', {
                'room_id': room_id,
                'user_id': user_id,
                'content': content
            }, room=room_id)
    
    @socketio.on('send_private_message')
    def handle_private_message(data):
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content')
        if sender_id and receiver_id and content:
            from flask_socketio import emit
            emit('private_message', {
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content
            }, room=str(receiver_id))
    
    return app, socketio




