from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, GBUTemplate, Gefaehrdung, ProjectGBU, Project, User, AuditLog
from datetime import datetime

gbu_bp = Blueprint('gbu', __name__)

@gbu_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    """Get all GBU templates"""
    season = request.args.get('season')
    indoor_outdoor = request.args.get('indoor_outdoor')

    query = GBUTemplate.query.filter_by(is_global=True)

    if season:
        query = query.filter((GBUTemplate.season == season) | (GBUTemplate.season == 'alle'))

    if indoor_outdoor:
        query = query.filter((GBUTemplate.indoor_outdoor == indoor_outdoor) | (GBUTemplate.indoor_outdoor == 'alle'))

    templates = query.all()
    result = []
    for template in templates:
        template_dict = template.to_dict()
        # Include gefaehrdungen count
        template_dict['gefaehrdungen_count'] = len(template.gefaehrdungen)
        result.append(template_dict)

    return jsonify(result), 200

@gbu_bp.route('/templates/<int:template_id>', methods=['GET'])
@jwt_required()
def get_template(template_id):
    """Get GBU template by ID with all gefaehrdungen"""
    template = GBUTemplate.query.get(template_id)
    if not template:
        return jsonify({'error': 'Template not found'}), 404

    template_dict = template.to_dict()
    template_dict['gefaehrdungen'] = [g.to_dict() for g in template.gefaehrdungen]

    return jsonify(template_dict), 200

@gbu_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    """Create a new GBU template"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Template name required'}), 400

    template = GBUTemplate(
        name=data['name'],
        description=data.get('description'),
        season=data.get('season', 'alle'),
        indoor_outdoor=data.get('indoor_outdoor', 'alle'),
        is_global=data.get('is_global', False),
        created_by=current_user_id
    )

    db.session.add(template)
    db.session.commit()

    # Log the creation
    log = AuditLog(
        user_id=current_user_id,
        action='create_gbu_template',
        entity_type='gbu_template',
        entity_id=template.id,
        details=f'Created GBU template: {template.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(template.to_dict()), 201

@gbu_bp.route('/gefaehrdungen', methods=['POST'])
@jwt_required()
def create_gefaehrdung():
    """Create a new gefaehrdung"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('tätigkeit'):
        return jsonify({'error': 'Tätigkeit required'}), 400

    # Calculate risikobewertung based on schadenschwere and wahrscheinlichkeit
    risikobewertung = None
    if data.get('schadenschwere') and data.get('wahrscheinlichkeit'):
        risk_value = data['schadenschwere'] * data['wahrscheinlichkeit']
        if risk_value <= 2:
            risikobewertung = 'niedrig'
        elif risk_value <= 4:
            risikobewertung = 'mittel'
        else:
            risikobewertung = 'hoch'

    gefaehrdung = Gefaehrdung(
        gbu_template_id=data.get('gbu_template_id'),
        project_id=data.get('project_id'),
        bereich_id=data.get('bereich_id'),
        tätigkeit=data['tätigkeit'],
        gefährdung=data.get('gefährdung'),
        gefährdungsfaktoren=data.get('gefährdungsfaktoren'),
        belastungsfaktoren=data.get('belastungsfaktoren'),
        schadenschwere=data.get('schadenschwere'),
        wahrscheinlichkeit=data.get('wahrscheinlichkeit'),
        risikobewertung=risikobewertung,
        s_substitution=data.get('s_substitution', ''),
        t_technisch=data.get('t_technisch', ''),
        o_organisatorisch=data.get('o_organisatorisch', ''),
        p_persoenlich=data.get('p_persoenlich', ''),
        massnahmen=data.get('massnahmen'),
        s_massnahmen=data.get('s_massnahmen'),
        t_massnahmen=data.get('t_massnahmen'),
        o_massnahmen=data.get('o_massnahmen'),
        p_massnahmen=data.get('p_massnahmen'),
        überprüfung_wirksamkeit=data.get('überprüfung_wirksamkeit'),
        überprüfung_meldung=data.get('überprüfung_meldung'),
        sonstige_bemerkungen=data.get('sonstige_bemerkungen'),
        gesetzliche_regelungen=data.get('gesetzliche_regelungen'),
        mängel_behoben=data.get('mängel_behoben', False),
        sort_order=data.get('sort_order', 0)
    )

    db.session.add(gefaehrdung)
    db.session.commit()

    # Log the creation
    log = AuditLog(
        user_id=current_user_id,
        action='create_gefaehrdung',
        entity_type='gefaehrdung',
        entity_id=gefaehrdung.id,
        details=f'Created gefaehrdung: {gefaehrdung.tätigkeit}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    return jsonify(gefaehrdung.to_dict()), 201

@gbu_bp.route('/gefaehrdungen/<int:gefaehrdung_id>', methods=['PUT'])
@jwt_required()
def update_gefaehrdung(gefaehrdung_id):
    """Update a gefaehrdung"""
    current_user_id = get_jwt_identity()
    gefaehrdung = Gefaehrdung.query.get(gefaehrdung_id)

    if not gefaehrdung:
        return jsonify({'error': 'Gefaehrdung not found'}), 404

    data = request.get_json()

    # Update fields
    if 'tätigkeit' in data:
        gefaehrdung.tätigkeit = data['tätigkeit']
    if 'gefährdung' in data:
        gefaehrdung.gefährdung = data['gefährdung']
    if 'gefährdungsfaktoren' in data:
        gefaehrdung.gefährdungsfaktoren = data['gefährdungsfaktoren']
    if 'belastungsfaktoren' in data:
        gefaehrdung.belastungsfaktoren = data['belastungsfaktoren']
    if 'schadenschwere' in data:
        gefaehrdung.schadenschwere = data['schadenschwere']
    if 'wahrscheinlichkeit' in data:
        gefaehrdung.wahrscheinlichkeit = data['wahrscheinlichkeit']

    # Recalculate risikobewertung
    if gefaehrdung.schadenschwere and gefaehrdung.wahrscheinlichkeit:
        risk_value = gefaehrdung.schadenschwere * gefaehrdung.wahrscheinlichkeit
        if risk_value <= 2:
            gefaehrdung.risikobewertung = 'niedrig'
        elif risk_value <= 4:
            gefaehrdung.risikobewertung = 'mittel'
        else:
            gefaehrdung.risikobewertung = 'hoch'

    if 's_substitution' in data:
        gefaehrdung.s_substitution = data['s_substitution']
    if 't_technisch' in data:
        gefaehrdung.t_technisch = data['t_technisch']
    if 'o_organisatorisch' in data:
        gefaehrdung.o_organisatorisch = data['o_organisatorisch']
    if 'p_persoenlich' in data:
        gefaehrdung.p_persoenlich = data['p_persoenlich']
    if 'massnahmen' in data:
        gefaehrdung.massnahmen = data['massnahmen']
    if 's_massnahmen' in data:
        gefaehrdung.s_massnahmen = data['s_massnahmen']
    if 't_massnahmen' in data:
        gefaehrdung.t_massnahmen = data['t_massnahmen']
    if 'o_massnahmen' in data:
        gefaehrdung.o_massnahmen = data['o_massnahmen']
    if 'p_massnahmen' in data:
        gefaehrdung.p_massnahmen = data['p_massnahmen']
    if 'überprüfung_wirksamkeit' in data:
        gefaehrdung.überprüfung_wirksamkeit = data['überprüfung_wirksamkeit']
    if 'überprüfung_meldung' in data:
        gefaehrdung.überprüfung_meldung = data['überprüfung_meldung']
    if 'sonstige_bemerkungen' in data:
        gefaehrdung.sonstige_bemerkungen = data['sonstige_bemerkungen']
    if 'gesetzliche_regelungen' in data:
        gefaehrdung.gesetzliche_regelungen = data['gesetzliche_regelungen']
    if 'mängel_behoben' in data:
        gefaehrdung.mängel_behoben = data['mängel_behoben']
    if 'bereich_id' in data:
        gefaehrdung.bereich_id = data['bereich_id']

    db.session.commit()

    return jsonify(gefaehrdung.to_dict()), 200

@gbu_bp.route('/gefaehrdungen/<int:gefaehrdung_id>', methods=['DELETE'])
@jwt_required()
def delete_gefaehrdung(gefaehrdung_id):
    """Delete a gefaehrdung"""
    current_user_id = get_jwt_identity()
    gefaehrdung = Gefaehrdung.query.get(gefaehrdung_id)

    if not gefaehrdung:
        return jsonify({'error': 'Gefaehrdung not found'}), 404

    db.session.delete(gefaehrdung)
    db.session.commit()

    return jsonify({'message': 'Gefaehrdung deleted successfully'}), 200

@gbu_bp.route('/project/<int:project_id>/gbus', methods=['GET'])
@jwt_required()
def get_project_gbus(project_id):
    """Get all GBUs for a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Get template-based GBUs
    project_gbus = ProjectGBU.query.filter_by(project_id=project_id).all()
    templates = []
    for pg in project_gbus:
        template = GBUTemplate.query.get(pg.gbu_template_id)
        if template:
            template_dict = template.to_dict()
            template_dict['gefaehrdungen'] = [g.to_dict() for g in template.gefaehrdungen]
            templates.append(template_dict)

    # Get project-specific gefaehrdungen
    project_gefaehrdungen = Gefaehrdung.query.filter_by(project_id=project_id).all()

    return jsonify({
        'templates': templates,
        'project_gefaehrdungen': [g.to_dict() for g in project_gefaehrdungen]
    }), 200

@gbu_bp.route('/project/<int:project_id>/add-template', methods=['POST'])
@jwt_required()
def add_template_to_project(project_id):
    """Add a GBU template to a project"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    data = request.get_json()
    if not data or not data.get('template_id'):
        return jsonify({'error': 'Template ID required'}), 400

    template = GBUTemplate.query.get(data['template_id'])
    if not template:
        return jsonify({'error': 'Template not found'}), 404

    # Check if already added
    existing = ProjectGBU.query.filter_by(
        project_id=project_id,
        gbu_template_id=data['template_id']
    ).first()

    if existing:
        return jsonify({'error': 'Template already added to this project'}), 409

    project_gbu = ProjectGBU(
        project_id=project_id,
        gbu_template_id=data['template_id'],
        added_by=current_user_id
    )

    db.session.add(project_gbu)
    db.session.commit()

    return jsonify(project_gbu.to_dict()), 201

@gbu_bp.route('/project/<int:project_id>/copy-template/<int:template_id>', methods=['POST'])
@jwt_required()
def copy_template_to_project(project_id, template_id):
    """Copy a GBU template's gefaehrdungen to a project"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    template = GBUTemplate.query.get(template_id)
    if not template:
        return jsonify({'error': 'Template not found'}), 404

    # Copy all gefaehrdungen from template to project
    copied_gefaehrdungen = []
    for original in template.gefaehrdungen:
        gefaehrdung = Gefaehrdung(
            project_id=project_id,
            bereich_id=original.bereich_id,
            tätigkeit=original.tätigkeit,
            gefährdung=original.gefährdung,
            gefährdungsfaktoren=original.gefährdungsfaktoren,
            belastungsfaktoren=original.belastungsfaktoren,
            schadenschwere=original.schadenschwere,
            wahrscheinlichkeit=original.wahrscheinlichkeit,
            risikobewertung=original.risikobewertung,
            s_substitution=original.s_substitution,
            t_technisch=original.t_technisch,
            o_organisatorisch=original.o_organisatorisch,
            p_persoenlich=original.p_persoenlich,
            massnahmen=original.massnahmen,
            s_massnahmen=original.s_massnahmen,
            t_massnahmen=original.t_massnahmen,
            o_massnahmen=original.o_massnahmen,
            p_massnahmen=original.p_massnahmen,
            überprüfung_wirksamkeit=original.überprüfung_wirksamkeit,
            überprüfung_meldung=original.überprüfung_meldung,
            sonstige_bemerkungen=original.sonstige_bemerkungen,
            gesetzliche_regelungen=original.gesetzliche_regelungen,
            sort_order=original.sort_order
        )
        db.session.add(gefaehrdung)
        copied_gefaehrdungen.append(gefaehrdung)

    db.session.commit()

    return jsonify([g.to_dict() for g in copied_gefaehrdungen]), 201
