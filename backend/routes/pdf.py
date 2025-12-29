from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, Gefaehrdung, Participant, Unterweisung, Bereich
from utils.pdf_generator import PDFGenerator
import os

pdf_bp = Blueprint('pdf', __name__)

@pdf_bp.route('/project/<int:project_id>/gbu', methods=['GET'])
@jwt_required()
def generate_gbu_pdf(project_id):
    """Generate GBU overview PDF for a project"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Get all gefaehrdungen for the project
    gefaehrdungen = Gefaehrdung.query.filter_by(project_id=project_id).all()

    # Group by bereich
    gefaehrdungen_by_bereich = {}
    for gef in gefaehrdungen:
        bereich = Bereich.query.get(gef.bereich_id) if gef.bereich_id else None
        bereich_name = bereich.name if bereich else 'Sonstige'

        if bereich_name not in gefaehrdungen_by_bereich:
            gefaehrdungen_by_bereich[bereich_name] = []
        gefaehrdungen_by_bereich[bereich_name].append(gef)

    # Generate PDF
    pdf_gen = PDFGenerator()
    pdf_path = pdf_gen.generate_gbu_overview(project, gefaehrdungen_by_bereich)

    return send_file(pdf_path, as_attachment=True, download_name=f'GBU_{project.name}.pdf')

@pdf_bp.route('/project/<int:project_id>/participants', methods=['GET'])
@jwt_required()
def generate_participants_pdf(project_id):
    """Generate participants list PDF for signatures"""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    participants = Participant.query.filter_by(project_id=project_id).all()

    # Generate PDF
    pdf_gen = PDFGenerator()
    pdf_path = pdf_gen.generate_participants_list(project, participants)

    return send_file(pdf_path, as_attachment=True, download_name=f'Teilnehmerliste_{project.name}.pdf')

@pdf_bp.route('/unterweisung/<int:unterweisung_id>', methods=['GET'])
@jwt_required()
def generate_unterweisung_pdf(unterweisung_id):
    """Generate unterweisung PDF"""
    unterweisung = Unterweisung.query.get(unterweisung_id)
    if not unterweisung:
        return jsonify({'error': 'Unterweisung not found'}), 404

    project = Project.query.get(unterweisung.project_id)

    # Generate PDF
    pdf_gen = PDFGenerator()
    pdf_path = pdf_gen.generate_unterweisung(unterweisung, project)

    return send_file(pdf_path, as_attachment=True, download_name=f'Unterweisung_{project.name if project else unterweisung_id}.pdf')
