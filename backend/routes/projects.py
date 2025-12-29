from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, ProjectAssignment, User, AuditLog
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects accessible to the current user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user.role == 'admin':
        # Admin sees all projects
        projects = Project.query.all()
    else:
        # Users see only assigned projects or projects they created
        projects = Project.query.join(ProjectAssignment).filter(
            (ProjectAssignment.user_id == current_user_id) | (Project.created_by == current_user_id)
        ).distinct().all()

    return jsonify([project.to_dict() for project in projects]), 200

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get project by ID"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Check access
    if user.role != 'admin' and project.created_by != current_user_id:
        assignment = ProjectAssignment.query.filter_by(
            project_id=project_id,
            user_id=current_user_id
        ).first()
        if not assignment:
            return jsonify({'error': 'Access denied'}), 403

    return jsonify(project.to_dict()), 200

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Only admin, projektleiter, and technischer_leiter can create projects
    if user.role not in ['admin', 'projektleiter', 'technischer_leiter']:
        return jsonify({'error': 'Insufficient permissions'}), 403

    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Project name required'}), 400

    # Calculate season based on start_date if not provided
    season = data.get('season')
    if not season and data.get('start_date'):
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        month = start_date.month
        if 3 <= month <= 5:
            season = 'fruehling'
        elif 6 <= month <= 8:
            season = 'sommer'
        elif 9 <= month <= 11:
            season = 'herbst'
        else:
            season = 'winter'

    project = Project(
        name=data['name'],
        description=data.get('description'),
        location=data.get('location'),
        aufbau_datum=datetime.strptime(data['aufbau_datum'], '%Y-%m-%d') if data.get('aufbau_datum') else None,
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d') if data.get('start_date') else None,
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d') if data.get('end_date') else None,
        season=season,
        indoor_outdoor=data.get('indoor_outdoor'),
        status=data.get('status', 'planung'),
        created_by=current_user_id
    )

    db.session.add(project)
    db.session.commit()

    # Log the creation
    log = AuditLog(
        user_id=current_user_id,
        action='create_project',
        entity_type='project',
        entity_id=project.id,
        details=f'Created project: {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(project.to_dict()), 201

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Only admin, creator, or projektleiter/technischer_leiter can update
    if user.role not in ['admin', 'projektleiter', 'technischer_leiter'] and project.created_by != current_user_id:
        return jsonify({'error': 'Insufficient permissions'}), 403

    data = request.get_json()

    # Update fields
    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'location' in data:
        project.location = data['location']
    if 'aufbau_datum' in data:
        project.aufbau_datum = datetime.strptime(data['aufbau_datum'], '%Y-%m-%d') if data['aufbau_datum'] else None
    if 'start_date' in data:
        project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d') if data['start_date'] else None
    if 'end_date' in data:
        project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d') if data['end_date'] else None
    if 'season' in data:
        project.season = data['season']
    if 'indoor_outdoor' in data:
        project.indoor_outdoor = data['indoor_outdoor']
    if 'status' in data:
        project.status = data['status']

    db.session.commit()

    # Log the update
    log = AuditLog(
        user_id=current_user_id,
        action='update_project',
        entity_type='project',
        entity_id=project.id,
        details=f'Updated project: {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(project.to_dict()), 200

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Only admin can delete
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    # Log the deletion before deleting
    log = AuditLog(
        user_id=current_user_id,
        action='delete_project',
        entity_type='project',
        entity_id=project.id,
        details=f'Deleted project: {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)

    db.session.delete(project)
    db.session.commit()

    return jsonify({'message': 'Project deleted successfully'}), 200

@projects_bp.route('/<int:project_id>/assign', methods=['POST'])
@jwt_required()
def assign_user_to_project(project_id):
    """Assign a user to a project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Only admin, projektleiter, and technischer_leiter can assign users
    if user.role not in ['admin', 'projektleiter', 'technischer_leiter']:
        return jsonify({'error': 'Insufficient permissions'}), 403

    data = request.get_json()
    if not data or not data.get('user_id'):
        return jsonify({'error': 'User ID required'}), 400

    user_to_assign = User.query.get(data['user_id'])
    if not user_to_assign:
        return jsonify({'error': 'User not found'}), 404

    # Check if already assigned
    existing = ProjectAssignment.query.filter_by(
        project_id=project_id,
        user_id=data['user_id']
    ).first()

    if existing:
        return jsonify({'error': 'User already assigned to this project'}), 409

    assignment = ProjectAssignment(
        project_id=project_id,
        user_id=data['user_id'],
        assigned_by=current_user_id
    )

    db.session.add(assignment)
    db.session.commit()

    # Log the assignment
    log = AuditLog(
        user_id=current_user_id,
        action='assign_user_to_project',
        entity_type='project_assignment',
        entity_id=assignment.id,
        details=f'Assigned user {user_to_assign.username} to project {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(assignment.to_dict()), 201

@projects_bp.route('/<int:project_id>/assignments', methods=['GET'])
@jwt_required()
def get_project_assignments(project_id):
    """Get all users assigned to a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    assignments = ProjectAssignment.query.filter_by(project_id=project_id).all()
    result = []
    for assignment in assignments:
        user = User.query.get(assignment.user_id)
        result.append({
            'assignment': assignment.to_dict(),
            'user': user.to_dict() if user else None
        })

    return jsonify(result), 200

@projects_bp.route('/<int:project_id>/unassign/<int:user_id>', methods=['DELETE'])
@jwt_required()
def unassign_user_from_project(project_id, user_id):
    """Remove a user from a project"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Only admin, projektleiter, and technischer_leiter can unassign users
    if user.role not in ['admin', 'projektleiter', 'technischer_leiter']:
        return jsonify({'error': 'Insufficient permissions'}), 403

    assignment = ProjectAssignment.query.filter_by(
        project_id=project_id,
        user_id=user_id
    ).first()

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    db.session.delete(assignment)
    db.session.commit()

    return jsonify({'message': 'User unassigned successfully'}), 200
