from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin', 'bereichsleiter', 'technischer_leiter', 'projektleiter', 'user', name='user_role'), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_projects = db.relationship('Project', back_populates='creator', foreign_keys='Project.created_by')
    project_assignments = db.relationship('ProjectAssignment', back_populates='user', foreign_keys='ProjectAssignment.user_id')
    bereich_assignments = db.relationship('BereichAssignment', back_populates='bereichsleiter', foreign_keys='BereichAssignment.bereichsleiter_id')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'active': self.active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_sensitive:
            data['password_hash'] = self.password_hash
        return data

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(255))
    aufbau_datum = db.Column(db.Date)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    season = db.Column(db.Enum('fruehling', 'sommer', 'herbst', 'winter', name='season_type'))
    indoor_outdoor = db.Column(db.Enum('indoor', 'outdoor', 'both', name='indoor_outdoor_type'))
    status = db.Column(db.Enum('planung', 'aktiv', 'abgeschlossen', 'archiviert', name='project_status'), default='planung')
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='created_projects', foreign_keys=[created_by])
    assignments = db.relationship('ProjectAssignment', back_populates='project', cascade='all, delete-orphan')
    bereich_assignments = db.relationship('BereichAssignment', back_populates='project', cascade='all, delete-orphan')
    gbus = db.relationship('ProjectGBU', back_populates='project', cascade='all, delete-orphan')
    gefaehrdungen = db.relationship('Gefaehrdung', back_populates='project', cascade='all, delete-orphan')
    participants = db.relationship('Participant', back_populates='project', cascade='all, delete-orphan')
    unterweisungen = db.relationship('Unterweisung', back_populates='project', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'location': self.location,
            'aufbau_datum': self.aufbau_datum.isoformat() if self.aufbau_datum else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'season': self.season,
            'indoor_outdoor': self.indoor_outdoor,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class ProjectAssignment(db.Model):
    __tablename__ = 'project_assignments'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', back_populates='assignments')
    user = db.relationship('User', back_populates='project_assignments', foreign_keys=[user_id])
    assigner = db.relationship('User', foreign_keys=[assigned_by])

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'assigned_by': self.assigned_by,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
        }

class Bereich(db.Model):
    __tablename__ = 'bereiche'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    assignments = db.relationship('BereichAssignment', back_populates='bereich', cascade='all, delete-orphan')
    gefaehrdungen = db.relationship('Gefaehrdung', back_populates='bereich')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class BereichAssignment(db.Model):
    __tablename__ = 'bereich_assignments'

    id = db.Column(db.Integer, primary_key=True)
    bereich_id = db.Column(db.Integer, db.ForeignKey('bereiche.id'), nullable=False)
    bereichsleiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    bereich = db.relationship('Bereich', back_populates='assignments')
    bereichsleiter = db.relationship('User', back_populates='bereich_assignments', foreign_keys=[bereichsleiter_id])
    project = db.relationship('Project', back_populates='bereich_assignments')
    assigner = db.relationship('User', foreign_keys=[assigned_by])

    def to_dict(self):
        return {
            'id': self.id,
            'bereich_id': self.bereich_id,
            'bereichsleiter_id': self.bereichsleiter_id,
            'project_id': self.project_id,
            'assigned_by': self.assigned_by,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
        }

class GBUTemplate(db.Model):
    __tablename__ = 'gbu_templates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    season = db.Column(db.Enum('fruehling', 'sommer', 'herbst', 'winter', 'alle', name='template_season'), default='alle')
    indoor_outdoor = db.Column(db.Enum('indoor', 'outdoor', 'both', 'alle', name='template_indoor_outdoor'), default='alle')
    is_global = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User')
    gefaehrdungen = db.relationship('Gefaehrdung', back_populates='gbu_template', cascade='all, delete-orphan')
    project_gbus = db.relationship('ProjectGBU', back_populates='gbu_template', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'season': self.season,
            'indoor_outdoor': self.indoor_outdoor,
            'is_global': self.is_global,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class Gefaehrdung(db.Model):
    __tablename__ = 'gefaehrdungen'

    id = db.Column(db.Integer, primary_key=True)
    gbu_template_id = db.Column(db.Integer, db.ForeignKey('gbu_templates.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'))
    bereich_id = db.Column(db.Integer, db.ForeignKey('bereiche.id'))
    tätigkeit = db.Column(db.String(255), nullable=False)
    gefährdung = db.Column(db.Text)
    gefährdungsfaktoren = db.Column(db.Text)
    belastungsfaktoren = db.Column(db.Text)
    schadenschwere = db.Column(db.Integer)
    wahrscheinlichkeit = db.Column(db.Integer)
    risikobewertung = db.Column(db.String(50))
    s_substitution = db.Column(db.Enum('WAHR', 'FALSCH', '', name='bool_check'), default='')
    t_technisch = db.Column(db.Enum('WAHR', 'FALSCH', '', name='bool_check'), default='')
    o_organisatorisch = db.Column(db.Enum('WAHR', 'FALSCH', '', name='bool_check'), default='')
    p_persoenlich = db.Column(db.Enum('WAHR', 'FALSCH', '', name='bool_check'), default='')
    massnahmen = db.Column(db.Text)
    s_massnahmen = db.Column(db.Text)
    t_massnahmen = db.Column(db.Text)
    o_massnahmen = db.Column(db.Text)
    p_massnahmen = db.Column(db.Text)
    überprüfung_wirksamkeit = db.Column(db.Text)
    überprüfung_meldung = db.Column(db.Text)
    sonstige_bemerkungen = db.Column(db.Text)
    gesetzliche_regelungen = db.Column(db.Text)
    mängel_behoben = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    gbu_template = db.relationship('GBUTemplate', back_populates='gefaehrdungen')
    project = db.relationship('Project', back_populates='gefaehrdungen')
    bereich = db.relationship('Bereich', back_populates='gefaehrdungen')

    def to_dict(self):
        return {
            'id': self.id,
            'gbu_template_id': self.gbu_template_id,
            'project_id': self.project_id,
            'bereich_id': self.bereich_id,
            'tätigkeit': self.tätigkeit,
            'gefährdung': self.gefährdung,
            'gefährdungsfaktoren': self.gefährdungsfaktoren,
            'belastungsfaktoren': self.belastungsfaktoren,
            'schadenschwere': self.schadenschwere,
            'wahrscheinlichkeit': self.wahrscheinlichkeit,
            'risikobewertung': self.risikobewertung,
            's_substitution': self.s_substitution,
            't_technisch': self.t_technisch,
            'o_organisatorisch': self.o_organisatorisch,
            'p_persoenlich': self.p_persoenlich,
            'massnahmen': self.massnahmen,
            's_massnahmen': self.s_massnahmen,
            't_massnahmen': self.t_massnahmen,
            'o_massnahmen': self.o_massnahmen,
            'p_massnahmen': self.p_massnahmen,
            'überprüfung_wirksamkeit': self.überprüfung_wirksamkeit,
            'überprüfung_meldung': self.überprüfung_meldung,
            'sonstige_bemerkungen': self.sonstige_bemerkungen,
            'gesetzliche_regelungen': self.gesetzliche_regelungen,
            'mängel_behoben': self.mängel_behoben,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class ProjectGBU(db.Model):
    __tablename__ = 'project_gbus'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    gbu_template_id = db.Column(db.Integer, db.ForeignKey('gbu_templates.id'), nullable=False)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', back_populates='gbus')
    gbu_template = db.relationship('GBUTemplate', back_populates='project_gbus')
    adder = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'gbu_template_id': self.gbu_template_id,
            'added_by': self.added_by,
            'added_at': self.added_at.isoformat() if self.added_at else None,
        }

class Participant(db.Model):
    __tablename__ = 'participants'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(255))
    position = db.Column(db.String(100))
    company = db.Column(db.String(255))
    signature_data = db.Column(db.Text)
    signature_type = db.Column(db.Enum('digital', 'analog', 'pending', name='signature_type'), default='pending')
    signed_at = db.Column(db.DateTime)
    imported_from_csv = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', back_populates='participants')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'position': self.position,
            'company': self.company,
            'signature_type': self.signature_type,
            'signed_at': self.signed_at.isoformat() if self.signed_at else None,
            'imported_from_csv': self.imported_from_csv,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

class Unterweisung(db.Model):
    __tablename__ = 'unterweisungen'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(255))
    content = db.Column(db.Text)
    veranstaltung = db.Column(db.String(255))
    datum_ort = db.Column(db.String(255))
    organisation = db.Column(db.Text)
    allgemeine_hinweise = db.Column(db.Text)
    notfaelle_raeumung = db.Column(db.Text)
    zusaetzliche_regeln = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', back_populates='unterweisungen')
    creator = db.relationship('User')
    items = db.relationship('UnterweisungItem', back_populates='unterweisung', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'content': self.content,
            'veranstaltung': self.veranstaltung,
            'datum_ort': self.datum_ort,
            'organisation': self.organisation,
            'allgemeine_hinweise': self.allgemeine_hinweise,
            'notfaelle_raeumung': self.notfaelle_raeumung,
            'zusaetzliche_regeln': self.zusaetzliche_regeln,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

class UnterweisungItem(db.Model):
    __tablename__ = 'unterweisung_items'

    id = db.Column(db.Integer, primary_key=True)
    unterweisung_id = db.Column(db.Integer, db.ForeignKey('unterweisungen.id'), nullable=False)
    section = db.Column(db.String(100))
    icon_type = db.Column(db.String(50))
    content = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)

    # Relationships
    unterweisung = db.relationship('Unterweisung', back_populates='items')

    def to_dict(self):
        return {
            'id': self.id,
            'unterweisung_id': self.unterweisung_id,
            'section': self.section,
            'icon_type': self.icon_type,
            'content': self.content,
            'sort_order': self.sort_order,
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100))
    entity_type = db.Column(db.String(50))
    entity_id = db.Column(db.Integer)
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
