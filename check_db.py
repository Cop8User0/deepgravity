import sqlite3
conn = sqlite3.connect('database/deepgravity.db')
cursor = conn.cursor()

print('TABLES:')
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for t in cursor.fetchall():
    print(' -', t[0])

print()
print('USERS:')
cursor.execute('SELECT id, username, display_name, is_admin FROM users')
for row in cursor.fetchall():
    print(f'  [{row[0]}] {row[1]} - {row[2]} (admin={row[3]})')

print()
print('CHAT ROOMS:')
cursor.execute('SELECT id, name FROM chat_rooms')
for row in cursor.fetchall():
    print(f'  [{row[0]}] {row[1]}')

conn.close()
