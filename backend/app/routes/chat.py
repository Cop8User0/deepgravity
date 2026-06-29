from flask import Blueprint, request, jsonify, g
from backend.app.services.chat_service import ChatService
from backend.app.middleware.auth_middleware import token_required

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/rooms', methods=['GET'])
@token_required
def get_rooms():
    result = ChatService.get_rooms()
    return jsonify(result), 200

@chat_bp.route('/rooms', methods=['POST'])
@token_required
def create_room():
    data = request.get_json() or {}
    name = data.get('name')
    is_private = data.get('is_private', 0)
    
    result = ChatService.create_room(name, g.current_user['id'], is_private)
    status_code = 201 if result['success'] else 400
    return jsonify(result), status_code

@chat_bp.route('/rooms/<int:room_id>/messages', methods=['GET'])
@token_required
def get_room_messages(room_id):
    result = ChatService.get_messages(room_id, g.current_user['id'])
    status_code = 200 if result['success'] else 403
    return jsonify(result), status_code

@chat_bp.route('/rooms/<int:room_id>/members', methods=['GET'])
@token_required
def get_room_members(room_id):
    result = ChatService.get_members(room_id, g.current_user['id'])
    status_code = 200 if result['success'] else 403
    return jsonify(result), status_code

@chat_bp.route('/rooms/<int:room_id>/join', methods=['POST'])
@token_required
def join_room(room_id):
    result = ChatService.join_room(room_id, g.current_user['id'])
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@chat_bp.route('/rooms/<int:room_id>/leave', methods=['POST'])
@token_required
def leave_room(room_id):
    result = ChatService.leave_room(room_id, g.current_user['id'])
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code





