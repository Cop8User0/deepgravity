from flask import Blueprint, request, jsonify, g
from backend.app.services.post_service import PostService
from backend.app.middleware.auth_middleware import token_required

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('', methods=['GET'])
@token_required
def get_posts():
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
    except ValueError:
        page = 1
        limit = 20
        
    result = PostService.get_feed(page, limit)
    return jsonify(result), 200

@posts_bp.route('', methods=['POST'])
@token_required
def create_post():
    data = request.get_json() or {}
    content = data.get('content')
    image_path = data.get('image_path')
    
    result = PostService.create_post(g.current_user['id'], content, image_path)
    status_code = 201 if result['success'] else 400
    return jsonify(result), status_code

@posts_bp.route('/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(post_id):
    result = PostService.delete_post(post_id, g.current_user['id'], bool(g.current_user['is_admin']))
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code





