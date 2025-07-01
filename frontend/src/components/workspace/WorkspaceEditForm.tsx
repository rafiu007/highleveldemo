'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Workspace } from '@/types';

interface WorkspaceEditFormProps {
  workspace: Workspace;
  onCancel: () => void;
  onSuccess: () => void;
}

export const WorkspaceEditForm: React.FC<WorkspaceEditFormProps> = ({
  workspace,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: workspace.name,
    description: workspace.description || '',
    isActive: workspace.isActive,
  });
  const [error, setError] = useState<string | null>(null);

  const { updateWorkspace, isUpdatingWorkspace } = useWorkspace();

  const handleChange =
    (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'isActive'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      updateWorkspace({
        id: workspace.id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });
      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update workspace',
      );
    }
  };

  const isFormChanged =
    formData.name !== workspace.name ||
    formData.description !== (workspace.description || '') ||
    formData.isActive !== workspace.isActive;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Edit Workspace
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Workspace Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              error={!formData.name.trim()}
              helperText={
                !formData.name.trim() ? 'Workspace name is required' : ''
              }
              disabled={isUpdatingWorkspace}
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={4}
              placeholder="Enter a description for your workspace..."
              disabled={isUpdatingWorkspace}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleChange('isActive')}
                  disabled={isUpdatingWorkspace}
                />
              }
              label={`Workspace is ${formData.isActive ? 'Active' : 'Inactive'}`}
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={isUpdatingWorkspace}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={
                  !isFormChanged || isUpdatingWorkspace || !formData.name.trim()
                }
              >
                {isUpdatingWorkspace ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
