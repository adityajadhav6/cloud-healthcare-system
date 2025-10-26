from flask import Blueprint, jsonify
from app.models import User, EHR, Appointment
from app.extensions import db
from flask_jwt_extended import jwt_required, get_current_user

admin_routes = Blueprint('admin_routes', __name__)

# Helper function for role checking (still used by other routes)
def admin_required():
    current_user = get_current_user()
    if current_user.role != 'admin':
        return jsonify({"msg": "Admins only!"}), 403
    return None

@admin_routes.route('/doctors', methods=['GET'])
@jwt_required()
def get_all_doctors():
    admin_error = admin_required()
    if admin_error:
        return admin_error
        
    doctors = User.query.filter_by(role='doctor').all()
    result = [{"id": doctor.id, "name": doctor.name, "email": doctor.email} for doctor in doctors]
    return jsonify(result), 200

# --- ✅ UPDATED THIS FUNCTION ---
@admin_routes.route('/patients', methods=['GET'])
@jwt_required()
def get_all_patients():
    # 1. REMOVED admin_required() check
    # admin_error = admin_required()
    # if admin_error:
    #     return admin_error

    # 2. ADDED check for 'admin' OR 'doctor' role
    current_user = get_current_user()
    if current_user.role not in ['admin', 'doctor']:
        return jsonify({"msg": "Admin or Doctor access required!"}), 403

    patients = User.query.filter_by(role='patient').all()
    result = [{"id": patient.id, "name": patient.name, "email": patient.email} for patient in patients]
    return jsonify(result), 200
# --- END OF UPDATE ---

@admin_routes.route('/ehrs', methods=['GET'])
@jwt_required()
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
    } for ehr in ehrs]
    return jsonify(result), 200

@admin_routes.route('/doctor/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_doctor(user_id):
    admin_error = admin_required()
    if admin_error:
        return admin_error
        
    user = User.query.filter_by(id=user_id, role='doctor').first()
    if not user:
        return jsonify({"error": "Doctor not found"}), 404
    
    Appointment.query.filter_by(doctor_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Doctor deleted successfully"}), 200

@admin_routes.route('/patient/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(user_id):
    admin_error = admin_required()
    if admin_error:
        return admin_error

    user = User.query.filter_by(id=user_id, role='patient').first()
    if not user:
        return jsonify({"error": "Patient not found"}), 404
    
    Appointment.query.filter_by(patient_id=user_id).delete() # Assuming 'patient_id' is the correct FK
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Patient deleted successfully"}), 200

@admin_routes.route('/ehr/<int:ehr_id>', methods=['DELETE'])
@jwt_required()
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

@admin_routes.route('/appointments', methods=['GET'])
@jwt_required()
def get_all_appointments():
    admin_error = admin_required()
    if admin_error:
        return admin_error

    appointments = Appointment.query.all()
    result = [{
        "id": appt.id,
        "patient_id": appt.patient_id,
        "doctor_id": appt.doctor_id,
        "appointment_time": appt.appointment_time.isoformat(),
        "status": appt.status,
        "reason": appt.reason
    } for appt in appointments]
    return jsonify(result), 200