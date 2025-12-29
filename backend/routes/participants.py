from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Participant, Project, User, AuditLog
from datetime import datetime
import csv
import io

participants_bp = Blueprint('participants', __name__)

@participants_bp.route('/project/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project_participants(project_id):
    """Get all participants for a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    participants = Participant.query.filter_by(project_id=project_id).all()
    return jsonify([p.to_dict() for p in participants]), 200

@participants_bp.route('/', methods=['POST'])
@jwt_required()
def create_participant():
    """Create a new participant"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('project_id'):
        return jsonify({'error': 'Project ID required'}), 400

    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    participant = Participant(
        project_id=data['project_id'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        position=data.get('position'),
        company=data.get('company')
    )

    db.session.add(participant)
    db.session.commit()

    return jsonify(participant.to_dict()), 201

@participants_bp.route('/<int:participant_id>', methods=['PUT'])
@jwt_required()
def update_participant(participant_id):
    """Update a participant"""
    participant = Participant.query.get(participant_id)
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    data = request.get_json()

    if 'first_name' in data:
        participant.first_name = data['first_name']
    if 'last_name' in data:
        participant.last_name = data['last_name']
    if 'email' in data:
        participant.email = data['email']
    if 'position' in data:
        participant.position = data['position']
    if 'company' in data:
        participant.company = data['company']

    db.session.commit()

    return jsonify(participant.to_dict()), 200

@participants_bp.route('/<int:participant_id>', methods=['DELETE'])
@jwt_required()
def delete_participant(participant_id):
    """Delete a participant"""
    participant = Participant.query.get(participant_id)
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({'message': 'Participant deleted successfully'}), 200

@participants_bp.route('/project/<int:project_id>/import-csv', methods=['POST'])
@jwt_required()
def import_participants_csv(project_id):
    """Import participants from CSV file"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400

    try:
        # Read CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        imported_count = 0
        errors = []

        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Expected columns: first_name, last_name, email, position, company
                participant = Participant(
                    project_id=project_id,
                    first_name=row.get('first_name', '').strip(),
                    last_name=row.get('last_name', '').strip(),
                    email=row.get('email', '').strip(),
                    position=row.get('position', '').strip(),
                    company=row.get('company', '').strip(),
                    imported_from_csv=True
                )
                db.session.add(participant)
                imported_count += 1
            except Exception as e:
                errors.append(f'Row {row_num}: {str(e)}')

        db.session.commit()

        # Log the import
        log = AuditLog(
            user_id=current_user_id,
            action='import_participants_csv',
            entity_type='participant',
            entity_id=project_id,
            details=f'Imported {imported_count} participants for project {project.name}',
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({
            'message': f'Successfully imported {imported_count} participants',
            'imported_count': imported_count,
            'errors': errors
        }), 201

    except Exception as e:
        return jsonify({'error': f'Failed to import CSV: {str(e)}'}), 500

@participants_bp.route('/<int:participant_id>/sign', methods=['POST'])
@jwt_required()
def sign_participant(participant_id):
    """Add digital signature for a participant"""
    participant = Participant.query.get(participant_id)
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    data = request.get_json()

    if not data or not data.get('signature_data'):
        return jsonify({'error': 'Signature data required'}), 400

    participant.signature_data = data['signature_data']
    participant.signature_type = 'digital'
    participant.signed_at = datetime.utcnow()

    db.session.commit()

    return jsonify(participant.to_dict()), 200

@participants_bp.route('/<int:participant_id>/mark-analog-signed', methods=['POST'])
@jwt_required()
def mark_analog_signed(participant_id):
    """Mark participant as signed with analog signature"""
    participant = Participant.query.get(participant_id)
    if not participant:
        return jsonify({'error': 'Participant not found'}), 404

    participant.signature_type = 'analog'
    participant.signed_at = datetime.utcnow()

    db.session.commit()

    return jsonify(participant.to_dict()), 200
