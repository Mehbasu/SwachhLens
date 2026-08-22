from db.database import db
cur = db.conn.cursor()
cur.execute("UPDATE users SET role='citizen' WHERE email='ankanghosh156@gmail.com'")
db.conn.commit()
print('Done')
