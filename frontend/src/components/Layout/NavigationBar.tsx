import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { User } from '../../types';

interface NavigationBarProps {
  user: User;
  onLogout: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ user, onLogout }) => {
  const canManageUsers = user.role === 'admin';
  const canCreateProjects = ['admin', 'projektleiter', 'technischer_leiter'].includes(user.role);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">GBU Management</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/projects">Projekte</Nav.Link>
            {canCreateProjects && (
              <Nav.Link as={Link} to="/projects/new">Neues Projekt</Nav.Link>
            )}
            {canManageUsers && (
              <Nav.Link as={Link} to="/users">Benutzerverwaltung</Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown title={`${user.first_name || user.username} (${user.role})`} align="end">
              <NavDropdown.Item onClick={onLogout}>Abmelden</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
