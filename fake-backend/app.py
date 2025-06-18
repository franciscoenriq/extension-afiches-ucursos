from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilita CORS para desarrollo (todas las rutas y orígenes)

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
