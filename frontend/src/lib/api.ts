import axios from 'axios';

// Use localhost since backend and frontend are on the same device
const API_BASE_URL = 'http://localhost:3000';

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null; // SSR safety
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getCookie('token');
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
      deleteCookie('token');
      deleteCookie('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
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
