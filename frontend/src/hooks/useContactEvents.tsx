'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactEventApi } from '@/lib/api';
import { ContactEvent, ContactEventType } from '@/types';

export const useContactEvents = (contactId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: contactEvents,
    isLoading: contactEventsLoading,
    error: contactEventsError,
  } = useQuery({
    queryKey: ['contactEvents', contactId],
    queryFn: async () => {
      if (!contactId) return [];
      const response = await contactEventApi.getByContact(contactId);
      return response.data;
    },
    enabled: !!contactId,
  });

  const createContactEventMutation = useMutation({
    mutationFn: (data: {
      eventType: ContactEventType;
      description: string;
      eventDate: string;
      contactId: string;
    }) => contactEventApi.create(data),
    onSuccess: () => {
      if (contactId) {
        queryClient.invalidateQueries({
          queryKey: ['contactEvents', contactId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateContactEventMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      eventType?: ContactEventType;
      description?: string;
      eventDate?: string;
    }) => contactEventApi.update(id, data),
    onSuccess: () => {
      if (contactId) {
        queryClient.invalidateQueries({
          queryKey: ['contactEvents', contactId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteContactEventMutation = useMutation({
    mutationFn: (id: string) => contactEventApi.delete(id),
    onSuccess: () => {
      if (contactId) {
        queryClient.invalidateQueries({
          queryKey: ['contactEvents', contactId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    // Data
    contactEvents: contactEvents as ContactEvent[] | undefined,

    // Loading states
    contactEventsLoading,

    // Errors
    contactEventsError,

    // Mutations
    createContactEvent: createContactEventMutation.mutate,
    updateContactEvent: updateContactEventMutation.mutate,
    deleteContactEvent: deleteContactEventMutation.mutate,

    // Mutation states
    isCreatingContactEvent: createContactEventMutation.isPending,
    isUpdatingContactEvent: updateContactEventMutation.isPending,
    isDeletingContactEvent: deleteContactEventMutation.isPending,
  };
};
