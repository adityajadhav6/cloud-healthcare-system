# backend/app/routes/admin_routes.py

from flask import Blueprint, jsonify
from app.models import User, EHR, Appointment
from app.extensions import db
# REMOVED: Old middleware import
# from app.auth.middleware import token_required, role_required 

# ADDED: New imports for modern JWT handling
from flask_jwt_extended import jwt_required, get_current_user

admin_routes = Blueprint('admin_routes', __name__)

# Helper function for role checking
def admin_required():
    current_user = get_current_user()
    if current_user.role != 'admin':
        return jsonify({"msg": "Admins only!"}), 403
    return None

@admin_routes.route('/doctors', methods=['GET'])
@jwt_required() # USE new decorator
def get_all_doctors():
    # ADDED: Role check inside the function
    admin_error = admin_required()
    if admin_error:
        return admin_error
        
    doctors = User.query.filter_by(role='doctor').all()
    result = [{"id": doctor.id, "name": doctor.name, "email": doctor.email} for doctor in doctors]
    return jsonify(result), 200

@admin_routes.route('/patients', methods=['GET'])
@jwt_required() # USE new decorator
def get_all_patients():
    admin_error = admin_required()
    if admin_error:
        return admin_error

    patients = User.query.filter_by(role='patient').all()
    result = [{"id": patient.id, "name": patient.name, "email": patient.email} for patient in patients]
    return jsonify(result), 200

@admin_routes.route('/ehrs', methods=['GET'])
@jwt_required() # USE new decorator
def get_all_ehrs():
    admin_error = admin_required()
    if admin_error:
        return admin_error

    ehrs = EHR.query.all()
    result = [{
        "ehr_id": ehr.id,
        "patient_id": ehr.user_id,
        "doctor_id": ehr.created_by,
        "name": ehr.name,
        "age": ehr.age,
        "gender": ehr.gender,
        "blood_group": ehr.blood_group,
        "conditions": ehr.conditions,
        # "medications": ehr.medications # FIXED: Removed this as it no longer exists on the EHR model
    } for ehr in ehrs]
    return jsonify(result), 200

@admin_routes.route('/doctor/<int:user_id>', methods=['DELETE'])
@jwt_required() # USE new decorator
def delete_doctor(user_id):
    admin_error = admin_required()
    if admin_error:
        return admin_error
        
    user = User.query.filter_by(id=user_id, role='doctor').first()
    if not user:
        return jsonify({"error": "Doctor not found"}), 404
    
    # This logic is preserved
    Appointment.query.filter_by(doctor_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Doctor deleted successfully"}), 200

@admin_routes.route('/patient/<int:user_id>', methods=['DELETE'])
@jwt_required() # USE new decorator
def delete_patient(user_id):
    admin_error = admin_required()
    if admin_error:
        return admin_error

    user = User.query.filter_by(id=user_id, role='patient').first()
    if not user:
        return jsonify({"error": "Patient not found"}), 404
    
    # This logic is preserved
    Appointment.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Patient deleted successfully"}), 200

@admin_routes.route('/ehr/<int:ehr_id>', methods=['DELETE'])
@jwt_required() # USE new decorator
def delete_any_ehr(ehr_id):
    admin_error = admin_required()
    if admin_error:
        return admin_error

    ehr = EHR.query.get(ehr_id)
    if not ehr:
        return jsonify({"error": "EHR not found"}), 404

    db.session.delete(ehr)
    db.session.commit()
    return jsonify({"message": "EHR deleted successfully"}), 200