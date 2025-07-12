from dotenv import load_dotenv
load_dotenv()
from flask import Flask, request, render_template, redirect, url_for, flash,jsonify
import requests
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


@app.route("/afichesApp/afichesApp-front/guardar_predicciones", methods=['POST'])
def guardar_predicciones():
    try:
        data = request.json  # Recibe JSON directamente en el POST

        for item in data:
            # Verificar si ya existe
            existente = ImagenPredicha.query.get(item["id"])
            if existente:
                continue  # O actualiza si deseas

            nueva_prediccion = ImagenPredicha(
                id=item["id"],
                nombre=item["title"].replace("'", "''"),
                clasificacion=item["prediction"],
                probability_evento=item["probability_evento"],
                probability_no_evento=item["probability_no_evento"],
                fecha=item["date"]
            )
            db.session.add(nueva_prediccion)

        db.session.commit()
        return jsonify({"status": "ok", "mensaje": "Predicciones guardadas correctamente."}), 200

    except Exception as ex:
        db.session.rollback()
        print("Error al guardar en la base de datos:", ex)
        return jsonify({"status": "error", "mensaje": str(ex)}), 500


        

@app.route("/afichesApp/afichesApp-front/mostrar_predicciones")
def mostrar_predicciones():
    # URL del servidor externo que tiene /predictions
    url_api = "http://172.17.69.228:9006/Afiches-IA/predict"
    try:
        response = requests.get(url_api)
        response.raise_for_status()  # Para levantar excepción si falla
        data = response.json()
         # Insertar cada predicción en la tabla imagenes_predichas
        for item in data:
            # Verificar si ya existe (para evitar duplicados)
            existente = ImagenPredicha.query.get(item["id"])
            if existente:
                continue  # O podrías actualizar si lo deseas

            nueva_prediccion = ImagenPredicha(
                id=item["id"],
                nombre=item["title"].replace("'", "''"),
                clasificacion=item["prediction"],
                probability_evento=item["probability_evento"],
                probability_no_evento=item["probability_no_evento"],
                fecha=item["date"]
            )
            db.session.add(nueva_prediccion)

        db.session.commit()
    except requests.RequestException as e:
        data = []
        print("Error al consultar /predictions:", e)
    except Exception as ex:
        db.session.rollback()
        print("Error al guardar en la base de datos:", ex)

    return render_template("predicciones.html", predicciones=data)
@app.route("/afichesApp/afichesApp-front/api/afiches", methods=["GET"])
def create_afiche():
    afiches = (ImagenPredicha.query
            .filter_by(clasificacion=1)
            .order_by(ImagenPredicha.fecha.desc())
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

@app.route("/afichesApp/afichesApp-front/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user)
            return redirect(url_for("dashboard"))
        flash("Credenciales incorrectas", "danger")
    return render_template("login.html", form=form)

@app.route("/afichesApp/afichesApp-front/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html", user=current_user)

@app.route("/afichesApp/afichesApp-front/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/afichesApp/afichesApp-front/reclamos",methods=["POST"])
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

@app.route("/afichesApp/afichesApp-front/admin/reclamos")
@login_required
def ver_reclamos():
    reclamos = Reclamo.query.order_by(Reclamo.fecha.desc()).all()
    return render_template("reclamos.html", reclamos=reclamos)

application = app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)