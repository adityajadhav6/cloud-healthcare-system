# app/auth/auth.py
import os
from werkzeug.security import generate_password_hash, check_password_hash
from app.auth.jwt_handler import generate_token
from app.auth.validators import VALID_ROLES
from flask import request, jsonify
from app.extensions import db
from app.models.user_model import User
from email_validator import validate_email, EmailNotValidError


def register_user():
    data = request.get_json()

    ALLOWED_FIELDS = {"name", "email", "password", "role", "admin_secret"}
    REQUIRED_FIELDS = {"name", "email", "password", "role"}

    # 🔍 Step 1: Check for unexpected fields
    extra_fields = set(data.keys()) - ALLOWED_FIELDS
    if extra_fields:
        return jsonify({"error": f"Unexpected fields: {', '.join(extra_fields)}"}), 400

    # 🔍 Step 2: Check for missing required fields
    missing_fields = REQUIRED_FIELDS - set(data.keys())
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    name = data.get("name")
    email = data.get("email").strip().lower()
    password = data.get("password")
    role = data.get("role", "").lower()
    admin_secret = data.get("admin_secret")

    # ✅ Step 3: Role validation
    if role not in VALID_ROLES:
        return jsonify({"message": f"Invalid role. Valid roles: {', '.join(VALID_ROLES)}"}), 400

      # 🔐 Step 4: Restrict public registration
    if role != "patient":
        true_secret = os.getenv("ADMIN_SECRET")
        if admin_secret != true_secret:
            return jsonify({"error": "Unauthorized to register as doctor/admin"}), 403

    # ✅ Step 5: Email uniqueness check
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    # ✅ Step 6: Secure password hashing
    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')

    new_user = User(name=name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": f"{role.capitalize()} registered successfully!"}), 201

def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(user.id, user.role)

    return jsonify({
        "token": token,
        "role": user.role,
        "name": user.name,
        "user_id": user.id
    }), 200