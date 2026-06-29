from backend.app.database import get_db, query_db, insert_db

class Notification:
    @staticmethod
    def get_by_user(user_id):
        return query_db('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [user_id])
    
    @staticmethod
    def create(user_id, type, content):
        return insert_db(
            'INSERT INTO notifications (user_id, type, content) VALUES (?, ?, ?)',
            [user_id, type, content]
        )





