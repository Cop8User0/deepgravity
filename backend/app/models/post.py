from backend.app.database import get_db, query_db, insert_db

class Post:
    @staticmethod
    def get_all():
        return query_db('SELECT * FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC')
    
    @staticmethod
    def get_by_id(post_id):
        return query_db('SELECT * FROM posts WHERE id = ?', [post_id], one=True)
    
    @staticmethod
    def create(user_id, content, image_path=None, video_path=None):
        return insert_db(
            'INSERT INTO posts (user_id, content, image_path, video_path) VALUES (?, ?, ?, ?)',
            [user_id, content, image_path, video_path]
        )
    
    @staticmethod
    def delete(post_id):
        insert_db('UPDATE posts SET is_deleted = 1 WHERE id = ?', [post_id])





