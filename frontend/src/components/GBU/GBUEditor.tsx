import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { gbuAPI, bereicheAPI, pdfAPI } from '../../services/api';
import type { Gefaehrdung, Bereich, GBUTemplate } from '../../types';

const GBUEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [gefaehrdungen, setGefaehrdungen] = useState<Gefaehrdung[]>([]);
  const [bereiche, setBereiche] = useState<Bereich[]>([]);
  const [templates, setTemplates] = useState<GBUTemplate[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    if (!projectId) return;

    try {
      const [gbuData, bereicheData, templatesData] = await Promise.all([
        gbuAPI.getProjectGBUs(parseInt(projectId)),
        bereicheAPI.getAll(),
        gbuAPI.getTemplates(),
      ]);

      setGefaehrdungen(gbuData.project_gefaehrdungen || []);
      setBereiche(bereicheData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddTemplate = async (templateId: number) => {
    if (!projectId) return;

    try {
      await gbuAPI.copyTemplateToProject(parseInt(projectId), templateId);
      fetchData();
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Failed to add template:', error);
    }
  };

  const downloadPDF = async () => {
    if (!projectId) return;

    try {
      const blob = await pdfAPI.generateGBU(parseInt(projectId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GBU_Projekt_${projectId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const getRiskClass = (risk?: string) => {
    if (risk === 'hoch') return 'risk-high';
    if (risk === 'mittel') return 'risk-mittel';
    if (risk === 'niedrig') return 'risk-niedrig';
    return '';
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Gefährdungsbeurteilung</h1>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowTemplateModal(true)}>
            Vorlage hinzufügen
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Neue Gefährdung
          </Button>
          <Button variant="info" onClick={downloadPDF}>
            PDF exportieren
          </Button>
        </div>
      </div>

      {/* STOP Principle Legend */}
      <Card className="mb-4">
        <Card.Header>
          <h5>STOP-Prinzip</h5>
        </Card.Header>
        <Card.Body>
          <div className="stop-principle">
            <div className="stop-level stop-s">S - Substitution</div>
            <div className="stop-level stop-t">T - Technische Maßnahmen</div>
            <div className="stop-level stop-o">O - Organisatorische Maßnahmen</div>
            <div className="stop-level stop-p">P - Persönliche Schutzausrüstung</div>
          </div>
        </Card.Body>
      </Card>

      {/* Gefährdungen Table */}
      <Table striped bordered hover className="gbu-table">
        <thead>
          <tr>
            <th>Bereich</th>
            <th>Tätigkeit</th>
            <th>Gefährdung</th>
            <th>Schwere</th>
            <th>Wahrsch.</th>
            <th>Risiko</th>
            <th>S</th>
            <th>T</th>
            <th>O</th>
            <th>P</th>
            <th>Maßnahmen</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {gefaehrdungen.length === 0 ? (
            <tr>
              <td colSpan={12} className="text-center">Keine Gefährdungen vorhanden</td>
            </tr>
          ) : (
            gefaehrdungen.map(gef => {
              const bereich = bereiche.find(b => b.id === gef.bereich_id);
              return (
                <tr key={gef.id}>
                  <td>{bereich?.name || '-'}</td>
                  <td>{gef.tätigkeit}</td>
                  <td>{gef.gefährdung}</td>
                  <td className="text-center">{gef.schadenschwere || '-'}</td>
                  <td className="text-center">{gef.wahrscheinlichkeit || '-'}</td>
                  <td className={`text-center ${getRiskClass(gef.risikobewertung)}`}>
                    {gef.risikobewertung || '-'}
                  </td>
                  <td className="text-center">{gef.s_substitution === 'WAHR' ? '✓' : ''}</td>
                  <td className="text-center">{gef.t_technisch === 'WAHR' ? '✓' : ''}</td>
                  <td className="text-center">{gef.o_organisatorisch === 'WAHR' ? '✓' : ''}</td>
                  <td className="text-center">{gef.p_persoenlich === 'WAHR' ? '✓' : ''}</td>
                  <td>{gef.massnahmen}</td>
                  <td>
                    <Button variant="sm" size="sm">Bearbeiten</Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* Template Selection Modal */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>GBU-Vorlage hinzufügen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Beschreibung</th>
                <th>Saison</th>
                <th>Indoor/Outdoor</th>
                <th>Gefährdungen</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>{template.description}</td>
                  <td>{template.season}</td>
                  <td>{template.indoor_outdoor}</td>
                  <td>{template.gefaehrdungen_count || 0}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddTemplate(template.id)}
                    >
                      Hinzufügen
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GBUEditor;
