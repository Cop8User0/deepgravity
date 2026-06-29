from flask import Blueprint, jsonify
from backend.app.middleware.auth_middleware import admin_required
from backend.app.database import query_db
from backend.app.models.user import User
from backend.app.models.post import Post

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    # Fetch database sizes
    user_count = query_db("SELECT COUNT(*) as count FROM users", one=True)['count']
    post_count = query_db("SELECT COUNT(*) as count FROM posts", one=True)['count']
    room_count = query_db("SELECT COUNT(*) as count FROM chat_rooms", one=True)['count']
    online_count = query_db("SELECT COUNT(*) as count FROM users WHERE is_online = 1", one=True)['count']
    
    return jsonify({
        'success': True,
        'data': {
            'total_users': user_count,
            'total_posts': post_count,
            'total_rooms': room_count,
            'online_users': online_count
        }
    }), 200

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.get_all_users()
    return jsonify({
        'success': True,
        'data': [dict(u) for u in users]
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    # Prevent deleting admin gravity888
    user = User.get_by_id(user_id)
    if user and user['username'] == 'gravity888':
        return jsonify({'success': False, 'message': 'Cannot delete root administrator account.'}), 400
        
    User.delete(user_id)
    return jsonify({'success': True, 'message': 'User deleted successfully.'}), 200

@admin_bp.route('/posts', methods=['GET'])
@admin_required
def get_posts():
    # Admin can see post ownership for security auditing
    posts = Post.get_all_with_ownership()
    return jsonify({
        'success': True,
        'data': [dict(p) for p in posts]
    }), 200

@admin_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@admin_required
def delete_post(post_id):
    Post.delete(post_id)
    return jsonify({'success': True, 'message': 'Post removed by administrator.'}), 200





