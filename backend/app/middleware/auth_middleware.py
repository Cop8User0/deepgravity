from functools import wraps
from flask import request, jsonify
from backend.app.utils.token_manager import verify_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '')
        token = token.replace('Bearer ', '')
        if not token:
            return jsonify({'success': False, 'message': 'Token missing'}), 401
        payload = verify_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        request.user_id = payload.get('user_id')
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    return token_required(f)

def login_required(f):
    return token_required(f)
