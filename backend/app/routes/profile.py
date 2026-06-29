from flask import Blueprint, request, jsonify, g
from backend.app.models.user import User
from backend.app.middleware.auth_middleware import token_required

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_profile(user_id):
    user = User.get_by_id(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404
        
    return jsonify({
        'success': True,
        'data': {
            'id': user['id'],
            'display_name': user['display_name'],
            'avatar': user['avatar'],
            'bio': user['bio'],
            'is_online': user['is_online'],
            'last_seen': user['last_seen']
        }
    }), 200

@profile_bp.route('', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    display_name = data.get('display_name')
    bio = data.get('bio', '')
    
    if not display_name or len(display_name.strip()) < 2:
        return jsonify({'success': False, 'message': 'Display name must be at least 2 characters.'}), 400
        
    User.update_profile(g.current_user['id'], display_name.strip(), bio)
    return jsonify({'success': True, 'message': 'Profile updated successfully.'}), 200





