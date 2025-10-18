import json # Import the json library
from flask import Blueprint, jsonify
from app.models.user_model import User

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/doctors', methods=['GET'])
def get_all_doctors():
    doctors = User.query.filter_by(role='doctor').all()
    # UPDATED: Parse the availability string into a JSON object for the frontend
    return jsonify([
        {
            "id": doctor.id,
            "name": doctor.name,
            "specialization": doctor.specialization or "General Physician",
            "availability": json.loads(doctor.availability) if doctor.availability else None
        } for doctor in doctors
    ]), 200

@user_routes.route('/api/users/patients', methods=['GET'])
def get_all_patients():
    patients = User.query.filter_by(role='patient').all()
    return jsonify([
        {
            "id": patient.id,
            "name": patient.name,
            "email": patient.email
        } for patient in patients
    ]), 200