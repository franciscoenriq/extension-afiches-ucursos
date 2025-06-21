CREATE DATABASE afiches_app;

CREATE USER flask_user WITH PASSWORD 'Taller_IA_grupo6';

ALTER ROLE flask_user SET client_encoding TO 'utf8';
ALTER ROLE flask_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE flask_user SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE afiches_app TO flask_user;

\c afiches_app

GRANT ALL PRIVILEGES ON SCHEMA public TO flask_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flask_user;
