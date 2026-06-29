from flask import Blueprint, request, jsonify, g
from backend.app.models.message import Message
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.encryption import encrypt_text, decrypt_text

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations():
    conversations = Message.get_conversations_list(g.current_user['id'])
    
    # Decrypt last message content if it exists
    formatted_convs = []
    for conv in conversations:
        c_dict = dict(conv)
        if c_dict['last_message']:
            c_dict['last_message'] = decrypt_text(c_dict['last_message'])
        formatted_convs.append(c_dict)
        
    return jsonify({'success': True, 'data': formatted_convs}), 200

@messages_bp.route('/<int:other_user_id>', methods=['GET'])
@token_required
def get_conversation(other_user_id):
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
    except ValueError:
        page = 1
        limit = 50
        
    offset = (page - 1) * limit
    messages = Message.get_conversation(g.current_user['id'], other_user_id, limit, offset)
    
    formatted_msgs = []
    for msg in messages:
        m_dict = dict(msg)
        m_dict['content'] = decrypt_text(m_dict['content'])
        formatted_msgs.append(m_dict)
        
    # Reverse so they are chronological
    formatted_msgs.reverse()
    
    # Auto mark as read when fetching conversation
    Message.mark_as_read(other_user_id, g.current_user['id'])
    
    return jsonify({'success': True, 'data': formatted_msgs}), 200

@messages_bp.route('/<int:other_user_id>', methods=['POST'])
@token_required
def send_message(other_user_id):
    data = request.get_json() or {}
    content = data.get('content')
    image_path = data.get('image_path')
    
    if not content and not image_path:
        return jsonify({'success': False, 'message': 'Message cannot be empty.'}), 400
        
    # Encrypt the content
    encrypted_content = encrypt_text(content)
    
    message_id = Message.send(g.current_user['id'], other_user_id, encrypted_content, image_path)
    if not message_id:
        return jsonify({'success': False, 'message': 'Failed to send message.'}), 500
        
    return jsonify({
        'success': True,
        'data': {
            'id': message_id,
            'sender_id': g.current_user['id'],
            'receiver_id': other_user_id,
            'content': content,
            'image_path': image_path,
            'is_read': 0
        }
    }), 201

@messages_bp.route('/read/<int:other_user_id>', methods=['PUT'])
@token_required
def mark_read(other_user_id):
    Message.mark_as_read(other_user_id, g.current_user['id'])
    return jsonify({'success': True, 'message': 'Messages marked as read.'}), 200





