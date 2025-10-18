from flask import Blueprint, request, jsonify
from app.ehr.ehr_crud import (
    create_ehr_record,
    get_ehr_records,
    update_ehr_record,
    delete_ehr_record,
    search_ehr_record
)
# REMOVE old middleware import
# from app.auth.middleware import token_required, role_required 

# ADD new imports from Flask-JWT-Extended
from flask_jwt_extended import jwt_required, get_current_user

ehr_bp = Blueprint('ehr_bp', __name__) # Renamed for clarity to avoid conflict with ehr_bp in __init__.py

# Note: The url_prefix is handled in app/__init__.py, so we can define routes from the root.

@ehr_bp.route('/create', methods=['POST'])
@jwt_required() # USE the new decorator
def create_record():
    # GET the user object provided by the decorator
    current_user = get_current_user() 
    data = request.get_json()
    return create_ehr_record(current_user, data)

@ehr_bp.route('/list', methods=['GET'])
@jwt_required() # USE the new decorator
def list_records():
    current_user = get_current_user()
    return get_ehr_records(current_user)

@ehr_bp.route('/update/<int:ehr_id>', methods=['PUT'])
@jwt_required() # USE the new decorator
def update_record(ehr_id):
    current_user = get_current_user()
    data = request.get_json()
    return update_ehr_record(current_user, ehr_id, data)

@ehr_bp.route('/delete/<int:ehr_id>', methods=['DELETE'])
@jwt_required() # USE the new decorator
def delete_record(ehr_id):
    current_user = get_current_user()
    return delete_ehr_record(current_user, ehr_id)

@ehr_bp.route('/search', methods=['POST'])
@jwt_required() # USE the new decorator
def search_records_post():
    current_user = get_current_user()
    return search_ehr_record(current_user)

@ehr_bp.route('/', methods=['GET'])
@jwt_required() # USE the new decorator
def get_patient_ehr_default():
    current_user = get_current_user()
    # The get_ehr_records function already handles role logic for patients
    return get_ehr_records(current_user)