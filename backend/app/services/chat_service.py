from backend.app.models.chat import ChatRoom

class ChatService:
    @staticmethod
    def create_room(name, created_by, is_private=0):
        if not name or len(name.strip()) < 2:
            return {'success': False, 'message': 'Room name must be at least 2 characters.'}
            
        room_id = ChatRoom.create_room(name.strip(), created_by, is_private)
        if not room_id:
            return {'success': False, 'message': 'Failed to create room.'}
            
        return {
            'success': True,
            'message': 'Room created successfully.',
            'data': {
                'id': room_id,
                'name': name,
                'is_private': is_private
            }
        }

    @staticmethod
    def join_room(room_id, user_id):
        success = ChatRoom.join_room(room_id, user_id)
        if not success:
            return {'success': False, 'message': 'Could not join room.'}
        return {'success': True, 'message': 'Joined room.'}

    @staticmethod
    def leave_room(room_id, user_id):
        ChatRoom.leave_room(room_id, user_id)
        return {'success': True, 'message': 'Left room.'}

    @staticmethod
    def get_rooms():
        rooms = ChatRoom.get_rooms()
        return {
            'success': True,
            'data': [dict(r) for r in rooms]
        }

    @staticmethod
    def get_messages(room_id, user_id):
        # Verify membership
        if not ChatRoom.is_member(room_id, user_id):
            return {'success': False, 'message': 'Access denied. You must be a member.'}
            
        msgs = ChatRoom.get_messages(room_id)
        # Turn sqlite.Row to normal dicts and reverse order so chronological
        formatted = [dict(m) for m in msgs]
        formatted.reverse()
        return {
            'success': True,
            'data': formatted
        }
        
    @staticmethod
    def get_members(room_id, user_id):
        if not ChatRoom.is_member(room_id, user_id):
            return {'success': False, 'message': 'Access denied.'}
        members = ChatRoom.get_members(room_id)
        return {
            'success': True,
            'data': [dict(m) for m in members]
        }





