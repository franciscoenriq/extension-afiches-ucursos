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
from datetime import datetime

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
    # Obtener IDs de afiches que tienen reclamos aceptados
    afiches_reportados = db.session.query(Reclamo.foto_id).filter_by(estado='aceptado').distinct().all()
    ids_reportados = [afiche[0] for afiche in afiches_reportados]
    
    # Filtrar afiches excluyendo los que tienen reclamos aceptados
    afiches = (ImagenPredicha.query
            .filter_by(clasificacion=1)
            .filter(~ImagenPredicha.id.in_(ids_reportados))  # Excluir los reportados
            .order_by(ImagenPredicha.fecha.desc())
            .limit(100)
            .all())
            
    afiches_json = [
        {
            "id": afiche.id,
            "nombre": afiche.nombre,
            "clasificacion": afiche.clasificacion,
            "fecha": afiche.fecha,
            "probability_evento": afiche.probability_evento
        }
        for afiche in afiches
    ]
    return jsonify(afiches_json)

@app.route("/afichesApp/afichesApp-front/api/afiches-reportados", methods=["GET"])
def get_afiches_reportados():
    """Endpoint que devuelve solo los IDs de afiches con reclamos aceptados"""
    try:
        # Obtener IDs de afiches que tienen reclamos aceptados
        afiches_reportados = db.session.query(Reclamo.foto_id).filter_by(estado='aceptado').distinct().all()
        
        # Convertir a lista de diccionarios con foto_id
        reportados_json = [{"foto_id": afiche[0]} for afiche in afiches_reportados]
        
        return jsonify(reportados_json)
    except Exception as e:
        print(f"Error obteniendo afiches reportados: {e}")
        return jsonify([]), 500

@app.route("/afichesApp/afichesApp-front/api/estadisticas", methods=["GET"])
def estadisticas_afiches():
    """Endpoint para obtener estadísticas de afiches y reclamos"""
    total_afiches = ImagenPredicha.query.filter_by(clasificacion=1).count()
    
    # Contar afiches con reclamos aceptados
    afiches_reportados = db.session.query(Reclamo.foto_id).filter_by(estado='aceptado').distinct().count()
    
    # Contar reclamos por estado
    reclamos_pendientes = Reclamo.query.filter_by(estado='pendiente').count()
    reclamos_aceptados = Reclamo.query.filter_by(estado='aceptado').count()
    reclamos_rechazados = Reclamo.query.filter_by(estado='rechazado').count()
    
    # Afiches visibles (sin reclamos aceptados)
    afiches_visibles = total_afiches - afiches_reportados
    
    estadisticas = {
        "total_afiches": total_afiches,
        "afiches_visibles": afiches_visibles,
        "afiches_ocultos_por_reclamos": afiches_reportados,
        "reclamos": {
            "pendientes": reclamos_pendientes,
            "aceptados": reclamos_aceptados,
            "rechazados": reclamos_rechazados,
            "total": reclamos_pendientes + reclamos_aceptados + reclamos_rechazados
        }
    }
    
    return jsonify(estadisticas)

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
    # Obtener estadísticas para mostrar en el dashboard
    try:
        total_afiches = ImagenPredicha.query.filter_by(clasificacion=1).count()
        afiches_reportados = db.session.query(Reclamo.foto_id).filter_by(estado='aceptado').distinct().count()
        reclamos_pendientes = Reclamo.query.filter_by(estado='pendiente').count()
        afiches_visibles = total_afiches - afiches_reportados
        
        estadisticas = {
            'total_afiches': total_afiches,
            'afiches_visibles': afiches_visibles,
            'afiches_ocultos': afiches_reportados,
            'reclamos_pendientes': reclamos_pendientes
        }
    except Exception as e:
        print(f"Error obteniendo estadísticas: {e}")
        estadisticas = {
            'total_afiches': 0,
            'afiches_visibles': 0,
            'afiches_ocultos': 0,
            'reclamos_pendientes': 0
        }
    
    return render_template("dashboard.html", user=current_user, stats=estadisticas)

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

@app.route("/afichesApp/afichesApp-front/admin/reclamos/aceptar/<int:reclamo_id>", methods=["POST"])
@login_required
def aceptar_reclamo(reclamo_id):
    try:
        reclamo = Reclamo.query.get_or_404(reclamo_id)
        reclamo.estado = 'aceptado'
        reclamo.fecha_resolucion = db.func.now()
        db.session.commit()
        
        flash(f"Reclamo #{reclamo_id} aceptado exitosamente", "success")
        return redirect(url_for("ver_reclamos"))
    except Exception as e:
        db.session.rollback()
        flash(f"Error al aceptar el reclamo: {str(e)}", "error")
        return redirect(url_for("ver_reclamos"))

@app.route("/afichesApp/afichesApp-front/admin/reclamos/rechazar/<int:reclamo_id>", methods=["POST"])
@login_required
def rechazar_reclamo(reclamo_id):
    try:
        reclamo = Reclamo.query.get_or_404(reclamo_id)
        reclamo.estado = 'rechazado'
        reclamo.fecha_resolucion = db.func.now()
        db.session.commit()
        
        flash(f"Reclamo #{reclamo_id} rechazado exitosamente", "success")
        return redirect(url_for("ver_reclamos"))
    except Exception as e:
        db.session.rollback()
        flash(f"Error al rechazar el reclamo: {str(e)}", "error")
        return redirect(url_for("ver_reclamos"))

application = app
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)