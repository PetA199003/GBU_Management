from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, AuditLog
from functools import wraps

users_bp = Blueprint('users', __name__)

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users"""
    users = User.query.filter_by(active=True).all()
    return jsonify([user.to_dict() for user in users]), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict()), 200

@users_bp.route('/', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin only)"""
    data = request.get_json()

    required_fields = ['username', 'email', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    # Validate role
    valid_roles = ['admin', 'bereichsleiter', 'technischer_leiter', 'projektleiter', 'user']
    if data['role'] not in valid_roles:
        return jsonify({'error': 'Invalid role'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Log the creation
    current_user_id = get_jwt_identity()
    log = AuditLog(
        user_id=current_user_id,
        action='create_user',
        entity_type='user',
        entity_id=user.id,
        details=f'Created user: {user.username} with role: {user.role}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(user.to_dict()), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user (admin only)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Update fields
    if 'email' in data:
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Email already exists'}), 409
        user.email = data['email']

    if 'role' in data:
        valid_roles = ['admin', 'bereichsleiter', 'technischer_leiter', 'projektleiter', 'user']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400
        user.role = data['role']

    if 'first_name' in data:
        user.first_name = data['first_name']

    if 'last_name' in data:
        user.last_name = data['last_name']

    if 'active' in data:
        user.active = data['active']

    db.session.commit()

    # Log the update
    current_user_id = get_jwt_identity()
    log = AuditLog(
        user_id=current_user_id,
        action='update_user',
        entity_type='user',
        entity_id=user.id,
        details=f'Updated user: {user.username}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(user.to_dict()), 200

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Deactivate user (admin only)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Don't allow deleting yourself
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400

    user.active = False
    db.session.commit()

    # Log the deactivation
    log = AuditLog(
        user_id=current_user_id,
        action='deactivate_user',
        entity_type='user',
        entity_id=user.id,
        details=f'Deactivated user: {user.username}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'User deactivated successfully'}), 200

@users_bp.route('/by-role/<string:role>', methods=['GET'])
@jwt_required()
def get_users_by_role(role):
    """Get users by role"""
    valid_roles = ['admin', 'bereichsleiter', 'technischer_leiter', 'projektleiter', 'user']
    if role not in valid_roles:
        return jsonify({'error': 'Invalid role'}), 400

    users = User.query.filter_by(role=role, active=True).all()
    return jsonify([user.to_dict() for user in users]), 200
