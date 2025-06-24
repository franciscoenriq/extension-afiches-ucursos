#en la terminal agregar export FLASK_APP=app.py
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
hashed_pw = bcrypt.generate_password_hash("grupoIAtaller6").decode("utf-8")
print(hashed_pw)
