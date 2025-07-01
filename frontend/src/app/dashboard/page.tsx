'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  People,
  Event,
  TrendingUp,
  Phone,
  Email,
  Message,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/hooks/useWorkspace';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value.toLocaleString()}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'call':
      return <Phone fontSize="small" />;
    case 'email':
      return <Email fontSize="small" />;
    case 'sms':
      return <Message fontSize="small" />;
    default:
      return <Event fontSize="small" />;
  }
};

const getEventColor = (eventType: string) => {
  const colors: Record<string, string> = {
    call: 'success',
    email: 'primary',
    meeting: 'info',
    note: 'warning',
    sms: 'secondary',
    other: 'default',
  };
  return colors[eventType] || 'default';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { dashboardData, dashboardLoading, dashboardError } = useWorkspace();

  if (dashboardError) {
    return (
      <Layout title="Dashboard">
        <Alert severity="error">
          Failed to load dashboard data. Please try again.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here&apos;s an overview of your contacts and recent activity.
        </Typography>
      </Box>

      {dashboardLoading ? (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Contacts"
                value={dashboardData?.totalContacts || 0}
                icon={<People />}
                color="#2196F3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Events"
                value={dashboardData?.totalEvents || 0}
                icon={<Event />}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="This Month"
                value={0}
                icon={<TrendingUp />}
                color="#FF9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Contacts"
                value={dashboardData?.recentContacts?.length || 0}
                icon={<People />}
                color="#9C27B0"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Contacts
                </Typography>
                {dashboardData?.recentContacts?.length ? (
                  <Box sx={{ mt: 2 }}>
                    {dashboardData.recentContacts.slice(0, 5).map((contact) => (
                      <Box
                        key={contact.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: '1px solid #f0f0f0',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {contact.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {contact.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {contact.email ||
                                contact.phone ||
                                'No contact info'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {contact.lastContactedAt
                            ? format(
                                new Date(contact.lastContactedAt),
                                'MMM dd',
                              )
                            : 'Never'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    No contacts yet. Create your first contact to get started.
                  </Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {dashboardData?.recentEvents?.length ? (
                  <Box sx={{ mt: 2 }}>
                    {dashboardData.recentEvents.slice(0, 5).map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: '1px solid #f0f0f0',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              bgcolor: 'secondary.main',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getEventIcon(event.eventType)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {event.description}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                label={event.eventType}
                                size="small"
                                color={
                                  getEventColor(event.eventType) as
                                    | 'primary'
                                    | 'secondary'
                                    | 'success'
                                    | 'error'
                                    | 'info'
                                    | 'warning'
                                    | 'default'
                                }
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(event.eventDate), 'MMM dd')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    No recent activity. Start logging contact events to see them
                    here.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
}
