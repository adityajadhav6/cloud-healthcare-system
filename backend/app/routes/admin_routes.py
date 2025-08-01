# app/routes/admin_routes.py

from flask import Blueprint, jsonify
from app.models.user_model import User
from app.models.ehr_model import EHR
from app.extensions import db
from app.auth.middleware import token_required, role_required

admin_routes = Blueprint('admin_routes', __name__)

# ✅ View all doctors
@admin_routes.route('/doctors', methods=['GET'])
@token_required
@role_required('admin')
def get_all_doctors(current_user):
    doctors = User.query.filter_by(role='doctor').all()
    result = [{
        "id": doctor.id,
        "name": doctor.name,
        "email": doctor.email
    } for doctor in doctors]
    return jsonify(result), 200

# ✅ View all patients
@admin_routes.route('/patients', methods=['GET'])
@token_required
@role_required('admin')
def get_all_patients(current_user):
    patients = User.query.filter_by(role='patient').all()
    result = [{
        "id": patient.id,
        "name": patient.name,
        "email": patient.email
    } for patient in patients]
    return jsonify(result), 200

# ✅ View all EHRs
@admin_routes.route('/ehrs', methods=['GET'])
@token_required
@role_required('admin')
def get_all_ehrs(current_user):
    ehrs = EHR.query.all()
    result = []
    for ehr in ehrs:
        result.append({
            "ehr_id": ehr.id,
            "patient_id": ehr.user_id,
            "doctor_id": ehr.created_by,
            "name": ehr.name,
            "age": ehr.age,
            "gender": ehr.gender,
            "blood_group": ehr.blood_group,
            "conditions": ehr.conditions,
            "medications": ehr.medications
        })
    return jsonify(result), 200

# ✅ Delete doctor
@admin_routes.route('/doctor/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_doctor(current_user, user_id):
    user = User.query.filter_by(id=user_id, role='doctor').first()
    if not user:
        return jsonify({"error": "Doctor not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Doctor deleted successfully"}), 200

# ✅ Delete patient
@admin_routes.route('/patient/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_patient(current_user, user_id):
    user = User.query.filter_by(id=user_id, role='patient').first()
    if not user:
        return jsonify({"error": "Patient not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Patient deleted successfully"}), 200

# ✅ Delete any EHR by ID
@admin_routes.route('/ehr/<int:ehr_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_any_ehr(current_user, ehr_id):
    ehr = EHR.query.get(ehr_id)
    if not ehr:
        return jsonify({"error": "EHR not found"}), 404
    db.session.delete(ehr)
    db.session.commit()
    return jsonify({"message": "EHR deleted successfully"}), 200
