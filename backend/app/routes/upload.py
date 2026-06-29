import os
from flask import Blueprint, request, jsonify, g
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.file_handler import save_file
from backend.app.models.user import User

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/image', methods=['POST'])
@token_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded.'}), 400
        
    file = request.files['image']
    relative_path = save_file(file, 'posts')
    
    if not relative_path:
        return jsonify({'success': False, 'message': 'Invalid file format or upload failed.'}), 400
        
    return jsonify({
        'success': True,
        'message': 'Image uploaded successfully.',
        'data': {
            'image_path': relative_path
        }
    }), 201

@upload_bp.route('/avatar', methods=['POST'])
@token_required
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded.'}), 400
        
    file = request.files['avatar']
    relative_path = save_file(file, 'profiles')
    
    if not relative_path:
        return jsonify({'success': False, 'message': 'Invalid file format or upload failed.'}), 400
        
    # Update profile row
    User.update_profile(
        g.current_user['id'],
        g.current_user['display_name'],
        g.current_user['bio'],
        relative_path
    )
    
    return jsonify({
        'success': True,
        'message': 'Avatar updated successfully.',
        'data': {
            'avatar_path': relative_path
        }
    }), 200





