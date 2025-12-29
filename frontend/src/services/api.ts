import axios from 'axios';
import type { User, Project, Bereich, GBUTemplate, Gefaehrdung, Participant, Unterweisung, AuthResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  update: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getByRole: async (role: string): Promise<User[]> => {
    const response = await api.get(`/users/by-role/${role}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },

  update: async (id: number, projectData: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  assignUser: async (projectId: number, userId: number): Promise<void> => {
    await api.post(`/projects/${projectId}/assign`, { user_id: userId });
  },

  unassignUser: async (projectId: number, userId: number): Promise<void> => {
    await api.delete(`/projects/${projectId}/unassign/${userId}`);
  },

  getAssignments: async (projectId: number): Promise<any[]> => {
    const response = await api.get(`/projects/${projectId}/assignments`);
    return response.data;
  },
};

// Bereiche API
export const bereicheAPI = {
  getAll: async (): Promise<Bereich[]> => {
    const response = await api.get('/bereiche/');
    return response.data;
  },

  create: async (bereichData: Partial<Bereich>): Promise<Bereich> => {
    const response = await api.post('/bereiche/', bereichData);
    return response.data;
  },

  assignToBereichsleiter: async (projectId: number, bereichId: number, bereichsleiterId: number): Promise<void> => {
    await api.post(`/bereiche/project/${projectId}/assign`, {
      bereich_id: bereichId,
      bereichsleiter_id: bereichsleiterId,
    });
  },

  getProjectAssignments: async (projectId: number): Promise<any[]> => {
    const response = await api.get(`/bereiche/project/${projectId}/assignments`);
    return response.data;
  },
};

// GBU API
export const gbuAPI = {
  getTemplates: async (season?: string, indoorOutdoor?: string): Promise<GBUTemplate[]> => {
    const params = new URLSearchParams();
    if (season) params.append('season', season);
    if (indoorOutdoor) params.append('indoor_outdoor', indoorOutdoor);

    const response = await api.get(`/gbu/templates?${params.toString()}`);
    return response.data;
  },

  getTemplate: async (id: number): Promise<GBUTemplate> => {
    const response = await api.get(`/gbu/templates/${id}`);
    return response.data;
  },

  createTemplate: async (templateData: Partial<GBUTemplate>): Promise<GBUTemplate> => {
    const response = await api.post('/gbu/templates', templateData);
    return response.data;
  },

  createGefaehrdung: async (gefaehrdungData: Partial<Gefaehrdung>): Promise<Gefaehrdung> => {
    const response = await api.post('/gbu/gefaehrdungen', gefaehrdungData);
    return response.data;
  },

  updateGefaehrdung: async (id: number, gefaehrdungData: Partial<Gefaehrdung>): Promise<Gefaehrdung> => {
    const response = await api.put(`/gbu/gefaehrdungen/${id}`, gefaehrdungData);
    return response.data;
  },

  deleteGefaehrdung: async (id: number): Promise<void> => {
    await api.delete(`/gbu/gefaehrdungen/${id}`);
  },

  getProjectGBUs: async (projectId: number): Promise<any> => {
    const response = await api.get(`/gbu/project/${projectId}/gbus`);
    return response.data;
  },

  addTemplateToProject: async (projectId: number, templateId: number): Promise<void> => {
    await api.post(`/gbu/project/${projectId}/add-template`, { template_id: templateId });
  },

  copyTemplateToProject: async (projectId: number, templateId: number): Promise<Gefaehrdung[]> => {
    const response = await api.post(`/gbu/project/${projectId}/copy-template/${templateId}`);
    return response.data;
  },
};

// Participants API
export const participantsAPI = {
  getByProject: async (projectId: number): Promise<Participant[]> => {
    const response = await api.get(`/participants/project/${projectId}`);
    return response.data;
  },

  create: async (participantData: Partial<Participant>): Promise<Participant> => {
    const response = await api.post('/participants/', participantData);
    return response.data;
  },

  update: async (id: number, participantData: Partial<Participant>): Promise<Participant> => {
    const response = await api.put(`/participants/${id}`, participantData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/participants/${id}`);
  },

  importCSV: async (projectId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/participants/project/${projectId}/import-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  addSignature: async (id: number, signatureData: string): Promise<Participant> => {
    const response = await api.post(`/participants/${id}/sign`, { signature_data: signatureData });
    return response.data;
  },

  markAnalogSigned: async (id: number): Promise<Participant> => {
    const response = await api.post(`/participants/${id}/mark-analog-signed`);
    return response.data;
  },
};

// Unterweisung API
export const unterweisungAPI = {
  getByProject: async (projectId: number): Promise<Unterweisung[]> => {
    const response = await api.get(`/unterweisung/project/${projectId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Unterweisung> => {
    const response = await api.get(`/unterweisung/${id}`);
    return response.data;
  },

  create: async (unterweisungData: Partial<Unterweisung>): Promise<Unterweisung> => {
    const response = await api.post('/unterweisung/', unterweisungData);
    return response.data;
  },

  update: async (id: number, unterweisungData: Partial<Unterweisung>): Promise<Unterweisung> => {
    const response = await api.put(`/unterweisung/${id}`, unterweisungData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/unterweisung/${id}`);
  },

  generate: async (projectId: number): Promise<Unterweisung> => {
    const response = await api.post(`/unterweisung/project/${projectId}/generate`);
    return response.data;
  },
};

// PDF API
export const pdfAPI = {
  generateGBU: async (projectId: number): Promise<Blob> => {
    const response = await api.get(`/pdf/project/${projectId}/gbu`, { responseType: 'blob' });
    return response.data;
  },

  generateParticipants: async (projectId: number): Promise<Blob> => {
    const response = await api.get(`/pdf/project/${projectId}/participants`, { responseType: 'blob' });
    return response.data;
  },

  generateUnterweisung: async (unterweisungId: number): Promise<Blob> => {
    const response = await api.get(`/pdf/unterweisung/${unterweisungId}`, { responseType: 'blob' });
    return response.data;
  },
};

export default api;
