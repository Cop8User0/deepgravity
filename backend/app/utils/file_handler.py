import os

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, upload_folder):
    if file and allowed_file(file.filename):
        filename = str(int(os.urandom(4).hex(), 16)) + '_' + file.filename
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        return filename
    return None





