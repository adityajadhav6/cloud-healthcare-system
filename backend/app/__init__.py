# app/__init__.py
from flask import Flask  # ✅ Add this import
from config import Config
from app.extensions import db
from app.routes.appointment_routes import appointment_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    with app.app_context():
        from app.routes.auth_routes import auth_bp
        from app.routes.ehr_routes import ehr_bp
        from app.routes.admin_routes import admin_routes  # ✅ move this inside
        from app.routes.appointment_routes import appointment_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(ehr_bp, url_prefix='/api/ehr')
        app.register_blueprint(admin_routes, url_prefix='/api/admin')  # ✅ correct place
        app.register_blueprint(appointment_bp, url_prefix='/api/appointments')

        from app.models import user_model
        db.create_all()

    return app
