import React, { useEffect, useState } from 'react';
import { Card, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import type { User, Project } from '../../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      planung: 'secondary',
      aktiv: 'primary',
      abgeschlossen: 'success',
      archiviert: 'dark',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const activeProjects = projects.filter(p => p.status === 'aktiv');
  const planningProjects = projects.filter(p => p.status === 'planung');

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="text-muted">Willkommen, {user.first_name || user.username}!</p>

      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Projekte gesamt</Card.Title>
              <h2>{projects.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Aktive Projekte</Card.Title>
              <h2>{activeProjects.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>In Planung</Card.Title>
              <h2>{planningProjects.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Ihre Rolle</Card.Title>
              <h5>{user.role}</h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Aktive Projekte</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item>Laden...</ListGroup.Item>
              ) : activeProjects.length === 0 ? (
                <ListGroup.Item>Keine aktiven Projekte</ListGroup.Item>
              ) : (
                activeProjects.map(project => (
                  <ListGroup.Item key={project.id}>
                    <Link to={`/projects/${project.id}`} className="text-decoration-none">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{project.name}</strong>
                          <br />
                          <small className="text-muted">{project.location}</small>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </Link>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Projekte in Planung</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {loading ? (
                <ListGroup.Item>Laden...</ListGroup.Item>
              ) : planningProjects.length === 0 ? (
                <ListGroup.Item>Keine Projekte in Planung</ListGroup.Item>
              ) : (
                planningProjects.map(project => (
                  <ListGroup.Item key={project.id}>
                    <Link to={`/projects/${project.id}`} className="text-decoration-none">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{project.name}</strong>
                          <br />
                          <small className="text-muted">{project.location}</small>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>
                    </Link>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
