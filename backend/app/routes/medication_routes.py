from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_current_user, get_jwt_identity, get_jwt
from app.models import User, EHR, Medication
from app.extensions import db
import logging

logger = logging.getLogger("medication_routes")

medication_bp = Blueprint('medication_bp', __name__, url_prefix='/api/medications')


@medication_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_medications():
    """
    Endpoint for a PATIENT to retrieve their OWN medication list.
    """
    current_user = get_current_user()
    if current_user.role != 'patient':
        return jsonify({"msg": "Access forbidden: Patients only"}), 403

    # Find all medications associated with the patient's EHR records
    medications = Medication.query.join(EHR).filter(EHR.user_id == current_user.id).order_by(Medication.start_date.desc()).all()

    medication_list = [
        {
            "id": med.id,
            "name": med.name,
            "dosage": med.dosage,
            "frequency": med.frequency,
            "start_date": med.start_date.isoformat(),
            "end_date": med.end_date.isoformat() if med.end_date else None,
            "prescribed_by_doctor_id": med.prescribed_by_id
        } for med in medications
    ]
    
    return jsonify({"medications": medication_list}), 200


@medication_bp.route('/', methods=['POST'])
@jwt_required()
def create_medication():
    """
    Endpoint for a DOCTOR to prescribe a new medication for a patient's EHR.
    """
    current_user = get_current_user()
    if current_user.role != 'doctor':
        return jsonify({"msg": "Access forbidden: Doctors only"}), 403

    data = request.get_json()
    ehr_id = data.get('ehr_id')
    name = data.get('name')
    dosage = data.get('dosage')
    frequency = data.get('frequency')

    if not all([ehr_id, name, dosage, frequency]):
        return jsonify({"error": "Missing required fields: ehr_id, name, dosage, frequency"}), 400

    ehr = EHR.query.get(ehr_id)
    if not ehr:
        return jsonify({"error": f"EHR record with id {ehr_id} not found"}), 404

    try:
        new_medication = Medication(
            ehr_id=ehr_id,
            prescribed_by_id=current_user.id,
            name=name,
            dosage=dosage,
            frequency=frequency,
            notes=data.get('notes')
        )
        
        db.session.add(new_medication)
        db.session.commit()

        return jsonify({
            "message": "Medication created successfully",
            "medication": {
                "id": new_medication.id,
                "name": new_medication.name,
                "dosage": new_medication.dosage,
                "frequency": new_medication.frequency,
                "start_date": new_medication.start_date.isoformat(),
                "prescribed_by_doctor_id": new_medication.prescribed_by_id
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An internal error occurred while creating medication", "details": str(e)}), 500


# --- ✅ NEW ENDPOINT ADDED ---
@medication_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_medications_for_patient(patient_id):
    """
    Endpoint for a DOCTOR or ADMIN to retrieve a specific patient's medication list.
    """
    current_user = get_current_user()
    if current_user.role not in ['doctor', 'admin']:
        return jsonify({"msg": "Access forbidden: Doctors or Admins only"}), 403

    # Check if the patient exists
    patient = User.query.get(patient_id)
    if not patient or patient.role != 'patient':
        return jsonify({"error": "Patient not found"}), 404

    # Find all medications associated with the patient's EHR records
    medications = Medication.query.join(EHR).filter(EHR.user_id == patient_id).order_by(Medication.start_date.desc()).all()

    medication_list = [
        {
            "id": med.id,
            "name": med.name,
            "dosage": med.dosage,
            "frequency": med.frequency,
            "start_date": med.start_date.isoformat(),
            "end_date": med.end_date.isoformat() if med.end_date else None,
            "prescribed_by_doctor_id": med.prescribed_by_id
        } for med in medications
    ]
    
    return jsonify({"medications": medication_list}), 200


@medication_bp.route("/admin/<int:medication_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_medication(medication_id):
    try:
        # Ensure the user is an admin
        jwt_claims = get_jwt()
        current_user_role = jwt_claims.get("role")
        if current_user_role != "admin":
            return jsonify({"error": "Unauthorized access."}), 403

        # Find the medication by ID
        medication = Medication.query.get(medication_id)
        if not medication:
            return jsonify({"error": "Medication not found."}), 404

        # Delete the medication
        db.session.delete(medication)
        db.session.commit()

        return jsonify({"message": "Medication deleted successfully."}), 200
    except Exception as e:
        logger.error(f"Error deleting medication with ID {medication_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal error occurred. Please try again later."}), 500