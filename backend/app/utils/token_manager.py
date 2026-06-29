import jwt
import datetime
import os

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'deepgravity-secret')

def create_token(user_id):
    payload = {'user_id': user_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def create_token(user_id):
    return create_token(user_id)

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except:
        return None

def verify_token(token):
    return verify_token(token)




