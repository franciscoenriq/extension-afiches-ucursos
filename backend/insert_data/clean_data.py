import pandas as pd 
import os 
import re

# Función para detectar si un string contiene emojis
def contiene_emoji(texto):
    if not isinstance(texto, str):
        return False
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # símbolos y pictogramas
        "\U0001F680-\U0001F6FF"  # transporte y símbolos de mapas
        "\U0001F1E0-\U0001F1FF"  # banderas
        "\U00002702-\U000027B0"  # otros símbolos misceláneos
        "\U000024C2-\U0001F251"  # más símbolos
        "]+", flags=re.UNICODE)
    return bool(emoji_pattern.search(texto))

path = "/home/lenovo2/Documentos/taller ia/extension-afiches-ucursos/backend/insert_data"
filename="dataset_afiches.csv"
df = pd.read_csv(f"{path}/{filename}")


#nos quedamos con las columnas que queremos 
df = df[["id","title","evento"]].rename(columns={
    "title":"nombre",
    "evento": "clasificacion"
})
#solo clasificaciones de eventos 
df = df[df["clasificacion"]==1]
#reemplazamos comillas simples 
df["nombre"] = df["nombre"].str.replace("'", "''")
df = df.dropna()
# Filtramos las filas cuyo 'nombre' NO contiene emojis
df = df[~df["nombre"].apply(contiene_emoji)]

output_path = "/home/lenovo2/Documentos/taller ia/extension-afiches-ucursos/backend/insert_data/inserts_afiches.sql"
# Creamos el archivo SQL con los INSERTS
with open(output_path, "w", encoding="utf-8") as f:
    f.write("INSERT INTO imagenes_clasificadas (id, nombre, clasificacion) VALUES\n")
    for idx, (i, row) in enumerate(df.iterrows()):
        line = f"({row['id']}, '{row['nombre']}', {row['clasificacion']})"
        if idx < len(df) - 1:
            line += ",\n"
        else:
            line += ";\n"
        f.write(line)

print("Archivo 'inserts_afiches.sql' creado con éxito.")
print(df)