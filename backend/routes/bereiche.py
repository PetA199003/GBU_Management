from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Bereich, BereichAssignment, User, Project, AuditLog

bereiche_bp = Blueprint('bereiche', __name__)

@bereiche_bp.route('/', methods=['GET'])
@jwt_required()
def get_bereiche():
    """Get all bereiche"""
    bereiche = Bereich.query.order_by(Bereich.sort_order).all()
    return jsonify([bereich.to_dict() for bereich in bereiche]), 200

@bereiche_bp.route('/<int:bereich_id>', methods=['GET'])
@jwt_required()
def get_bereich(bereich_id):
    """Get bereich by ID"""
    bereich = Bereich.query.get(bereich_id)
    if not bereich:
        return jsonify({'error': 'Bereich not found'}), 404
    return jsonify(bereich.to_dict()), 200

@bereiche_bp.route('/', methods=['POST'])
@jwt_required()
def create_bereich():
    """Create a new bereich (admin only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Bereich name required'}), 400

    bereich = Bereich(
        name=data['name'],
        description=data.get('description'),
        sort_order=data.get('sort_order', 0)
    )

    db.session.add(bereich)
    db.session.commit()

    # Log the creation
    log = AuditLog(
        user_id=current_user_id,
        action='create_bereich',
        entity_type='bereich',
        entity_id=bereich.id,
        details=f'Created bereich: {bereich.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(bereich.to_dict()), 201

@bereiche_bp.route('/project/<int:project_id>/assign', methods=['POST'])
@jwt_required()
def assign_bereich_to_bereichsleiter(project_id):
    """Assign a bereich to a bereichsleiter for a project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Only admin, projektleiter, and technischer_leiter can assign
    if user.role not in ['admin', 'projektleiter', 'technischer_leiter']:
        return jsonify({'error': 'Insufficient permissions'}), 403

    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    data = request.get_json()
    if not data or not data.get('bereich_id') or not data.get('bereichsleiter_id'):
        return jsonify({'error': 'Bereich ID and Bereichsleiter ID required'}), 400

    bereich = Bereich.query.get(data['bereich_id'])
    if not bereich:
        return jsonify({'error': 'Bereich not found'}), 404

    bereichsleiter = User.query.get(data['bereichsleiter_id'])
    if not bereichsleiter or bereichsleiter.role != 'bereichsleiter':
        return jsonify({'error': 'Invalid Bereichsleiter'}), 404

    # Check if already assigned
    existing = BereichAssignment.query.filter_by(
        bereich_id=data['bereich_id'],
        project_id=project_id
    ).first()

    if existing:
        # Update existing assignment
        existing.bereichsleiter_id = data['bereichsleiter_id']
        existing.assigned_by = current_user_id
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    assignment = BereichAssignment(
        bereich_id=data['bereich_id'],
        bereichsleiter_id=data['bereichsleiter_id'],
        project_id=project_id,
        assigned_by=current_user_id
    )

    db.session.add(assignment)
    db.session.commit()

    # Log the assignment
    log = AuditLog(
        user_id=current_user_id,
        action='assign_bereich',
        entity_type='bereich_assignment',
        entity_id=assignment.id,
        details=f'Assigned bereich {bereich.name} to {bereichsleiter.username} for project {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(assignment.to_dict()), 201

@bereiche_bp.route('/project/<int:project_id>/assignments', methods=['GET'])
@jwt_required()
def get_project_bereich_assignments(project_id):
    """Get all bereich assignments for a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    assignments = BereichAssignment.query.filter_by(project_id=project_id).all()
    result = []
    for assignment in assignments:
        bereich = Bereich.query.get(assignment.bereich_id)
        bereichsleiter = User.query.get(assignment.bereichsleiter_id)
        result.append({
            'assignment': assignment.to_dict(),
            'bereich': bereich.to_dict() if bereich else None,
            'bereichsleiter': bereichsleiter.to_dict() if bereichsleiter else None
        })

    return jsonify(result), 200

@bereiche_bp.route('/user/<int:user_id>/assignments', methods=['GET'])
@jwt_required()
def get_user_bereich_assignments(user_id):
    """Get all bereich assignments for a bereichsleiter"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    assignments = BereichAssignment.query.filter_by(bereichsleiter_id=user_id).all()
    result = []
    for assignment in assignments:
        bereich = Bereich.query.get(assignment.bereich_id)
        project = Project.query.get(assignment.project_id)
        result.append({
            'assignment': assignment.to_dict(),
            'bereich': bereich.to_dict() if bereich else None,
            'project': project.to_dict() if project else None
        })

    return jsonify(result), 200
