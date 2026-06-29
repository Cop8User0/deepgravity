def sanitize_input(text):
    if not text:
        return ''
    import re
    return re.sub(r'<[^>]*>', '', text).strip()

def validate_request(data):
    return True
