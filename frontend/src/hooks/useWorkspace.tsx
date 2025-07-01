'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api';
import { Workspace, DashboardData } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useWorkspace = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: workspaces,
    isLoading: workspacesLoading,
    error: workspacesError,
  } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await workspaceApi.getAll();
      return response.data;
    },
    enabled: !!user,
  });

  const {
    data: currentWorkspace,
    isLoading: currentWorkspaceLoading,
    error: currentWorkspaceError,
  } = useQuery({
    queryKey: ['workspace', user?.workspaceId],
    queryFn: async () => {
      if (!user?.workspaceId) return null;
      const response = await workspaceApi.getById(user.workspaceId);
      return response.data;
    },
    enabled: !!user?.workspaceId,
  });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard', user?.workspaceId],
    queryFn: async () => {
      if (!user?.workspaceId) return null;
      const response = await workspaceApi.getDashboard(user.workspaceId);
      return response.data;
    },
    enabled: !!user?.workspaceId,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      workspaceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
    }) => workspaceApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (id: string) => workspaceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  return {
    // Data
    workspaces: workspaces as Workspace[] | undefined,
    currentWorkspace: currentWorkspace as Workspace | null,
    dashboardData: dashboardData as DashboardData | null,

    // Loading states
    workspacesLoading,
    currentWorkspaceLoading,
    dashboardLoading,

    // Errors
    workspacesError,
    currentWorkspaceError,
    dashboardError,

    // Mutations
    createWorkspace: createWorkspaceMutation.mutate,
    updateWorkspace: updateWorkspaceMutation.mutate,
    deleteWorkspace: deleteWorkspaceMutation.mutate,

    // Mutation states
    isCreatingWorkspace: createWorkspaceMutation.isPending,
    isUpdatingWorkspace: updateWorkspaceMutation.isPending,
    isDeletingWorkspace: deleteWorkspaceMutation.isPending,
  };
};
