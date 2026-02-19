import os
from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.models import db, bcrypt
from app.config import config


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config["default"]))

    # Extensions
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "http://localhost:5173")}})

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.islands import islands_bp
    from app.routes.creatures import creatures_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(islands_bp, url_prefix="/api/islands")
    app.register_blueprint(creatures_bp, url_prefix="/api")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app
