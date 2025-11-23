from app import create_app

app = create_app()

from app.routes.user_routes import user_routes
from app.routes.appointment_routes import appointment_bp
from app.routes.admin_routes import admin_routes
from app.routes.chatbot_routes import chatbot_routes
from app.extensions import cors

cors.init_app(app)

# Register the appointments blueprint
app.register_blueprint(user_routes, url_prefix='/api/users')
app.register_blueprint(appointment_bp, url_prefix='/api/appointments')
app.register_blueprint(admin_routes, url_prefix='/api/admin')
app.register_blueprint(chatbot_routes, url_prefix='/api')
