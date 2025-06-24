-- Usar la base de datos
USE afiches_app;

-- Crear la tabla 'imagenes_clasificadas'
CREATE TABLE IF NOT EXISTS imagenes_clasificadas (
    id INT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    clasificacion SMALLINT NOT NULL CHECK (clasificacion IN (0, 1))
);
