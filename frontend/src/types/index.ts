export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  workspaceId?: string;
  workspace?: Workspace;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  users: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  lastContactedAt?: string;
  workspaceId: string;
  workspace?: Workspace;
  events: ContactEvent[];
  createdAt: string;
  updatedAt: string;
}

export type ContactEventType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'sms'
  | 'other'
  | 'created'
  | 'updated'
  | 'deleted';

export interface ContactEventMetadata {
  contactData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  };
  changes?: Record<string, { from: unknown; to: unknown }>;
  updatedFields?: string[];
  deletedContactData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    lastContactedAt?: string;
  };
}

export interface ContactEvent {
  id: string;
  eventType: ContactEventType;
  description: string;
  eventDate: string;
  contactId: string;
  workspaceId: string;
  createdBy: string;
  isSystemGenerated?: boolean;
  metadata?: ContactEventMetadata;
  contact?: Contact;
  workspace?: Workspace;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface DashboardData {
  totalContacts: number;
  totalEvents: number;
  recentContacts: Contact[];
  recentEvents: ContactEvent[];
}
