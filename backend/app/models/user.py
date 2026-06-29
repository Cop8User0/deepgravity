from backend.app.database import get_db, query_db, insert_db
from backend.app.utils.password_hasher import hash_password

class User:
    @staticmethod
    def get_by_id(user_id):
        return query_db('SELECT * FROM users WHERE id = ?', [user_id], one=True)
    
    @staticmethod
    def get_by_username(username):
        return query_db('SELECT * FROM users WHERE username = ?', [username], one=True)
    
    @staticmethod
    def get_all():
        return query_db('SELECT * FROM users ORDER BY created_at DESC')
    
    @staticmethod
    def create(username, password, passkey, display_name):
        return insert_db(
            'INSERT INTO users (username, password_hash, passkey, display_name) VALUES (?, ?, ?, ?)',
            [username, hash_password(password), passkey, display_name]
        )





