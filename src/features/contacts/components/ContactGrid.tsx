import React from 'react';
import { Grid, Box, CircularProgress, Typography } from '@mui/material';
import ContactCard from './ContactCard';
import { Contact } from '../types';

type Props = {
  items: Contact[];
  loading: boolean;
  onView: (c: Contact) => void;
  onDeleteAsk: (c: Contact) => void;
};

export default function ContactGrid({ items, loading, onView, onDeleteAsk }: Props) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items.length) {
    return (
      <Box textAlign="center" mt={6}>
        <Typography variant="body2" color="text.secondary">
          Nenhum contato encontrado.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {items.map((contact) => (
        <Grid item xs={12} sm={6} md={3} key={contact.id}>
          <ContactCard
            contact={{
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              read: contact.read,
            }}
            onView={() => onView(contact)}
            onDelete={() => onDeleteAsk(contact)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
