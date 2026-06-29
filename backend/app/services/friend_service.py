from backend.app.models.friendship import Friendship
from backend.app.models.user import User
from backend.app.models.notification import Notification

class FriendService:
    @staticmethod
    def send_friend_request(user_id, friend_id):
        if user_id == friend_id:
            return {'success': False, 'message': 'You cannot add yourself.'}
            
        # Check current relation
        relation = Friendship.get_relation(user_id, friend_id)
        if relation:
            status = relation['status']
            if status == 'accepted':
                return {'success': False, 'message': 'You are already friends.'}
            elif status == 'pending':
                if relation['user_id'] == user_id:
                    return {'success': False, 'message': 'Friend request already sent.'}
                else:
                    # The other user already sent a request, so accept it!
                    Friendship.accept_request(user_id, friend_id)
                    Notification.create(friend_id, 'friend_accept', 'Accepted your friend request.', user_id)
                    return {'success': True, 'message': 'Friend request accepted.'}
            elif status == 'blocked':
                return {'success': False, 'message': 'User is blocked.'}

        success = Friendship.send_request(user_id, friend_id)
        if not success:
            return {'success': False, 'message': 'Unable to send request.'}
            
        # Send Notification
        sender = User.get_by_id(user_id)
        Notification.create(friend_id, 'friend_request', f"{sender['display_name']} sent you a friend request.", user_id)
        
        return {'success': True, 'message': 'Friend request sent successfully.'}

    @staticmethod
    def accept_request(user_id, friendship_id):
        # We need to find the sender's id from the friendship row
        # In this context, let's accept by target's id directly to be simpler, or query friendships
        # We can accept by friend_id directly:
        Friendship.accept_request(user_id, friendship_id)
        Notification.create(friendship_id, 'friend_accept', 'Accepted your friend request.', user_id)
        return {'success': True, 'message': 'Friend request accepted.'}

    @staticmethod
    def reject_request(user_id, friend_id):
        Friendship.reject_request(user_id, friend_id)
        return {'success': True, 'message': 'Friend request rejected.'}

    @staticmethod
    def remove_friend(user_id, friend_id):
        Friendship.remove(user_id, friend_id)
        return {'success': True, 'message': 'Friend removed successfully.'}

    @staticmethod
    def get_friends_list(user_id):
        friends = Friendship.get_friends(user_id)
        return {
            'success': True,
            'data': [dict(f) for f in friends]
        }

    @staticmethod
    def get_pending_requests(user_id):
        incoming = Friendship.get_pending_requests(user_id)
        outgoing = Friendship.get_sent_requests(user_id)
        return {
            'success': True,
            'data': {
                'incoming': [dict(r) for r in incoming],
                'outgoing': [dict(r) for r in outgoing]
            }
        }
        
    @staticmethod
    def search_potential_friends(query_str, user_id):
        users = User.search(query_str, user_id)
        results = []
        for user in users:
            relation = Friendship.get_relation(user_id, user['id'])
            status = 'none'
            if relation:
                if relation['status'] == 'accepted':
                    status = 'friends'
                elif relation['status'] == 'pending':
                    status = 'pending_sent' if relation['user_id'] == user_id else 'pending_received'
                elif relation['status'] == 'blocked':
                    status = 'blocked'
            
            results.append({
                'id': user['id'],
                'display_name': user['display_name'],
                'avatar': user['avatar'],
                'is_online': user['is_online'],
                'relation': status
            })
            
        return {
            'success': True,
            'data': results
        }
        
    @staticmethod
    def block_user(user_id, target_id):
        if user_id == target_id:
            return {'success': False, 'message': 'You cannot block yourself.'}
        Friendship.block(user_id, target_id)
        return {'success': True, 'message': 'User blocked.'}





