import re

def sanitize_input(text):
    if not text:
        return ''
    text = re.sub(r'<[^>]*>', '', text)
    return text.strip()

def strip_html(text):
    return sanitize_input(text)





