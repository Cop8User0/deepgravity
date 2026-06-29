from backend.app.database import get_db, query_db, insert_db

class Friendship:
    @staticmethod
    def get_friends(user_id):
        return query_db(
            'SELECT * FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = ?',
            [user_id, user_id, 'accepted']
        )
    
    @staticmethod
    def get_requests(user_id):
        return query_db(
            'SELECT * FROM friendships WHERE friend_id = ? AND status = ?',
            [user_id, 'pending']
        )
    
    @staticmethod
    def create(user_id, friend_id):
        return insert_db(
            'INSERT INTO friendships (user_id, friend_id) VALUES (?, ?)',
            [user_id, friend_id]
        )





