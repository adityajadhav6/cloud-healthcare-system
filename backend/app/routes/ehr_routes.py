# app/routes/ehr_routes.py
from flask import Blueprint, request, jsonify
from app.models.ehr_model import EHR  # <-- ADD THIS LINE

from app.ehr.ehr_crud import (
    create_ehr_record,
    get_ehr_records,
    update_ehr_record,
    delete_ehr_record,
    search_ehr_record
)
from app.auth.middleware import token_required, role_required

ehr_bp = Blueprint('ehr', __name__)

@ehr_bp.route('/create', methods=['POST'])
@token_required
@role_required('doctor')
def create_record(current_user):
    data = request.get_json()
    return create_ehr_record(current_user, data)

@ehr_bp.route('/list', methods=['GET'])
@token_required
@role_required('doctor')
def list_records(current_user):
    return get_ehr_records(current_user)

@ehr_bp.route('/update/<int:ehr_id>', methods=['PUT'])
@token_required
@role_required('doctor')  # Optional: adjust access logic if patients can update their own
def update_record(current_user, ehr_id):
    data = request.get_json()
    return update_ehr_record(current_user, ehr_id, data)

@ehr_bp.route('/delete/<int:ehr_id>', methods=['DELETE'])
@token_required
@role_required('doctor')  # Optional: adjust if patients can delete their own
def delete_record(current_user, ehr_id):
    return delete_ehr_record(current_user, ehr_id)

@ehr_bp.route('/search', methods=['POST'])
@token_required
def search_records_post(current_user):
    return search_ehr_record(current_user)
