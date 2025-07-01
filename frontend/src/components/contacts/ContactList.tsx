'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Search,
  Person,
  Phone,
  Email,
  LocationOn,
  MoreVert,
  Edit,
  Delete,
  History,
  Add,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Contact } from '@/types';
import { useContacts } from '@/hooks/useContacts';

interface ContactListProps {
  onEdit: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
  onCreateNew: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  onEdit,
  onViewHistory,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    contacts,
    contactsLoading,
    contactsError,
    deleteContact,
    isDeletingContact,
    searchContacts,
  } = useContacts();

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    contact: Contact,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedContact(contact);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContact(null);
  };

  const handleDelete = () => {
    if (selectedContact) {
      deleteContact(selectedContact.id);
      handleMenuClose();
    }
  };

  const handleEdit = () => {
    if (selectedContact) {
      onEdit(selectedContact);
      handleMenuClose();
    }
  };

  const handleViewHistory = () => {
    if (selectedContact) {
      onViewHistory(selectedContact);
      handleMenuClose();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchContacts(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const displayContacts = searchQuery.trim() ? searchResults : contacts || [];

  const formatLastContact = (dateString?: string) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (contactsError) {
    return (
      <Alert severity="error">Failed to load contacts. Please try again.</Alert>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Contacts
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={onCreateNew}>
          Add Contact
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {contactsLoading ? (
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" sx={{ fontSize: '1.2rem', mt: 1 }} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {displayContacts.map((contact) => (
            <Grid item xs={12} sm={6} md={4} key={contact.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      mb: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, contact)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" component="h2" gutterBottom>
                    {contact.name}
                  </Typography>

                  {contact.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Email
                        sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {contact.email}
                      </Typography>
                    </Box>
                  )}

                  {contact.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Phone
                        sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {contact.phone}
                      </Typography>
                    </Box>
                  )}

                  {contact.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {contact.address}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Chip
                      label={`Last contact: ${formatLastContact(contact.lastContactedAt)}`}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {contact.events?.length || 0} events
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {displayContacts.length === 0 && !contactsLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first contact to get started'}
          </Typography>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleViewHistory}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          View History
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isDeletingContact}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
