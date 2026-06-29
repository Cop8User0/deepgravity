from flask import Blueprint, request, jsonify
from backend.app.models.user import User
from backend.app.utils.password_hasher import check_password
from backend.app.utils.token_manager import create_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    user = User.get_by_username(username)
    if user and check_password(password, user['password_hash']):
        token = create_token(user['id'])
        return jsonify({'success': True, 'token': token, 'user': dict(user)})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    display_name = data.get('display_name', username)
    passkey = str(__import__('random').randint(100000, 999999))
    if User.get_by_username(username):
        return jsonify({'success': False, 'message': 'Username exists'}), 400
    user_id = User.create(username, password, passkey, display_name)
    return jsonify({'success': True, 'user_id': user_id, 'passkey': passkey})

@auth_bp.route('/me', methods=['GET'])
def me():
    return jsonify({'success': True, 'message': 'OK'})
