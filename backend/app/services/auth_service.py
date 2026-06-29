import random
from backend.app.models.user import User
from backend.app.utils.password_hasher import check_password
from backend.app.utils.token_manager import create_token
from backend.app.utils.validators import validate_username, validate_password

class AuthService:
    @staticmethod
    def register(username, display_name, password):
        if not validate_username(username):
            return {'success': False, 'message': 'Username must be 3-20 characters (letters, numbers, underscores).'}
            
        if not validate_password(password):
            return {'success': False, 'message': 'Password must be at least 6 characters.'}
            
        if not display_name or len(display_name.strip()) < 2:
            return {'success': False, 'message': 'Display name must be at least 2 characters.'}

        # Check if username exists
        existing = User.get_by_username(username)
        if existing:
            return {'success': False, 'message': 'Username is already taken.'}

        # Generate a 6-digit passkey for secure authentication fallback
        passkey = str(random.randint(100000, 999999))
        
        # Check if this is the first user; if so, make them admin (optional, but we will seed gravity888 anyway)
        user_id = User.create(username, password, passkey, display_name.strip())
        
        if not user_id:
            return {'success': False, 'message': 'Failed to create user.'}
            
        return {
            'success': True,
            'message': 'Registration successful.',
            'data': {
                'user_id': user_id,
                'passkey': passkey
            }
        }

    @staticmethod
    def login(username, password):
        user = User.get_by_username(username)
        if not user:
            return {'success': False, 'message': 'Invalid username or password.'}
            
        if not check_password(password, user['password_hash']):
            return {'success': False, 'message': 'Invalid username or password.'}

        token = create_token(user['id'], user['is_admin'])
        
        # Set online status
        User.set_online_status(user['id'], 1)

        return {
            'success': True,
            'message': 'Login successful.',
            'data': {
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'display_name': user['display_name'],
                    'avatar': user['avatar'],
                    'bio': user['bio'],
                    'is_admin': user['is_admin']
                }
            }
        }

    @staticmethod
    def logout(user_id):
        User.set_online_status(user_id, 0)
        return {'success': True, 'message': 'Logged out successfully.'}






