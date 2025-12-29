import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectList from './components/Projects/ProjectList';
import ProjectDetail from './components/Projects/ProjectDetail';
import CreateProject from './components/Projects/CreateProject';
import UserManagement from './components/Users/UserManagement';
import GBUEditor from './components/GBU/GBUEditor';
import ParticipantManager from './components/Participants/ParticipantManager';
import UnterweisungEditor from './components/Unterweisung/UnterweisungEditor';
import NavigationBar from './components/Layout/NavigationBar';
import { authAPI } from './services/api';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </Container>
    );
  }

  return (
    <Router>
      {user && <NavigationBar user={user} onLogout={handleLogout} />}

      <Container className="mt-4">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } />

          <Route path="/" element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" />
          } />

          <Route path="/projects" element={
            user ? <ProjectList user={user} /> : <Navigate to="/login" />
          } />

          <Route path="/projects/new" element={
            user ? <CreateProject /> : <Navigate to="/login" />
          } />

          <Route path="/projects/:id" element={
            user ? <ProjectDetail user={user} /> : <Navigate to="/login" />
          } />

          <Route path="/projects/:projectId/gbu" element={
            user ? <GBUEditor /> : <Navigate to="/login" />
          } />

          <Route path="/projects/:projectId/participants" element={
            user ? <ParticipantManager /> : <Navigate to="/login" />
          } />

          <Route path="/projects/:projectId/unterweisung" element={
            user ? <UnterweisungEditor /> : <Navigate to="/login" />
          } />

          <Route path="/users" element={
            user?.role === 'admin' ? <UserManagement /> : <Navigate to="/" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
