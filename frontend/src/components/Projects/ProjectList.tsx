import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import type { User, Project } from '../../types';

interface ProjectListProps {
  user: User;
}

const ProjectList: React.FC<ProjectListProps> = ({ user }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

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

  if (loading) return <div>Laden...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Projekte</h1>
        {['admin', 'projektleiter', 'technischer_leiter'].includes(user.role) && (
          <Link to="/projects/new">
            <Button variant="primary">Neues Projekt</Button>
          </Link>
        )}
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Ort</th>
            <th>Startdatum</th>
            <th>Saison</th>
            <th>Indoor/Outdoor</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.location}</td>
              <td>{project.start_date ? new Date(project.start_date).toLocaleDateString('de-DE') : '-'}</td>
              <td>{project.season || '-'}</td>
              <td>{project.indoor_outdoor || '-'}</td>
              <td><Badge bg="primary">{project.status}</Badge></td>
              <td>
                <Link to={`/projects/${project.id}`}>
                  <Button variant="sm" size="sm">Details</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjectList;
