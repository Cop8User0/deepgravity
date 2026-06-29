def validate_username(username):
    if not username or len(username) < 3:
        return False, 'Username must be at least 3 characters.'
    return True, ''

def validate_password(password):
    if not password or len(password) < 4:
        return False, 'Password must be at least 4 characters.'
    return True, ''





