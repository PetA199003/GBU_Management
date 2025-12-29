import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Table, Form, Modal } from 'react-bootstrap';
import { participantsAPI, pdfAPI } from '../../services/api';
import type { Participant } from '../../types';
// @ts-ignore
import SignatureCanvas from 'react-signature-canvas';

const ParticipantManager: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const signaturePad = useRef<any>(null);

  useEffect(() => {
    fetchParticipants();
  }, [projectId]);

  const fetchParticipants = async () => {
    if (!projectId) return;

    try {
      const data = await participantsAPI.getByProject(parseInt(projectId));
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    try {
      const result = await participantsAPI.importCSV(parseInt(projectId), file);
      alert(`${result.imported_count} Teilnehmer importiert`);
      fetchParticipants();
    } catch (error) {
      console.error('Failed to import CSV:', error);
      alert('Fehler beim Import');
    }
  };

  const handleSaveSignature = async () => {
    if (!selectedParticipant || !signaturePad.current) return;

    const signatureData = signaturePad.current.toDataURL();

    try {
      await participantsAPI.addSignature(selectedParticipant.id, signatureData);
      fetchParticipants();
      setShowSignatureModal(false);
      setSelectedParticipant(null);
    } catch (error) {
      console.error('Failed to save signature:', error);
    }
  };

  const downloadPDF = async () => {
    if (!projectId) return;

    try {
      const blob = await pdfAPI.generateParticipants(parseInt(projectId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Teilnehmerliste_Projekt_${projectId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Teilnehmerverwaltung</h1>
        <div className="d-flex gap-2">
          <label className="btn btn-success">
            CSV importieren
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Teilnehmer hinzufügen
          </Button>
          <Button variant="info" onClick={downloadPDF}>
            PDF exportieren
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Vorname</th>
                <th>E-Mail</th>
                <th>Position</th>
                <th>Firma</th>
                <th>Unterschrift</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">Keine Teilnehmer vorhanden</td>
                </tr>
              ) : (
                participants.map(participant => (
                  <tr key={participant.id}>
                    <td>{participant.last_name}</td>
                    <td>{participant.first_name}</td>
                    <td>{participant.email}</td>
                    <td>{participant.position}</td>
                    <td>{participant.company}</td>
                    <td>
                      {participant.signature_type === 'digital' && '✓ Digital'}
                      {participant.signature_type === 'analog' && '✓ Analog'}
                      {participant.signature_type === 'pending' && 'Ausstehend'}
                    </td>
                    <td>
                      {participant.signature_type === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedParticipant(participant);
                            setShowSignatureModal(true);
                          }}
                        >
                          Unterschreiben
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Signature Modal */}
      <Modal show={showSignatureModal} onHide={() => setShowSignatureModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Digitale Unterschrift</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Unterschrift für: {selectedParticipant?.first_name} {selectedParticipant?.last_name}</p>
          <div style={{ border: '1px solid #ccc', borderRadius: 4 }}>
            <SignatureCanvas
              ref={signaturePad}
              canvasProps={{
                width: 450,
                height: 200,
                className: 'signature-pad'
              }}
            />
          </div>
          <div className="mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => signaturePad.current?.clear()}
            >
              Löschen
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSignatureModal(false)}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={handleSaveSignature}>
            Speichern
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ParticipantManager;
