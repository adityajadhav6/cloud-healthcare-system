# app/ehr/ehr_crud.py

import json
from flask import jsonify, request
from app.models.ehr_model import EHR
from app.extensions import db
from app.notifications.email_service import send_email
from app.models.user_model import User
from sqlalchemy import func



def get_ehr_records(current_user):
    try:
        # Query all EHRs for the logged-in user
        ehr_records = EHR.query.filter_by(created_by=current_user.id).all()

        # Format the response
        ehr_list = []
        for record in ehr_records:
            ehr_list.append({
                "id": record.id,
                "name": record.name,
                "age": record.age,
                "gender": record.gender,
                "blood_group": record.blood_group,
                "conditions": json.loads(record.conditions) if record.conditions else [],
                "medications": json.loads(record.medications) if record.medications else []
            })

        return jsonify({"ehrs": ehr_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def update_ehr_record(current_user, ehr_id, data):
    try:
        ehr = EHR.query.filter_by(id=ehr_id).first()

        if not ehr:
            return jsonify({"error": "EHR record not found"}), 404

        # ✅ Only the doctor who created it can edit
        if current_user.role == 'doctor' and ehr.created_by != current_user.id:
            return jsonify({"error": "Unauthorized: You did not create this EHR"}), 403

        ehr.name = data.get('name', ehr.name)
        ehr.age = data.get('age', ehr.age)
        ehr.gender = data.get('gender', ehr.gender)
        ehr.blood_group = data.get('blood_group', ehr.blood_group)
        ehr.conditions = json.dumps(data.get('conditions')) if data.get('conditions') else ehr.conditions
        ehr.medications = json.dumps(data.get('medications')) if data.get('medications') else ehr.medications

        db.session.commit()

        return jsonify({"message": "EHR updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    

def delete_ehr_record(current_user, ehr_id):
    try:
        ehr = EHR.query.filter_by(id=ehr_id).first()

        if not ehr:
            return jsonify({"error": "EHR record not found"}), 404

        # ✅ Only the doctor who created it can delete
        if current_user.role == 'doctor' and ehr.created_by != current_user.id:
            return jsonify({"error": "Unauthorized: You did not create this EHR"}), 403

        db.session.delete(ehr)
        db.session.commit()

        return jsonify({"message": "EHR deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



def create_ehr_record(current_user, data):
    try:
        if current_user.role != 'doctor':
            return jsonify({"error": "Only doctors can create EHRs"}), 403

        patient_id = data.get('patient_id')
        if not patient_id:
            return jsonify({"error": "Patient ID is required"}), 400

        patient = User.query.filter_by(id=patient_id, role='patient').first()
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # ✅ Prevent duplicate EHR
        existing_ehr = EHR.query.filter_by(user_id=patient.id).first()
        if existing_ehr:
            return jsonify({
                "error": f"EHR already exists for patient (ID: {patient.id}, Name: {patient.name})"
            }), 400

        # Create new EHR
        new_record = EHR(
            user_id=patient.id,
            created_by=current_user.id,
            name=data.get('name'),
            age=data.get('age'),
            gender=data.get('gender'),
            blood_group=data.get('blood_group'),
            conditions=json.dumps(data.get('conditions')),
            medications=json.dumps(data.get('medications'))
        )

        db.session.add(new_record)
        db.session.commit()

        # ✅ Optional: send notification
        send_email(
            recipient=patient.email,
            subject="New EHR Created",
            body=f"Hi {patient.name}, your EHR record (ID: {new_record.id}) has been created by Dr. {current_user.name}."
        )

        return jsonify({
            "message": "EHR created successfully",
            "ehr_id": new_record.id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def search_ehr_record(current_user):
    try:
        data = request.get_json() or {}

        # Role-based filtering
        if current_user.role == 'patient':
            query = EHR.query.filter_by(user_id=current_user.id)
        elif current_user.role in ['doctor', 'admin']:
            query = (
                EHR.query.filter_by(created_by=current_user.id)
                if current_user.role == 'doctor'
                else EHR.query  # Admin can access all
            )
        else:
            return jsonify({"error": "Unauthorized role for searching EHRs"}), 403


        # Filters...

        name = data.get('name')
        blood_group = data.get('blood_group')
        gender = data.get('gender')
        condition = data.get('condition')
        min_age = data.get('min_age')
        max_age = data.get('max_age')

        if name:
            query = query.filter(EHR.name.ilike(f"%{name}%"))
        if blood_group:
            query = query.filter(db.func.lower(EHR.blood_group) == blood_group.lower())
        if gender:
            query = query.filter(EHR.gender.ilike(gender))
        if min_age is not None:
            query = query.filter(EHR.age >= int(min_age))
        if max_age is not None:
            query = query.filter(EHR.age <= int(max_age))

        all_results = query.all()

        # ✅ Filter condition if provided
        if condition:
            filtered = []
            for ehr in all_results:
                try:
                    ehr_conditions = json.loads(ehr.conditions or "[]")
                    if any(condition.lower() in c.lower() for c in ehr_conditions):
                        filtered.append(ehr)
                except:
                    continue
            results = filtered
        else:
            results = all_results

        ehr_list = []
        for ehr in results:
            ehr_list.append({
                "id": ehr.id,
                "name": ehr.name,
                "age": ehr.age,
                "gender": ehr.gender,
                "blood_group": ehr.blood_group,
                "conditions": json.loads(ehr.conditions or "[]"),
                "medications": json.loads(ehr.medications or "[]")
            })

        return jsonify({"results": ehr_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
