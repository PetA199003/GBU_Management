from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os
import tempfile

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))

        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1a237e'),
            spaceAfter=12,
            spaceBefore=12
        ))

        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=9,
            alignment=TA_LEFT
        ))

    def generate_gbu_overview(self, project, gefaehrdungen_by_bereich):
        """Generate GBU overview PDF"""
        # Create temp file
        fd, temp_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)

        # Create PDF
        doc = SimpleDocTemplate(temp_path, pagesize=landscape(A4),
                              rightMargin=1*cm, leftMargin=1*cm,
                              topMargin=1*cm, bottomMargin=1*cm)

        elements = []

        # Title
        title = Paragraph(f"Gefährdungsbeurteilung - {project.name}", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.3*cm))

        # Project info
        info_text = f"Projekt: {project.name}<br/>"
        info_text += f"Ort: {project.location or 'N/A'}<br/>"
        info_text += f"Datum: {project.start_date.strftime('%d.%m.%Y') if project.start_date else 'N/A'}<br/>"
        info_text += f"Saison: {project.season or 'N/A'} | Indoor/Outdoor: {project.indoor_outdoor or 'N/A'}"
        info = Paragraph(info_text, self.styles['CustomBody'])
        elements.append(info)
        elements.append(Spacer(1, 0.5*cm))

        # Create table for each bereich
        for bereich_name, gefaehrdungen in gefaehrdungen_by_bereich.items():
            # Bereich heading
            bereich_heading = Paragraph(f"Bereich: {bereich_name}", self.styles['CustomHeading'])
            elements.append(bereich_heading)
            elements.append(Spacer(1, 0.2*cm))

            # Table headers
            table_data = [[
                'Tätigkeit',
                'Gefährdung',
                'Schaden\nschwere',
                'Wahr\nschein\nlichkeit',
                'Risiko',
                'S', 'T', 'O', 'P',
                'Maßnahmen'
            ]]

            # Add data rows
            for gef in gefaehrdungen:
                # Determine color based on risk
                risk_color = colors.white
                if gef.risikobewertung == 'hoch':
                    risk_color = colors.HexColor('#ff0000')
                elif gef.risikobewertung == 'mittel':
                    risk_color = colors.HexColor('#ffff00')
                elif gef.risikobewertung == 'niedrig':
                    risk_color = colors.HexColor('#00ff00')

                row = [
                    Paragraph(gef.tätigkeit or '', self.styles['CustomBody']),
                    Paragraph(gef.gefährdung or '', self.styles['CustomBody']),
                    str(gef.schadenschwere) if gef.schadenschwere else '',
                    str(gef.wahrscheinlichkeit) if gef.wahrscheinlichkeit else '',
                    Paragraph(gef.risikobewertung or '', self.styles['CustomBody']),
                    '✓' if gef.s_substitution == 'WAHR' else '',
                    '✓' if gef.t_technisch == 'WAHR' else '',
                    '✓' if gef.o_organisatorisch == 'WAHR' else '',
                    '✓' if gef.p_persoenlich == 'WAHR' else '',
                    Paragraph(gef.massnahmen or '', self.styles['CustomBody'])
                ]
                table_data.append(row)

            # Create table
            col_widths = [3.5*cm, 4*cm, 1.2*cm, 1.2*cm, 1.5*cm, 0.7*cm, 0.7*cm, 0.7*cm, 0.7*cm, 5*cm]
            table = Table(table_data, colWidths=col_widths, repeatRows=1)

            # Table style
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 0), (4, -1), 'CENTER'),
                ('ALIGN', (5, 0), (8, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('TOPPADDING', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))

            elements.append(table)
            elements.append(Spacer(1, 0.5*cm))

        # Add STOP principle legend
        elements.append(PageBreak())
        legend_title = Paragraph("STOP-Prinzip", self.styles['CustomHeading'])
        elements.append(legend_title)
        legend_text = """
        <b>S - Substitution:</b> Substitution durch Beseitigung von Gefahren oder Einsatz weniger gefährlicher Stoffe<br/>
        <b>T - Technische Maßnahmen:</b> Technische Lösungen zur Risikominimierung<br/>
        <b>O - Organisatorische Maßnahmen:</b> Organisatorische und kollektive Lösungen<br/>
        <b>P - Persönliche Schutzausrüstung:</b> Persönliche Schutzausrüstung als letzte Maßnahme
        """
        legend = Paragraph(legend_text, self.styles['CustomBody'])
        elements.append(legend)

        # Build PDF
        doc.build(elements)

        return temp_path

    def generate_participants_list(self, project, participants):
        """Generate participants list PDF with signature spaces"""
        # Create temp file
        fd, temp_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)

        # Create PDF
        doc = SimpleDocTemplate(temp_path, pagesize=A4,
                              rightMargin=2*cm, leftMargin=2*cm,
                              topMargin=2*cm, bottomMargin=2*cm)

        elements = []

        # Title
        title = Paragraph(f"Teilnehmerliste - {project.name}", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.5*cm))

        # Project info
        info_text = f"Projekt: {project.name}<br/>"
        info_text += f"Ort: {project.location or 'N/A'}<br/>"
        info_text += f"Datum: {project.start_date.strftime('%d.%m.%Y') if project.start_date else 'N/A'}"
        info = Paragraph(info_text, self.styles['CustomBody'])
        elements.append(info)
        elements.append(Spacer(1, 1*cm))

        # Table headers
        table_data = [[
            'Nr.',
            'Name',
            'Vorname',
            'Firma',
            'Position',
            'Unterschrift',
            'Datum'
        ]]

        # Add participant rows
        for idx, participant in enumerate(participants, start=1):
            row = [
                str(idx),
                participant.last_name or '',
                participant.first_name or '',
                participant.company or '',
                participant.position or '',
                '',  # Signature space
                ''   # Date space
            ]
            table_data.append(row)

        # Add empty rows for additional participants
        for i in range(10):
            table_data.append(['', '', '', '', '', '', ''])

        # Create table
        col_widths = [1*cm, 3.5*cm, 3.5*cm, 3.5*cm, 3*cm, 3*cm, 2*cm]
        table = Table(table_data, colWidths=col_widths, repeatRows=1)

        # Table style
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('ALIGN', (1, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))

        elements.append(table)

        # Build PDF
        doc.build(elements)

        return temp_path

    def generate_unterweisung(self, unterweisung, project):
        """Generate unterweisung PDF"""
        # Create temp file
        fd, temp_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)

        # Create PDF
        doc = SimpleDocTemplate(temp_path, pagesize=A4,
                              rightMargin=2*cm, leftMargin=2*cm,
                              topMargin=2*cm, bottomMargin=2*cm)

        elements = []

        # Title
        title = Paragraph(unterweisung.title or "Unterweisung", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 0.5*cm))

        # Veranstaltung info
        if unterweisung.veranstaltung:
            veranstaltung_text = f"<b>Veranstaltung:</b> {unterweisung.veranstaltung}"
            elements.append(Paragraph(veranstaltung_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.2*cm))

        if unterweisung.datum_ort:
            datum_ort_text = f"<b>Datum und Ort:</b> {unterweisung.datum_ort}"
            elements.append(Paragraph(datum_ort_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5*cm))

        # Organisation section
        if unterweisung.organisation:
            org_heading = Paragraph("Organisation", self.styles['CustomHeading'])
            elements.append(org_heading)
            org_text = unterweisung.organisation.replace('\n', '<br/>')
            elements.append(Paragraph(org_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5*cm))

        # Allgemeine Hinweise section
        if unterweisung.allgemeine_hinweise:
            hints_heading = Paragraph("Allgemeine Hinweise", self.styles['CustomHeading'])
            elements.append(hints_heading)
            hints_text = unterweisung.allgemeine_hinweise.replace('\n', '<br/>')
            elements.append(Paragraph(hints_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5*cm))

        # Notfälle und Räumung section
        if unterweisung.notfaelle_raeumung:
            notfall_heading = Paragraph("Notfälle, Räumung", self.styles['CustomHeading'])
            elements.append(notfall_heading)
            notfall_text = unterweisung.notfaelle_raeumung.replace('\n', '<br/>')
            elements.append(Paragraph(notfall_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5*cm))

        # Additional rules
        if unterweisung.zusaetzliche_regeln:
            rules_heading = Paragraph("Zusätzliche Regeln", self.styles['CustomHeading'])
            elements.append(rules_heading)
            rules_text = unterweisung.zusaetzliche_regeln.replace('\n', '<br/>')
            elements.append(Paragraph(rules_text, self.styles['CustomBody']))
            elements.append(Spacer(1, 0.5*cm))

        # Footer
        elements.append(Spacer(1, 1*cm))
        footer_text = f"Erstellt am {datetime.now().strftime('%d.%m.%Y')}"
        footer = Paragraph(footer_text, self.styles['CustomBody'])
        elements.append(footer)

        # Build PDF
        doc.build(elements)

        return temp_path
