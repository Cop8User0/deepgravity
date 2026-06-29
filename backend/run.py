# ============================================================
# DEEPGRAVITY – backend/run.py
# Application Entry Point – Starts Flask + SocketIO Server
# ============================================================

import sys
import os

# Add the project root to Python path so imports work correctly
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Import the Flask app factory
from backend.app.main import create_app

# Create the app and socketio instances
app, socketio = create_app()

# ============================================================
# START SERVER
# ============================================================
if __name__ == '__main__':
    print("=" * 60)
    print("  DEEPGRAVITY Backend Server")
    print("  Running on: http://localhost:5000")
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    
    # Run the server
    socketio.run(
        app,
        debug=True,           # Enable debug mode (auto-reload on changes)
        host='0.0.0.0',      # Listen on all network interfaces
        port=5000,            # Default port
        allow_unsafe_werkzeug=True  # Required for debug mode in newer Flask
    )