'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/lib/api';
import { Contact } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useContacts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: contacts,
    isLoading: contactsLoading,
    error: contactsError,
  } = useQuery({
    queryKey: ['contacts', user?.workspaceId],
    queryFn: async () => {
      if (!user?.workspaceId) return [];
      const response = await contactApi.getByWorkspace(user.workspaceId);
      return response.data;
    },
    enabled: !!user?.workspaceId,
  });

  const createContactMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
    }) => {
      if (!user?.workspaceId) throw new Error('No workspace selected');
      return contactApi.create({ ...data, workspaceId: user.workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts', user?.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', user?.workspaceId],
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      notes?: string;
      lastContactedAt?: string;
    }) => contactApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts', user?.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', user?.workspaceId],
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['contacts', user?.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', user?.workspaceId],
      });
    },
  });

  const searchContacts = async (query: string) => {
    if (!user?.workspaceId || !query.trim()) return [];
    try {
      const response = await contactApi.search(user.workspaceId, query);
      return response.data;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  return {
    // Data
    contacts: contacts as Contact[] | undefined,

    // Loading states
    contactsLoading,

    // Errors
    contactsError,

    // Mutations
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    searchContacts,

    // Mutation states
    isCreatingContact: createContactMutation.isPending,
    isUpdatingContact: updateContactMutation.isPending,
    isDeletingContact: deleteContactMutation.isPending,
  };
};
