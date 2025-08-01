# 📁 Backend Folder Structure
```

📁 backend/
│
├── 📁 app/ # Core application package
│ ├── 📁 auth/ # Authentication, JWT, and role validation
│ │ ├── auth.py # Registration and login logic
│ │ ├── jwt_handler.py # JWT encode/decode utilities
│ │ ├── middleware.py # Token and role-based access decorators
│ │ └── validators.py # Role validation helpers
│ │
│ ├── 📁 models/ # SQLAlchemy models
│ │ ├── user_model.py # User model (Admin, Doctor, Patient)
│ │ ├── ehr_model.py # EHR schema
│ │ └── appointment_model.py # Appointment schema
│ │
│ ├── 📁 ehr/ # EHR CRUD logic
│ │ └── ehr_crud.py
│ │
│ ├── 📁 appointments/ # Appointment booking and retrieval logic
│ │ └── appointment_crud.py
│ │
│ ├── 📁 notifications/ # Email and SMS utilities
│ │ ├── email_service.py
│ │ └── sms_service.py
│ │
│ ├── 📁 routes/ # All API route blueprints
│ │ ├── auth_routes.py
│ │ ├── admin_routes.py
│ │ ├── ehr_routes.py
│ │ ├── appointment_routes.py
│ │ └── user_routes.py
│ │
│ ├── 📁 utils/ # General helper utilities
│ │ └── helpers.py
│ │
│ ├── init.py # Application factory (Flask app creator)
│ └── extensions.py # Extensions like SQLAlchemy, Mail
│
├── 📁 instance/
│ └── healthcare.db # SQLite database (auto-created)
│
├── config.py # App configuration (uses .env)
├── run.py # App entry point for running Flask server
├── requirements.txt # Python dependencies

```
# API Endpoints

- Auth Endpoints (/api/auth)

POST /api/auth/register
Registers a new user.

Request body:
```

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword",
  "role": "admin | doctor | patient",
  "admin_secret": "SUPER_SECRET_ADMIN_KEY" // Only if role is admin
}

```