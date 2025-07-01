import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  signup: (userData: {
    email: string;
    password: string;
    name: string;
    workspaceId?: string;
  }) => api.post('/auth/signup', userData),

  logout: () => api.post('/auth/logout'),
};

// Workspace API
export const workspaceApi = {
  getAll: () => api.get('/workspaces'),
  getById: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/workspaces', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
  getDashboard: (id: string) => api.get(`/workspaces/${id}/dashboard`),
};

// Contact API
export const contactApi = {
  getByWorkspace: (workspaceId: string) =>
    api.get(`/contacts/workspace/${workspaceId}`),
  getById: (id: string) => api.get(`/contacts/${id}`),
  create: (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    workspaceId: string;
  }) => api.post('/contacts', data),
  update: (
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      lastContactedAt?: string;
    },
  ) => api.patch(`/contacts/${id}`, data),
  delete: (id: string) => api.delete(`/contacts/${id}`),
  search: (workspaceId: string, query: string) =>
    api.get(
      `/contacts/workspace/${workspaceId}/search?q=${encodeURIComponent(query)}`,
    ),
};

// Contact Events API
export const contactEventApi = {
  getByContact: (contactId: string) =>
    api.get(`/contact-events/contact/${contactId}`),
  create: (data: {
    eventType: 'call' | 'email' | 'meeting' | 'note' | 'sms' | 'other';
    description: string;
    eventDate: string;
    contactId: string;
  }) => api.post('/contact-events', data),
  update: (
    id: string,
    data: {
      eventType?: 'call' | 'email' | 'meeting' | 'note' | 'sms' | 'other';
      description?: string;
      eventDate?: string;
    },
  ) => api.patch(`/contact-events/${id}`, data),
  delete: (id: string) => api.delete(`/contact-events/${id}`),
};

// User API
export const userApi = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (
    id: string,
    data: {
      name?: string;
      profilePicture?: string;
      workspaceId?: string;
    },
  ) => api.patch(`/users/${id}`, data),
};
