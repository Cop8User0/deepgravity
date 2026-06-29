from backend.app.database import get_db, query_db, insert_db

class ChatRoom:
    @staticmethod
    def get_all():
        return query_db('SELECT * FROM chat_rooms ORDER BY created_at DESC')
    
    @staticmethod
    def create(name, created_by):
        return insert_db('INSERT INTO chat_rooms (name, created_by) VALUES (?, ?)', [name, created_by])

class ChatMessage:
    @staticmethod
    def get_by_room(room_id):
        return query_db('SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at', [room_id])
    
    @staticmethod
    def create(room_id, user_id, content):
        return insert_db('INSERT INTO chat_messages (room_id, user_id, content) VALUES (?, ?, ?)', [room_id, user_id, content])





