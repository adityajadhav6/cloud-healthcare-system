from flask import request, jsonify
from app.models.appointment_model import Appointment
from app.models.user_model import User
from app.extensions import db
from datetime import datetime

# Book an appointment (only patient)
def book_appointment(current_user, data):
    try:
        if current_user.role != 'patient':
            return jsonify({"error": "Only patients can book appointments"}), 403

        doctor_id = data.get('doctor_id')
        appointment_time_str = data.get('appointment_time')

        if not doctor_id or not appointment_time_str:
            return jsonify({"error": "Doctor ID and appointment time required"}), 400

        doctor = User.query.filter_by(id=doctor_id, role='doctor').first()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404

        appointment_time = datetime.fromisoformat(appointment_time_str)

        appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=doctor.id,
            appointment_time=appointment_time,
        )

        db.session.add(appointment)
        db.session.commit()

        return jsonify({"message": "Appointment booked", "appointment_id": appointment.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# View appointments for patient
def get_patient_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(patient_id=current_user.id).all()
        return jsonify([serialize_appt(a) for a in appointments]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# View appointments for doctor
def get_doctor_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(doctor_id=current_user.id).all()
        return jsonify([serialize_appt(a) for a in appointments]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Update appointment status (doctor only)
def update_appointment_status(current_user, appointment_id, data):
    try:
        if current_user.role != 'doctor':
            return jsonify({"error": "Only doctors can update appointments"}), 403

        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != current_user.id:
            return jsonify({"error": "Appointment not found or unauthorized"}), 404

        new_status = data.get('status')
        if new_status not in ['Confirmed', 'Cancelled']:
            return jsonify({"error": "Invalid status"}), 400

        appointment.status = new_status
        db.session.commit()

        return jsonify({"message": "Status updated"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Helper function
def serialize_appt(appt):
    return {
        "id": appt.id,
        "doctor_id": appt.doctor_id,
        "patient_id": appt.patient_id,
        "appointment_time": appt.appointment_time.isoformat(),
        "status": appt.status
    }
