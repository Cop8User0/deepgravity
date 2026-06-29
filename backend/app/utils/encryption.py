import base64

def encrypt_text(text, key='deepgravity_secret_key'):
    if not text:
        return ''
    key_bytes = key.encode('utf-8')
    text_bytes = text.encode('utf-8')
    xor_bytes = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(text_bytes)])
    return base64.b64encode(xor_bytes).decode('ascii')

def decrypt_text(encrypted_text, key='deepgravity_secret_key'):
    if not encrypted_text:
        return ''
    try:
        key_bytes = key.encode('utf-8')
        xor_bytes = base64.b64decode(encrypted_text.encode('ascii'))
        result = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(xor_bytes)])
        return result.decode('utf-8')
    except:
        return encrypted_text





