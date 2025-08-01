# Folder Structure

backend/
│
├── app/
│   ├── auth/               # Auth and JWT logic
│   ├── models/             # SQLAlchemy ORM models
│   ├── ehr/                # EHR CRUD logic
│   ├── appointments/       # Appointment logic
│   ├── routes/             # API route blueprints
│   ├── notifications/      # Email/SMS (modular)
│   └── utils/              # Helper functions
│
├── instance/               # SQLite database (healthcare.db)
├── config.py               # Environment and config management
├── requirements.txt        # Python dependencies
└── run.py                  # App runner

# API Endpoints

- Auth Endpoints (/api/auth)

POST /api/auth/register
Registers a new user.

Request body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword",
  "role": "admin | doctor | patient",
  "admin_secret": "SUPER_SECRET_ADMIN_KEY" // Only if role is admin
}
