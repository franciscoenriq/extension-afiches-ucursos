CREATE TABLE IF NOT EXISTS imagenes_predichas (
    id INT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    clasificacion SMALLINT NOT NULL CHECK (clasificacion IN (0, 1)),
    probability_evento FLOAT,
    probability_no_evento FLOAT,
    fecha VARCHAR(40)
);
