'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Phone,
  Email,
  Event,
  Note,
  Sms,
  Person,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useContactEvents } from '@/hooks/useContactEvents';
import { ContactEvent, ContactEventType } from '@/types';

interface ContactHistoryProps {
  contactId: string;
}

const getEventIcon = (eventType: ContactEventType) => {
  const iconMap = {
    call: <Phone fontSize="small" />,
    email: <Email fontSize="small" />,
    meeting: <Event fontSize="small" />,
    note: <Note fontSize="small" />,
    sms: <Sms fontSize="small" />,
    other: <Note fontSize="small" />,
    created: <Person fontSize="small" />,
    updated: <Edit fontSize="small" />,
    deleted: <Delete fontSize="small" />,
  };
  return iconMap[eventType] || <Note fontSize="small" />;
};

const getEventColor = (
  eventType: ContactEventType,
  isSystemGenerated?: boolean,
) => {
  if (isSystemGenerated) {
    const systemColors = {
      created: 'success',
      updated: 'info',
      deleted: 'error',
    };
    return systemColors[eventType as keyof typeof systemColors] || 'default';
  }

  const userColors = {
    call: 'success',
    email: 'primary',
    meeting: 'info',
    note: 'warning',
    sms: 'secondary',
    other: 'default',
  };
  return userColors[eventType as keyof typeof userColors] || 'default';
};

const getEventTypeLabel = (
  eventType: ContactEventType,
  isSystemGenerated?: boolean,
) => {
  if (isSystemGenerated) {
    const systemLabels = {
      created: 'Contact Created',
      updated: 'Contact Updated',
      deleted: 'Contact Deleted',
    };
    return systemLabels[eventType as keyof typeof systemLabels] || eventType;
  }

  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
};

const EventMetadataDetails: React.FC<{ event: ContactEvent }> = ({ event }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!event.metadata || !event.isSystemGenerated) {
    return null;
  }

  const { contactData, changes, deletedContactData } = event.metadata;

  return (
    <Box sx={{ mt: 1 }}>
      <IconButton
        size="small"
        onClick={() => setExpanded(!expanded)}
        sx={{ p: 0 }}
      >
        {expanded ? <ExpandLess /> : <ExpandMore />}
        <Typography variant="caption" sx={{ ml: 0.5 }}>
          {expanded ? 'Hide Details' : 'Show Details'}
        </Typography>
      </IconButton>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          {contactData && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                Contact Data:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontSize: '0.75rem', mt: 0.5 }}
              >
                {JSON.stringify(contactData, null, 2)}
              </Typography>
            </Box>
          )}

          {changes && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                Changes Made:
              </Typography>
              {Object.entries(changes).map(([field, change]) => (
                <Box key={field} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    <strong>{field}:</strong> "{String(change.from)}" → "
                    {String(change.to)}"
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {deletedContactData && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
              >
                Deleted Contact Data:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontSize: '0.75rem', mt: 0.5 }}
              >
                {JSON.stringify(deletedContactData, null, 2)}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export const ContactHistory: React.FC<ContactHistoryProps> = ({
  contactId,
}) => {
  const { contactEvents, contactEventsLoading, contactEventsError } =
    useContactEvents(contactId);

  if (contactEventsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (contactEventsError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load contact history. Please try again.
      </Alert>
    );
  }

  if (!contactEvents || contactEvents.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No history available for this contact.
        </Typography>
      </Box>
    );
  }

  // Separate system events from user events
  const systemEvents = contactEvents.filter((event) => event.isSystemGenerated);
  const userEvents = contactEvents.filter((event) => !event.isSystemGenerated);

  return (
    <Box>
      {/* User Events Section */}
      {userEvents.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Note sx={{ mr: 1 }} />
              User Activities
            </Typography>
            <List dense>
              {userEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getEventColor(event.eventType, false)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getEventIcon(event.eventType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Chip
                            label={getEventTypeLabel(event.eventType, false)}
                            size="small"
                            color={getEventColor(event.eventType, false) as any}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(event.eventDate),
                              'MMM dd, yyyy - h:mm a',
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {event.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < userEvents.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* System Events Section */}
      {systemEvents.length > 0 && (
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Person sx={{ mr: 1 }} />
              System History
            </Typography>
            <List dense>
              {systemEvents.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${getEventColor(event.eventType, true)}.main`,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {getEventIcon(event.eventType)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Chip
                            label={getEventTypeLabel(event.eventType, true)}
                            size="small"
                            color={getEventColor(event.eventType, true) as any}
                            variant="filled"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(event.eventDate),
                              'MMM dd, yyyy - h:mm a',
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {event.description}
                          </Typography>
                          <EventMetadataDetails event={event} />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < systemEvents.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
