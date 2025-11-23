# app/routes/chatbot_routes.py

from flask import Blueprint, request, jsonify
import os
from openai import OpenAI
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user_model import User
from app.models.ehr_model import EHR
from app.models.medication_model import Medication

chatbot_routes = Blueprint("chatbot_routes", __name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_ehr_summary(ehr):
    """Build short readable EHR summary"""
    if not ehr:
        return "No EHR data found for your account."

    conditions = ehr.conditions if ehr.conditions else "None"

    return (
        f"Your EHR summary:\n"
        f"Name: {ehr.name}\n"
        f"Age: {ehr.age}\n"
        f"Gender: {ehr.gender}\n"
        f"Blood group: {ehr.blood_group}\n"
        f"Conditions: {conditions}"
    )


def build_medication_summary(meds):
    """Summarize linked medications list"""
    if not meds:
        return "No active medications listed."

    items = []
    for m in meds:
        items.append(
            f"{m.name} ({m.dosage}, {m.frequency})"
        )
    return "Medications: " + "; ".join(items)


@chatbot_routes.route("/chatbot", methods=["POST"])
@jwt_required(optional=True)
def chatbot():
    try:
        data = request.get_json() or {}
        user_input = data.get("message")

        if not user_input:
            return jsonify({"error": "Message is required"}), 400

        current_user_id = get_jwt_identity()

        # ------------------- LOAD EHR & MEDICATIONS for logged in patient -------------------
        ehr = None
        meds = None
        if current_user_id:
            ehr = EHR.query.filter_by(user_id=current_user_id).first()
            if ehr:
                # meds are linked by ehr_id (not patient_id)
                meds = Medication.query.filter_by(ehr_id=ehr.id).all()

        # ------------------- QUICK RULE: requesting EHR directly ------------------------
        ehr_keywords = ["ehr", "health record", "my record", "medical record"]

        if any(k in user_input.lower() for k in ehr_keywords):
            if not current_user_id:
                return jsonify({"reply": "Please log in to securely view your EHR."}), 200

            reply = build_ehr_summary(ehr)

            if meds:
                reply += "\n" + build_medication_summary(meds)

            return jsonify({"reply": reply}), 200

        # ------------------- DOCTORS CONTEXT ---------------------------
        doctors = User.query.filter_by(role="doctor").all()
        doctor_lines = []
        for doc in doctors:
            availability = getattr(doc, "availability", None)
            if isinstance(availability, dict):
                parts = []
                for day, hours in availability.items():
                    parts.append(f"{day.capitalize()}: {hours.get('start')}-{hours.get('end')}")
                availability_text = "; ".join(parts)
            else:
                availability_text = "Not specified"

            doctor_lines.append(f"Dr. {doc.name} – {doc.specialization} ({availability_text})")

        doctors_context = "\n".join(doctor_lines[:10])

        # ------------------- PATIENT CONTEXT BLOCK ---------------------
        patient_context = ""
        if ehr:
            patient_context += build_ehr_summary(ehr) + "\n"
        if meds:
            patient_context += build_medication_summary(meds) + "\n"

        # ------------------- SYSTEM PROMPT ----------------------
        system_prompt = (
            "You are a concise medical assistant for a healthcare patient portal. "
            "Respond in two short sentences maximum. "
            "Use provided context when relevant. No small talk or repeated phrases."
        )

        context_block = "----- CONTEXT DATA -----\n"
        context_block += "DOCTORS:\n" + doctors_context + "\n\n"
        if patient_context:
            context_block += "PATIENT DATA:\n" + patient_context + "\n"
        context_block += "------------------------"

        # -------------------- OPENAI CALL -----------------------
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "system", "content": context_block},
                {"role": "user", "content": user_input},
            ],
            max_tokens=80,
            temperature=0.3,
        )

        reply = response.choices[0].message.content.strip()

        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
