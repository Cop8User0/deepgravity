from backend.app.models.notification import Notification

class NotificationService:
    @staticmethod
    def get_notifications(user_id, limit=20):
        notifications = Notification.get_by_user(user_id, limit)
        return {
            'success': True,
            'data': [dict(n) for n in notifications]
        }

    @staticmethod
    def mark_read(notification_id, user_id):
        Notification.mark_as_read(notification_id, user_id)
        return {'success': True, 'message': 'Notification marked as read.'}

    @staticmethod
    def mark_all_read(user_id):
        Notification.mark_all_as_read(user_id)
        return {'success': True, 'message': 'All notifications marked as read.'}

    @staticmethod
    def get_unread_count(user_id):
        count = Notification.get_unread_count(user_id)
        return {
            'success': True,
            'data': {
                'unread_count': count
            }
        }
        
    @staticmethod
    def delete_notification(notification_id, user_id):
        Notification.delete(notification_id, user_id)
        return {'success': True, 'message': 'Notification deleted.'}





