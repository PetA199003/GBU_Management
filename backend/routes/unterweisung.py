from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Unterweisung, UnterweisungItem, Project, User, AuditLog

unterweisung_bp = Blueprint('unterweisung', __name__)

@unterweisung_bp.route('/project/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project_unterweisungen(project_id):
    """Get all unterweisungen for a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    unterweisungen = Unterweisung.query.filter_by(project_id=project_id).all()
    result = []
    for unterweisung in unterweisungen:
        u_dict = unterweisung.to_dict()
        u_dict['items'] = [item.to_dict() for item in unterweisung.items]
        result.append(u_dict)

    return jsonify(result), 200

@unterweisung_bp.route('/<int:unterweisung_id>', methods=['GET'])
@jwt_required()
def get_unterweisung(unterweisung_id):
    """Get unterweisung by ID"""
    unterweisung = Unterweisung.query.get(unterweisung_id)
    if not unterweisung:
        return jsonify({'error': 'Unterweisung not found'}), 404

    u_dict = unterweisung.to_dict()
    u_dict['items'] = [item.to_dict() for item in unterweisung.items]

    return jsonify(u_dict), 200

@unterweisung_bp.route('/', methods=['POST'])
@jwt_required()
def create_unterweisung():
    """Create a new unterweisung"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('project_id'):
        return jsonify({'error': 'Project ID required'}), 400

    project = Project.query.get(data['project_id'])
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    unterweisung = Unterweisung(
        project_id=data['project_id'],
        title=data.get('title'),
        content=data.get('content'),
        veranstaltung=data.get('veranstaltung'),
        datum_ort=data.get('datum_ort'),
        organisation=data.get('organisation'),
        allgemeine_hinweise=data.get('allgemeine_hinweise'),
        notfaelle_raeumung=data.get('notfaelle_raeumung'),
        zusaetzliche_regeln=data.get('zusaetzliche_regeln'),
        created_by=current_user_id
    )

    db.session.add(unterweisung)
    db.session.flush()

    # Add items if provided
    if data.get('items'):
        for item_data in data['items']:
            item = UnterweisungItem(
                unterweisung_id=unterweisung.id,
                section=item_data.get('section'),
                icon_type=item_data.get('icon_type'),
                content=item_data.get('content'),
                sort_order=item_data.get('sort_order', 0)
            )
            db.session.add(item)

    db.session.commit()

    # Log the creation
    log = AuditLog(
        user_id=current_user_id,
        action='create_unterweisung',
        entity_type='unterweisung',
        entity_id=unterweisung.id,
        details=f'Created unterweisung for project {project.name}',
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

    u_dict = unterweisung.to_dict()
    u_dict['items'] = [item.to_dict() for item in unterweisung.items]

    return jsonify(u_dict), 201

@unterweisung_bp.route('/<int:unterweisung_id>', methods=['PUT'])
@jwt_required()
def update_unterweisung(unterweisung_id):
    """Update an unterweisung"""
    current_user_id = get_jwt_identity()
    unterweisung = Unterweisung.query.get(unterweisung_id)

    if not unterweisung:
        return jsonify({'error': 'Unterweisung not found'}), 404

    data = request.get_json()

    if 'title' in data:
        unterweisung.title = data['title']
    if 'content' in data:
        unterweisung.content = data['content']
    if 'veranstaltung' in data:
        unterweisung.veranstaltung = data['veranstaltung']
    if 'datum_ort' in data:
        unterweisung.datum_ort = data['datum_ort']
    if 'organisation' in data:
        unterweisung.organisation = data['organisation']
    if 'allgemeine_hinweise' in data:
        unterweisung.allgemeine_hinweise = data['allgemeine_hinweise']
    if 'notfaelle_raeumung' in data:
        unterweisung.notfaelle_raeumung = data['notfaelle_raeumung']
    if 'zusaetzliche_regeln' in data:
        unterweisung.zusaetzliche_regeln = data['zusaetzliche_regeln']

    # Update items if provided
    if 'items' in data:
        # Delete existing items
        UnterweisungItem.query.filter_by(unterweisung_id=unterweisung_id).delete()

        # Add new items
        for item_data in data['items']:
            item = UnterweisungItem(
                unterweisung_id=unterweisung.id,
                section=item_data.get('section'),
                icon_type=item_data.get('icon_type'),
                content=item_data.get('content'),
                sort_order=item_data.get('sort_order', 0)
            )
            db.session.add(item)

    db.session.commit()

    u_dict = unterweisung.to_dict()
    u_dict['items'] = [item.to_dict() for item in unterweisung.items]

    return jsonify(u_dict), 200

@unterweisung_bp.route('/<int:unterweisung_id>', methods=['DELETE'])
@jwt_required()
def delete_unterweisung(unterweisung_id):
    """Delete an unterweisung"""
    unterweisung = Unterweisung.query.get(unterweisung_id)
    if not unterweisung:
        return jsonify({'error': 'Unterweisung not found'}), 404

    db.session.delete(unterweisung)
    db.session.commit()

    return jsonify({'message': 'Unterweisung deleted successfully'}), 200

@unterweisung_bp.route('/project/<int:project_id>/generate', methods=['POST'])
@jwt_required()
def generate_unterweisung(project_id):
    """Auto-generate unterweisung from project gefaehrdungen"""
    current_user_id = get_jwt_identity()
    project = Project.query.get(project_id)

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Create default unterweisung structure
    unterweisung = Unterweisung(
        project_id=project_id,
        title='Regeln für Arbeiten bei Produktionen und Veranstaltungen',
        veranstaltung=project.name,
        datum_ort=f'{project.start_date.strftime("%d.%m.%Y") if project.start_date else ""} / {project.location or ""}',
        organisation='• Verantwortlich bei Produktionen ist der Technische Leiter\n• Verantwortlich für Einzelgewerke ist der Gewerkeleiter / Bereichsleiter\n• Den Anweisungen des Verantwortlichen ist Folge zu leisten\n• Die Sicherheitskennzeichnungen sind zu beachten\n• Die Kommunikationskette ist einzuhalten',
        allgemeine_hinweise='• Alle Arbeitsanweisungen müssen eingehalten werden\n• Bei Unklarheiten zu einer Aufgabe unbedingt nachfragen\n• Anweisungen zu unsicheren Arbeiten müssen nicht befolgt werden!\n• Alle Arbeiten sind sicher auszuführen!\n• Achtet auf Euch und Andere!\n• Die rechtlichen Bestimmungen sind einzuhalten\n• Die Arbeitsschutzvorschriften und Gefährdungsbeurteilungen sind im Produktionsbüro einsehbar\n• Alle Beschäftigten haben das Recht und die Pflicht, Probleme, Schwachstellen und unnötige Belastungen im Arbeitsablauf anzusprechen und gemeinsam nach Verbesserungsmöglichkeiten zu suchen\n• Alkohol, Drogen oder andere berauschende Mittel sind vor und während der Arbeit verboten\n• Das Rauchen ist ausschließlich an den dafür vorgesehenen Orten gestattet',
        notfaelle_raeumung='• Alle Verkehrswege, z.B. Türen und Tore müssen freigehalten werden\n• Flucht- und Rettungswege, bzw. Notausgänge oder Feuerlöscheinrichtungen dürfen nicht verstellt werden\n• Bei Unfällen ist sofort Hilfe zu leisten, Ersthelfer/Sanitäter herbei zu holen! Notfallalarmierung durchführen! (CH 144/EU 112)\n• Notrufnummern sind anzuwenden\n• Unfälle und Beinahe-Unfälle müssen sofort dem direkten Ansprechpartner gemeldet werden\n• Brände sind sofort zu melden (CH 118/EU 112) und mit den Feuerlöscheinrichtungen zu bekämpfen\n• Bei einer notwendigen Räumung ist hilfslosen und Personen mit beeinträchtigung zu helfen\n• Alle Mitarbeiter sammeln sich, im Falle einer Räumung, ausschließlich an der Sammelstelle, welche bei Arbeitsbeginn vom Verantwortlichen bekanntgegeben wurde',
        created_by=current_user_id
    )

    db.session.add(unterweisung)
    db.session.flush()

    # Add standard items with icons
    standard_items = [
        {'section': 'allgemeine_hinweise', 'icon_type': 'info', 'content': 'Alle Arbeitsanweisungen müssen eingehalten werden', 'sort_order': 1},
        {'section': 'allgemeine_hinweise', 'icon_type': 'info', 'content': 'Bei Unklarheiten zu einer Aufgabe unbedingt nachfragen', 'sort_order': 2},
        {'section': 'allgemeine_hinweise', 'icon_type': 'prohibited', 'content': 'Alkohol, Drogen oder andere berauschende Mittel sind vor und während der Arbeit verboten', 'sort_order': 3},
        {'section': 'allgemeine_hinweise', 'icon_type': 'no_smoking', 'content': 'Das Rauchen ist ausschließlich an den dafür vorgesehenen Orten gestattet', 'sort_order': 4},
        {'section': 'notfaelle', 'icon_type': 'no_blocking', 'content': 'Alle Verkehrswege, z.B. Türen und Tore müssen freigehalten werden', 'sort_order': 1},
        {'section': 'notfaelle', 'icon_type': 'phone', 'content': 'Bei Unfällen ist sofort Hilfe zu leisten, Ersthelfer/Sanitäter herbei zu holen!', 'sort_order': 2},
        {'section': 'notfaelle', 'icon_type': 'fire', 'content': 'Brände sind sofort zu melden (CH 118/EU 112)', 'sort_order': 3},
        {'section': 'notfaelle', 'icon_type': 'exit', 'content': 'Bei einer notwendigen Räumung ist hilfslosen und Personen mit beeinträchtigung zu helfen', 'sort_order': 4},
        {'section': 'notfaelle', 'icon_type': 'assembly', 'content': 'Alle Mitarbeiter sammeln sich, im Falle einer Räumung, ausschließlich an der Sammelstelle', 'sort_order': 5}
    ]

    for item_data in standard_items:
        item = UnterweisungItem(
            unterweisung_id=unterweisung.id,
            section=item_data['section'],
            icon_type=item_data['icon_type'],
            content=item_data['content'],
            sort_order=item_data['sort_order']
        )
        db.session.add(item)

    db.session.commit()

    u_dict = unterweisung.to_dict()
    u_dict['items'] = [item.to_dict() for item in unterweisung.items]

    return jsonify(u_dict), 201
