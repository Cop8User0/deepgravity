from backend.app.models.post import Post

class PostService:
    @staticmethod
    def create_post(user_id, content, image_path=None):
        if not content and not image_path:
            return {'success': False, 'message': 'Post must contain either text or an image.'}
            
        post_id = Post.create(user_id, content, image_path)
        if not post_id:
            return {'success': False, 'message': 'Failed to create post.'}
            
        return {
            'success': True,
            'message': 'Post published anonymously.',
            'data': {
                'id': post_id,
                'content': content,
                'image_path': image_path
            }
        }

    @staticmethod
    def get_feed(page=1, limit=20):
        offset = (page - 1) * limit
        posts = Post.get_all(limit, offset)
        
        # Format posts list
        feed_data = []
        for post in posts:
            feed_data.append({
                'id': post['id'],
                'content': post['content'],
                'image_path': post['image_path'],
                'created_at': post['created_at']
            })
            
        return {
            'success': True,
            'data': feed_data
        }

    @staticmethod
    def delete_post(post_id, user_id, is_admin=False):
        post = Post.get_by_id(post_id)
        if not post:
            return {'success': False, 'message': 'Post not found.'}
            
        # Only author or admin can delete post
        if post['user_id'] != user_id and not is_admin:
            return {'success': False, 'message': 'Permission denied.'}
            
        Post.delete(post_id)
        return {'success': True, 'message': 'Post deleted successfully.'}





