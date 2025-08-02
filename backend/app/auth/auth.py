# app/auth/auth.py
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask import request, jsonify
from app.auth.jwt_handler import generate_token
from app.auth.validators import VALID_ROLES
from app.extensions import db
from app.models.user_model import User
from email_validator import validate_email, EmailNotValidError

# --- Constants for better readability and maintainability ---
ALLOWED_REGISTER_FIELDS = {"name", "email", "password", "role", "admin_secret"}
REQUIRED_REGISTER_FIELDS = {"name", "email", "password", "role"}


def _validate_registration_data(data):
    """
    Performs field and basic data validation for user registration.
    Returns a tuple: (error_response, status_code) or (None, None) on success.
    """
    # 🔍 Step 1: Check for unexpected fields
    extra_fields = set(data.keys()) - ALLOWED_REGISTER_FIELDS
    if extra_fields:
        return jsonify({"error": f"Unexpected fields: {', '.join(extra_fields)}"}), 400

    # 🔍 Step 2: Check for missing required fields
    missing_fields = REQUIRED_REGISTER_FIELDS - set(data.keys())
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    email = data.get("email", "").strip().lower()
    role = data.get("role", "").lower()
    
    # ✅ Step 3: Validate email format
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    # ✅ Step 4: Role validation
    if role not in VALID_ROLES:
        return jsonify({"message": f"Invalid role. Valid roles: {', '.join(VALID_ROLES)}"}), 400

    return None, None


def register_user():
    """Handles new user registration with robust validation and security checks."""
    data = request.get_json()

    # Consolidate validation into a helper function for a cleaner main function
    error_response, status_code = _validate_registration_data(data)
    if error_response:
        return error_response, status_code

    name = data.get("name")
    email = data.get("email").strip().lower()
    password = data.get("password")
    role = data.get("role", "").lower()
    admin_secret = data.get("admin_secret")

    # ✅ Step 5: Admin/Doctor role protection (Consolidated logic)
    # Only 'patient' can register without the admin secret.
    if role != "patient":
        true_secret = os.getenv("ADMIN_SECRET")
        if not true_secret or admin_secret != true_secret:
            return jsonify({"error": f"Unauthorized to register as {role}"}), 403

    # ✅ Step 6: Email uniqueness check
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # ✅ Step 7: Secure password hashing
    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')

    # ✅ Step 8: Create and save the new user
    new_user = User(name=name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role.capitalize()} registered successfully!"}), 201


def login_user():
    """Handles user login and token generation."""
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # ✅ Step 1: Basic input validation
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # ✅ Step 2: Retrieve user and verify credentials
    # Sanitize email before querying for consistency
    user = User.query.filter_by(email=email.strip().lower()).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # ✅ Step 3: Generate and return JWT token
    token = generate_token(user.id, user.role)

    return jsonify({
        "token": token,
        "role": user.role,
        "name": user.name,
        "user_id": user.id
    }), 200