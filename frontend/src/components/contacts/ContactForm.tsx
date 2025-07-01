'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Contact } from '@/types';
import { useContacts } from '@/hooks/useContacts';

const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  contact?: Contact;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  onSuccess,
  onCancel,
}) => {
  const { createContact, updateContact, isCreatingContact, isUpdatingContact } =
    useContacts();
  const isEditing = !!contact;
  const loading = isCreatingContact || isUpdatingContact;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        notes: contact.notes || '',
      });
    }
  }, [contact, reset]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      };

      if (isEditing) {
        updateContact({ id: contact.id, ...contactData });
      } else {
        createContact(contactData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {isEditing ? 'Edit Contact' : 'Create New Contact'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register('name')}
          fullWidth
          label="Full Name"
          margin="normal"
          required
          error={!!errors.name}
          helperText={errors.name?.message}
          autoFocus
        />

        <TextField
          {...register('email')}
          fullWidth
          label="Email Address"
          type="email"
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          {...register('phone')}
          fullWidth
          label="Phone Number"
          margin="normal"
          error={!!errors.phone}
          helperText={errors.phone?.message}
        />

        <TextField
          {...register('address')}
          fullWidth
          label="Address"
          margin="normal"
          multiline
          rows={2}
          error={!!errors.address}
          helperText={errors.address?.message}
        />

        <TextField
          {...register('notes')}
          fullWidth
          label="Notes"
          margin="normal"
          multiline
          rows={3}
          error={!!errors.notes}
          helperText={errors.notes?.message}
          placeholder="Additional notes about this contact..."
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ flexGrow: 1 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditing ? (
              'Update Contact'
            ) : (
              'Create Contact'
            )}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
