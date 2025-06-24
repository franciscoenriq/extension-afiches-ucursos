from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
class Reclamo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    foto_id = db.Column(db.Integer, nullable=False)  # ID de la imagen reclamada
    descripcion = db.Column(db.Text, nullable=False)  # Motivo del reclamo
    timestamp = db.Column(db.DateTime, default=datetime.now)
    nombre_usuario = db.Column(db.String(100), nullable=False) 

    def __repr__(self):
        return f"<Reclamo {self.id} por usuario {self.user_id}>"
    
class ImagenClasificada(db.Model):
    __tablename__ = 'imagenes_clasificadas'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    clasificacion = db.Column(db.SmallInteger, nullable=False)  # 0 o 1

    def __repr__(self):
        return f"<ImagenClasificada id={self.id} nombre='{self.nombre}' clasificacion={self.clasificacion}>"
