from flask import Blueprint, request, jsonify, g
from backend.app.services.friend_service import FriendService
from backend.app.middleware.auth_middleware import token_required

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('', methods=['GET'])
@token_required
def get_friends():
    result = FriendService.get_friends_list(g.current_user['id'])
    return jsonify(result), 200

@friends_bp.route('/pending', methods=['GET'])
@token_required
def get_pending():
    result = FriendService.get_pending_requests(g.current_user['id'])
    return jsonify(result), 200

@friends_bp.route('/request/<int:friend_id>', methods=['POST'])
@token_required
def send_request(friend_id):
    result = FriendService.send_friend_request(g.current_user['id'], friend_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@friends_bp.route('/accept/<int:friend_id>', methods=['PUT'])
@token_required
def accept_request(friend_id):
    result = FriendService.accept_request(g.current_user['id'], friend_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@friends_bp.route('/reject/<int:friend_id>', methods=['PUT'])
@token_required
def reject_request(friend_id):
    result = FriendService.reject_request(g.current_user['id'], friend_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@friends_bp.route('/<int:friend_id>', methods=['DELETE'])
@token_required
def remove_friend(friend_id):
    result = FriendService.remove_friend(g.current_user['id'], friend_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@friends_bp.route('/search', methods=['GET'])
@token_required
def search_users():
    query_str = request.args.get('q', '')
    result = FriendService.search_potential_friends(query_str, g.current_user['id'])
    return jsonify(result), 200

@friends_bp.route('/block/<int:target_id>', methods=['POST'])
@token_required
def block_user(target_id):
    result = FriendService.block_user(g.current_user['id'], target_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code





