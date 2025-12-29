import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { projectsAPI } from '../../services/api';
import type { User, Project } from '../../types';

interface ProjectDetailProps {
  user: User;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (id) {
          const data = await projectsAPI.getById(parseInt(id));
          setProject(data);
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <div>Laden...</div>;
  if (!project) return <div>Projekt nicht gefunden</div>;

  return (
    <div>
      <h1>{project.name}</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Beschreibung:</strong> {project.description || '-'}</p>
              <p><strong>Ort:</strong> {project.location || '-'}</p>
              <p><strong>Aufbaudatum:</strong> {project.aufbau_datum ? new Date(project.aufbau_datum).toLocaleDateString('de-DE') : '-'}</p>
              <p><strong>Startdatum:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '-'}</p>
              <p><strong>Enddatum:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString('de-DE') : '-'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Saison:</strong> {project.season || '-'}</p>
              <p><strong>Indoor/Outdoor:</strong> {project.indoor_outdoor || '-'}</p>
              <p><strong>Status:</strong> {project.status}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="overview" className="mb-3">
        <Tab eventKey="overview" title="Übersicht">
          <Card>
            <Card.Body>
              <h5>Projektübersicht</h5>
              <div className="d-flex gap-2 mb-3">
                <Link to={`/projects/${project.id}/gbu`}>
                  <Button variant="primary">GBU bearbeiten</Button>
                </Link>
                <Link to={`/projects/${project.id}/participants`}>
                  <Button variant="success">Teilnehmer verwalten</Button>
                </Link>
                <Link to={`/projects/${project.id}/unterweisung`}>
                  <Button variant="info">Unterweisung erstellen</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="gbu" title="Gefährdungsbeurteilungen">
          <Card>
            <Card.Body>
              <p>Gefährdungsbeurteilungen für dieses Projekt</p>
              <Link to={`/projects/${project.id}/gbu`}>
                <Button variant="primary">GBU bearbeiten</Button>
              </Link>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="participants" title="Teilnehmer">
          <Card>
            <Card.Body>
              <p>Teilnehmerverwaltung</p>
              <Link to={`/projects/${project.id}/participants`}>
                <Button variant="success">Teilnehmer verwalten</Button>
              </Link>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
