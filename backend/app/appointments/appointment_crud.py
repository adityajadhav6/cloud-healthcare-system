import json # Import the json library
from flask import request, jsonify
from app.models import Appointment, User
from app.extensions import db
from datetime import datetime

# (Helper function and other CRUD functions are below the main booking logic)

def book_appointment(current_user, data):
    try:
        if current_user.role != 'patient':
            return jsonify({"error": "Only patients can book appointments"}), 403

        doctor_id = data.get('doctor_id')
        appointment_time_str = data.get('appointment_time')
        reason = data.get('reason')

        if not all([doctor_id, appointment_time_str, reason]):
            return jsonify({"error": "Doctor ID, appointment time, and reason are required"}), 400

        doctor = User.query.filter_by(id=doctor_id, role='doctor').first()
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404
        
        # --- NEW: Availability Validation Logic ---
        if not doctor.availability:
            return jsonify({"error": "This doctor has not specified their availability."}), 400
            
        try:
            availability_data = json.loads(doctor.availability)
        except json.JSONDecodeError:
            return jsonify({"error": "Doctor's availability is incorrectly configured."}), 500

        if appointment_time_str.endswith('Z'):
            appointment_time_str = appointment_time_str.replace('Z', '+00:00')
            
        appointment_time = datetime.fromisoformat(appointment_time_str)
        
        # Get the day of the week (e.g., 'monday', 'tuesday')
        weekday_name = appointment_time.strftime('%A').lower()

        if weekday_name not in availability_data:
            return jsonify({"error": f"Doctor is not available on {weekday_name.capitalize()}s."}), 400
        
        # Check if the time is within the doctor's available slot
        slot = availability_data[weekday_name]
        start_time = datetime.strptime(slot['start'], '%H:%M').time()
        end_time = datetime.strptime(slot['end'], '%H:%M').time()
        
        if not (start_time <= appointment_time.time() <= end_time):
            return jsonify({"error": f"Appointment time is outside the doctor's availability ({slot['start']} - {slot['end']})."}), 400
        # --- End of Validation Logic ---

        new_appointment = Appointment(
            patient_id=current_user.id,
            doctor_id=doctor.id,
            appointment_time=appointment_time,
            reason=reason,
            status='Scheduled'
        )

        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({
            "message": "Appointment booked successfully", 
            "appointment_id": new_appointment.id
        }), 201

    except (ValueError, TypeError) as e:
        print(f"Datetime parsing error: {e}")
        return jsonify({"error": "Invalid datetime format. Please use ISO format."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500


# --- Other CRUD functions (unchanged) ---

def _serialize_appointment(appt):
    return {
        "id": appt.id,
        "doctor_id": appt.doctor_id,
        "patient_id": appt.patient_id,
        "appointment_time": appt.appointment_time.isoformat(),
        "reason": appt.reason,
        "status": appt.status
    }

def get_patient_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(patient_id=current_user.id).order_by(Appointment.appointment_time.asc()).all()
        result = [_serialize_appointment(a) for a in appointments]
        return jsonify({"appointments": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_doctor_appointments(current_user):
    try:
        appointments = Appointment.query.filter_by(doctor_id=current_user.id).order_by(Appointment.appointment_time.asc()).all()
        result = [_serialize_appointment(a) for a in appointments]
        return jsonify({"appointments": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def update_appointment_status(current_user, appointment_id, data):
    try:
        if current_user.role != 'doctor':
            return jsonify({"error": "Only doctors can update appointments"}), 403
        appointment = Appointment.query.get(appointment_id)
        if not appointment or appointment.doctor_id != current_user.id:
            return jsonify({"error": "Appointment not found or you are not authorized to edit it"}), 404
        new_status = data.get('status')
        if new_status not in ['Scheduled', 'Completed', 'Cancelled']:
            return jsonify({"error": f"Invalid status."}), 400
        appointment.status = new_status
        db.session.commit()
        return jsonify({"message": "Status updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def cancel_appointment(current_user, appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({"error": "Appointment not found"}), 404
        if appointment.patient_id != current_user.id:
            return jsonify({"error": "Unauthorized: You can only cancel your own appointments"}), 403
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"message": f"Appointment with ID {appointment_id} has been successfully cancelled."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An internal error occurred", "details": str(e)}), 500