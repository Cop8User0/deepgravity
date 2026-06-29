import time
from flask import request, jsonify

class RateLimiter:
    def __init__(self, app=None, limit=60, period=60):
        self.limit = limit
        self.period = period
        self.requests = {}
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        @app.before_request
        def limit_requests():
            # Exclude static assets or options requests if needed, but for API it's critical
            if request.method == 'OPTIONS':
                return
                
            ip = request.headers.get('X-Forwarded-For', request.remote_addr)
            now = time.time()
            
            # Initialize or filter times
            if ip not in self.requests:
                self.requests[ip] = []
                
            # Filter out timestamps older than the period
            self.requests[ip] = [t for t in self.requests[ip] if now - t < self.period]
            
            if len(self.requests[ip]) >= self.limit:
                return jsonify({
                    'success': False, 
                    'message': 'Too many requests. Please slow down.'
                }), 429
                
            self.requests[ip].append(now)
            
        # Add headers to inform client of rate limits if needed (optional)





