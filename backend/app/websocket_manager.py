# ============================================================
# DEEPGRAVITY â€“ backend/app/websocket_manager.py
# WebSocket Manager â€“ Handles real-time events via Socket.IO
# ============================================================

from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request

# This will be initialized in main.py
socketio = None


def init_socketio(app):
    """
    Initialize Socket.IO with the Flask app.
    
    Args:
        app: Flask application instance
    
    Returns:
        SocketIO instance
    """
    global socketio
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
    
    # ============================================================
    # CONNECTION EVENTS
    # ============================================================
    
    @socketio.on('connect')
    def handle_connect():
        """Client connected."""
        print(f"[WebSocket] Client connected: {request.sid}")
        emit('connected', {'message': 'Connected to DEEPGRAVITY'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Client disconnected."""
        print(f"[WebSocket] Client disconnected: {request.sid}")
    
    # ============================================================
    # CHAT ROOM EVENTS
    # ============================================================
    
    @socketio.on('join_chat_room')
    def handle_join_chat_room(data):
        """
        Join a chat room.
        Expected data: { 'room_id': int, 'user_id': int, 'username': str }
        """
        room_id = data.get('room_id')
        username = data.get('username', 'Anonymous')
        
        if room_id:
            room_name = f'room_{room_id}'
            join_room(room_name)
            
            # Notify everyone in the room
            emit('user_joined', {
                'room_id': room_id,
                'username': username,
                'message': f'{username} joined the room.'
            }, room=room_name)
            
            print(f"[WebSocket] {username} joined room {room_id}")
    
    @socketio.on('leave_chat_room')
    def handle_leave_chat_room(data):
        """
        Leave a chat room.
        Expected data: { 'room_id': int, 'username': str }
        """
        room_id = data.get('room_id')
        username = data.get('username', 'Anonymous')
        
        if room_id:
            room_name = f'room_{room_id}'
            leave_room(room_name)
            
            # Notify remaining members
            emit('user_left', {
                'room_id': room_id,
                'username': username,
                'message': f'{username} left the room.'
            }, room=room_name)
            
            print(f"[WebSocket] {username} left room {room_id}")
    
    @socketio.on('send_room_message')
    def handle_room_message(data):
        """
        Send a message to a chat room.
        Expected data: { 'room_id': int, 'user_id': int, 'username': str, 'content': str }
        """
        room_id = data.get('room_id')
        username = data.get('username', 'Anonymous')
        content = data.get('content', '')
        
        if room_id and content:
            room_name = f'room_{room_id}'
            
            # Save message to database (optional)
            # from backend.app.models.chat import ChatMessage
            # ChatMessage.create(room_id, user_id, content)
            
            # Broadcast to all users in the room
            emit('room_message', {
                'room_id': room_id,
                'username': username,
                'content': content,
                'timestamp': __import__('datetime').datetime.now().isoformat()
            }, room=room_name)
            
            print(f"[WebSocket] Message in room {room_id} from {username}: {content[:50]}")
    
    # ============================================================
    # PRIVATE MESSAGE EVENTS
    # ============================================================
    
    @socketio.on('send_private_message')
    def handle_private_message(data):
        """
        Send a private message to another user.
        Expected data: { 'sender_id': int, 'receiver_id': int, 'content': str }
        """
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        content = data.get('content', '')
        
        if sender_id and receiver_id and content:
            # Save to database (optional)
            # from backend.app.models.message import Message
            # Message.create(sender_id, receiver_id, content)
            
            # Send to receiver's personal room
            receiver_room = f'user_{receiver_id}'
            emit('private_message', {
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content,
                'timestamp': __import__('datetime').datetime.now().isoformat()
            }, room=receiver_room)
            
            # Also send back to sender for confirmation
            sender_room = f'user_{sender_id}'
            emit('private_message', {
                'sender_id': sender_id,
                'receiver_id': receiver_id,
                'content': content,
                'timestamp': __import__('datetime').datetime.now().isoformat()
            }, room=sender_room)
            
            print(f"[WebSocket] Private message from {sender_id} to {receiver_id}")
    
    # ============================================================
    # USER STATUS EVENTS
    # ============================================================
    
    @socketio.on('user_online')
    def handle_user_online(data):
        """
        Mark user as online.
        Expected data: { 'user_id': int }
        """
        user_id = data.get('user_id')
        if user_id:
            # Broadcast to all that user is online
            emit('user_status', {
                'user_id': user_id,
                'status': 'online'
            }, broadcast=True)
            print(f"[WebSocket] User {user_id} is online")
    
    @socketio.on('user_offline')
    def handle_user_offline(data):
        """
        Mark user as offline.
        Expected data: { 'user_id': int }
        """
        user_id = data.get('user_id')
        if user_id:
            emit('user_status', {
                'user_id': user_id,
                'status': 'offline'
            }, broadcast=True)
            print(f"[WebSocket] User {user_id} is offline")
    
    # ============================================================
    # TYPING INDICATOR
    # ============================================================
    
    @socketio.on('typing')
    def handle_typing(data):
        """
        Typing indicator for chat rooms.
        Expected data: { 'room_id': int, 'username': str }
        """
        room_id = data.get('room_id')
        username = data.get('username', 'Anonymous')
        
        if room_id:
            room_name = f'room_{room_id}'
            emit('user_typing', {
                'room_id': room_id,
                'username': username
            }, room=room_name, include_self=False)
    
    @socketio.on('stop_typing')
    def handle_stop_typing(data):
        """
        Stop typing indicator.
        Expected data: { 'room_id': int, 'username': str }
        """
        room_id = data.get('room_id')
        username = data.get('username', 'Anonymous')
        
        if room_id:
            room_name = f'room_{room_id}'
            emit('user_stop_typing', {
                'room_id': room_id,
                'username': username
            }, room=room_name, include_self=False)
    
    return socketio


def get_socketio():
    """
    Get the current SocketIO instance.
    
    Returns:
        SocketIO instance or None
    """
    global socketio
    return socketio
    




