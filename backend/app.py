from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, render_template, redirect, url_for, flash,jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from config import Config
from models import *
from forms import *
from flask_ninja import NinjaAPI
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Habilita CORS para desarrollo (todas las rutas y orígenes)
app.config.from_object(Config)

db.init_app(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager(app)
login_manager.login_view = "login"

ninja = NinjaAPI(app)

# Lista de afiches simulados
afiches = [ 
    {"id": 108413, "titulo": "Feria de Innovación 2025"},
    {"id": 107405, "titulo": "Charla de Ciberseguridad"},
    {"id": 108305, "titulo": "Concurso de Startups"},
    {"id": 108069, "titulo": "Semana de la Ingeniería"},
    {"id": 108413, "titulo": "Feria de Innovación 2025"},
    {"id": 107405, "titulo": "Charla de Ciberseguridad"},
    {"id": 108305, "titulo": "Concurso de Startups"},
    {"id": 108069, "titulo": "Semana de la Ingeniería"},
    {"id": 108413, "titulo": "Feria de Innovación 2025"},
    {"id": 107405, "titulo": "Charla de Ciberseguridad"},
    {"id": 108305, "titulo": "Concurso de Startups"},
    {"id": 108069, "titulo": "Semana de la Ingeniería"}
    #{"id": 108001, "titulo": "Conferencia de Tecnología", "imagen": "/static/afiches/tech_conference.jpg", "es_evento": 1},
    #{"id": 108002, "titulo": "Promoción Descuentos", "imagen": "/static/afiches/descuentos.jpg", "es_evento": 0}
]

@app.route("/api/afiches", methods=["GET","POST"])
def create_afiche():
    if request.method == "POST":
        data = request.get_json() or request.form
        # Validar campos requeridos según la tabla imagenes_clasificadas
        required_fields = ["id", "nombre"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Campo requerido faltante: {field}"}), 400
        try:
            clasificacion = int(data.get("clasificacion", 0))
            if clasificacion not in [0, 1]:
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({"error": "El campo clasificacion debe ser 0 o 1"}), 400

        # Verificar si ya existe en la base de datos
        if ImagenClasificada.query.get(data["id"]):
            return jsonify({"error": "Ya existe un afiche con ese ID"}), 409

        # Crear y guardar el nuevo afiche
        nuevo_afiche = ImagenClasificada(
            id=data["id"],
            nombre=data["nombre"],
            clasificacion=clasificacion
        )

        try:
            db.session.add(nuevo_afiche)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"No se pudo guardar el afiche: {str(e)}"}), 500

        return jsonify({
            "mensaje": "Afiche creado con éxito",
            "afiche": {
                "id": nuevo_afiche.id,
                "nombre": nuevo_afiche.nombre,
                "clasificacion": nuevo_afiche.clasificacion
            }
        }), 201
    afiches = (ImagenClasificada.query
            .filter_by(clasificacion=1)
            .order_by(ImagenClasificada.id.desc())
            .limit(100)
            .all())
            
    afiches_json = [
        {
            "id":afiche.id,
            "nombre":afiche.nombre,
            "clasificacion":afiche.clasificacion
        }
        for afiche in afiches
    ]
    return jsonify(afiches_json)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Credenciales incorrectas", "danger")
    return render_template("login.html", form=form)

@app.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user)

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/reclamos",methods=["POST"])
def reclamos():
    if request.method == "POST":
        data = request.get_json() or request.form
        foto_id = data.get("foto_id")
        descripcion = data.get("descripcion")
        #validamos 
        if not foto_id or not descripcion:
            return jsonify({"error":"Faltan campos requeridos"}), 400 
        nuevo_reclamo = Reclamo(
            foto_id=foto_id,
            descripcion=descripcion
        )
        db.session.add(nuevo_reclamo)
        db.session.commit()
        return jsonify({"mensaje":"Reclamo enviado con exito"}) , 201

@app.route("/admin/reclamos")
@login_required
def ver_reclamos():
    reclamos = Reclamo.query.order_by(Reclamo.fecha.desc()).all()
    return render_template("reclamos.html", reclamos=reclamos)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)