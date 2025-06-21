#en la terminal agregar export FLASK_APP=app.py
from app import db, bcrypt
from models import User

hashed_pw = bcrypt.generate_password_hash("claveSegura").decode("utf-8")
u = User(username="admin", password=hashed_pw)
db.session.add(u)
db.session.commit()
