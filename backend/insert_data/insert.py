import psycopg2

# Conexión
conn = psycopg2.connect(
    dbname="afiches_app",
    user="flask_user",
    password="Taller_IA_grupo6",
    host="localhost",
    port="5432"
)

cursor = conn.cursor()
path = "/home/lenovo2/Documentos/taller ia/extension-afiches-ucursos/backend/insert_data/inserts_afiches.sql"
# Leer el contenido del archivo .sql
with open(path, "r", encoding="utf-8") as f:
    sql = f.read()
    cursor.execute(sql)

conn.commit()
cursor.close()
conn.close()
print("Datos insertados con éxito.")
