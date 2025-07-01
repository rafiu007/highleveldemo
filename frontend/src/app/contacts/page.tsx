'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Layout } from '@/components/layout/Layout';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactForm } from '@/components/contacts/ContactForm';
import { Contact } from '@/types';

export default function ContactsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCreateNew = () => {
    setSelectedContact(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };

  const handleViewHistory = (contact: Contact) => {
    setSelectedContact(contact);
    setIsHistoryOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedContact(undefined);
  };

  const handleHistoryClose = () => {
    setIsHistoryOpen(false);
    setSelectedContact(undefined);
  };

  const handleFormSuccess = () => {
    handleFormClose();
  };

  return (
    <Layout title="Contacts">
      <ContactList
        onEdit={handleEdit}
        onViewHistory={handleViewHistory}
        onCreateNew={handleCreateNew}
      />

      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Create New Contact'}
        </DialogTitle>
        <DialogContent>
          <ContactForm
            contact={selectedContact}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isHistoryOpen}
        onClose={handleHistoryClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Contact History - {selectedContact?.name}</DialogTitle>
        <DialogContent>
          {/* Contact history component would go here */}
          <p>
            Contact history for {selectedContact?.name} would be displayed here.
          </p>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
