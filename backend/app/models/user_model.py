# app/models/user_model.py

from app.extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    # Add both relationships and tell SQLAlchemy which FK to use
    patient_ehrs = db.relationship('EHR', backref='patient', lazy=True, foreign_keys='EHR.user_id')
    doctor_ehrs = db.relationship('EHR', backref='doctor', lazy=True, foreign_keys='EHR.created_by')
