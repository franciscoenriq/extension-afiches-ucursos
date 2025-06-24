-- Crear la base de datos
CREATE DATABASE afiches_app;

-- Crear el usuario
CREATE USER flask_user WITH PASSWORD 'Taller_IA_grupo6';

-- Opciones de conexión
ALTER ROLE flask_user SET client_encoding TO 'utf8';
ALTER ROLE flask_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE flask_user SET timezone TO 'UTC';

-- Dar permisos de conexión a la base
GRANT CONNECT ON DATABASE afiches_app TO flask_user;

-- Conectarse a la base de datos
\c afiches_app

-- Permitir uso del esquema y lectura/escritura en tablas existentes
GRANT USAGE ON SCHEMA public TO flask_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO flask_user;

-- Aplicar permisos de lectura/escritura también a futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO flask_user;
