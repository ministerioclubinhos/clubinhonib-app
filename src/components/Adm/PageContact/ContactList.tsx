import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import api from 'config/axiosConfig';
import ContactCard from './ContactCard';
import ContactDetailsModal from './ContactDetailsModal';
import ContactDeleteConfirmModal from './ContactDeleteConfirmModal';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

const ContactList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contact');
      setContacts(data);
      setFilteredContacts(data);
    } catch {
      showSnackbar('Erro ao carregar contatos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = contacts.filter((c) =>
        [c.name, c.email, c.phone, c.message].some((field) =>
          field.toLowerCase().includes(term)
        )
      );
      setFilteredContacts(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, contacts]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    try {
      await api.delete(`/contact/${contactToDelete.id}`);
      showSnackbar('Contato excluído com sucesso', 'success');
      fetchContacts();
    } catch {
      showSnackbar('Erro ao excluir contato', 'error');
    } finally {
      setContactToDelete(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selectedContact) return;
    try {
      await api.patch(`/contact/${selectedContact.id}/read`);
      showSnackbar('Contato marcado como lido', 'success');
      fetchContacts();
    } catch {
      showSnackbar('Erro ao marcar como lido', 'error');
    }
  };

  return (
    <Box sx={{ p: { xs: 0, md: 4 }, mx: 'auto' }}>
      <Typography
        variant="h4"
        mb={4}
        textAlign="center"
        fontWeight="bold"
        sx={{ fontSize: { xs: '1.4rem', md: '2.4rem' } }}
      >
        Contatos Recebidos
      </Typography>

      <TextField
        fullWidth
        placeholder="Buscar por nome, email, telefone ou mensagem..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 4,
          maxWidth: { xs: '100%', md: '60%' },
          mx: 'auto',
        }}
        size={isMobile ? 'small' : 'medium'}
      />


      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredContacts.map((contact) => (
            <Grid item xs={12} sm={6} md={3} key={contact.id}>
              <ContactCard
                contact={contact}
                onView={() => setSelectedContact(contact)}
                onDelete={() => setContactToDelete(contact)}
              />
            </Grid>
          ))}
        </Grid>

      )}

      <ContactDetailsModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onMarkAsRead={handleMarkAsRead}
        onDelete={() => {
          if (selectedContact) setContactToDelete(selectedContact);
          setSelectedContact(null);
        }}
      />

      <ContactDeleteConfirmModal
        contact={contactToDelete}
        onClose={() => setContactToDelete(null)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactList;
