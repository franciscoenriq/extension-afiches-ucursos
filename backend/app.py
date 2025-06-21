from flask import Flask, render_template, redirect, url_for, flash,jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from config import Config
from models import db, User
from forms import LoginForm, RegisterForm
from flask_ninja import NinjaAPI
from flask_cors import CORS

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
]

@app.route("/api/afiches", methods=["GET"])
def get_afiches():
    return jsonify(afiches)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_pw = bcrypt.generate_password_hash(form.password.data).decode("utf-8")
        user = User(username=form.username.data, password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        flash("Cuenta creada. Ahora puedes iniciar sesión.", "success")
        return redirect(url_for("login"))
    return render_template("register.html", form=form)

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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)