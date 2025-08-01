from flask import Blueprint, request
from app.auth.middleware import token_required, role_required
from app.appointments.appointment_crud import (
    book_appointment,
    get_patient_appointments,
    get_doctor_appointments,
    update_appointment_status
)

appointment_bp = Blueprint('appointments', __name__)

@appointment_bp.route('/book', methods=['POST'])
@token_required
@role_required('patient')
def book(current_user):
    data = request.get_json()
    return book_appointment(current_user, data)

@appointment_bp.route('/patient', methods=['GET'])
@token_required
@role_required('patient')
def view_patient_appointments(current_user):
    return get_patient_appointments(current_user)

@appointment_bp.route('/doctor', methods=['GET'])
@token_required
@role_required('doctor')
def view_doctor_appointments(current_user):
    return get_doctor_appointments(current_user)

@appointment_bp.route('/<int:appointment_id>/status', methods=['PUT'])
@token_required
@role_required('doctor')
def update_status(current_user, appointment_id):
    data = request.get_json()
    return update_appointment_status(current_user, appointment_id, data)
