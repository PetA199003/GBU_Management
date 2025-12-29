import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { usersAPI } from '../../services/api';
import type { User } from '../../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Laden...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Benutzerverwaltung</h1>
        <Button variant="primary">Neuer Benutzer</Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Benutzername</th>
            <th>Name</th>
            <th>E-Mail</th>
            <th>Rolle</th>
            <th>Status</th>
            <th>Erstellt am</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td><Badge bg="primary">{user.role}</Badge></td>
              <td>
                <Badge bg={user.active ? 'success' : 'danger'}>
                  {user.active ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString('de-DE')}</td>
              <td>
                <Button variant="sm" size="sm">Bearbeiten</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserManagement;
