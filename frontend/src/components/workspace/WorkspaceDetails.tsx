'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  Edit,
  Business,
  Person,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useWorkspace } from '@/hooks/useWorkspace';
import { WorkspaceEditForm } from './WorkspaceEditForm';

export const WorkspaceDetails: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    currentWorkspace,
    currentWorkspaceLoading,
    currentWorkspaceError,
    isUpdatingWorkspace,
  } = useWorkspace();

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  if (currentWorkspaceLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (currentWorkspaceError) {
    return (
      <Alert severity="error">
        Failed to load workspace details: {currentWorkspaceError.message}
      </Alert>
    );
  }

  if (!currentWorkspace) {
    return (
      <Alert severity="warning">
        No workspace found. Please contact support.
      </Alert>
    );
  }

  if (isEditing) {
    return (
      <WorkspaceEditForm
        workspace={currentWorkspace}
        onCancel={handleEditToggle}
        onSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        {/* Main Workspace Info */}
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Business color="primary" fontSize="large" />
                <Typography variant="h4" component="h1">
                  {currentWorkspace.name}
                </Typography>
                <Chip
                  icon={
                    currentWorkspace.isActive ? <CheckCircle /> : <Cancel />
                  }
                  label={currentWorkspace.isActive ? 'Active' : 'Inactive'}
                  color={currentWorkspace.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditToggle}
                disabled={isUpdatingWorkspace}
              >
                Edit
              </Button>
            </Box>

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentWorkspace.description || 'No description provided'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Workspace Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentWorkspace.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {new Date(currentWorkspace.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {currentWorkspace.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Team Members ({currentWorkspace.users?.length || 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {currentWorkspace.users && currentWorkspace.users.length > 0 ? (
              <List>
                {currentWorkspace.users.map((user, index) => (
                  <ListItem
                    key={user.id}
                    divider={index < currentWorkspace.users.length - 1}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.name} secondary={user.email} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No team members found
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};
