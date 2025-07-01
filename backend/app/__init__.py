from flask import Flask
from flask_cors import CORS
from .models import db
from .routes import api
from config import Config
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    Migrate(app, db)
    CORS(app) # Permite peticiones desde el frontend de React

    # Registrar Blueprints (rutas)
    app.register_blueprint(api, url_prefix='/api')

    return app