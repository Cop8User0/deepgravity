from backend.app.database import get_db, query_db, insert_db

class Message:
    @staticmethod
    def get_conversations(user_id):
        return query_db(
            'SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC',
            [user_id, user_id]
        )
    
    @staticmethod
    def get_between(user1, user2):
        return query_db(
            'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at',
            [user1, user2, user2, user1]
        )
    
    @staticmethod
    def create(sender_id, receiver_id, content):
        return insert_db(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [sender_id, receiver_id, content]
        )





