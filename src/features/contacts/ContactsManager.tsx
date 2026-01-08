import React from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import { useContacts, useContactMutations, useContactSearch } from './hooks';
import ContactToolbar from './components/ContactToolbar';
import ContactGrid from './components/ContactGrid';
import ContactDetailsModal from './components/ContactDetailsModal';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import BackHeader from '@/components/common/header/BackHeader';
import { Contact, SnackbarKind } from './types';

export default function ContactsManager() {
  const { contacts, loading, error, setError, fetchContacts } = useContacts();
  const { searchTerm, setSearchTerm, filtered } = useContactSearch(contacts);
  const {
    busy,
    error: mError,
    setError: setMError,
    remove,
    markAsRead,
  } = useContactMutations(fetchContacts);

  const [selected, setSelected] = React.useState<Contact | null>(null);
  const [toDelete, setToDelete] = React.useState<Contact | null>(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as SnackbarKind,
  });

  const showSnackbar = (message: string, severity: SnackbarKind) =>
    setSnackbar({ open: true, message, severity });

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      showSnackbar('Contato excluído com sucesso', 'success');
    } catch {
      showSnackbar(mError || 'Erro ao excluir contato', 'error');
    } finally {
      setToDelete(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selected) return;
    try {
      await markAsRead(selected.id);
      showSnackbar('Contato marcado como lido', 'success');
    } catch {
      showSnackbar(mError || 'Erro ao marcar como lido', 'error');
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 2, md: 4 } }}>
      <BackHeader title="Gerenciar Contatos" />

      <ContactToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchContacts}
      />

      <ContactGrid
        items={filtered}
        loading={loading}
        onView={(c) => setSelected(c)}
        onDeleteAsk={(c) => setToDelete(c)}
      />

      <ContactDetailsModal
        contact={selected}
        onClose={() => setSelected(null)}
        onMarkAsRead={handleMarkAsRead}
        onDelete={() => {
          if (selected) setToDelete(selected);
          setSelected(null);
        }}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        title={toDelete?.name || ''}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      {!loading && error && (
        <Snackbar open autoHideDuration={4000} onClose={() => setError('')}>
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      )}
      {mError && (
        <Snackbar open autoHideDuration={4000} onClose={() => setMError('')}>
          <Alert severity="error" variant="filled">
            {mError}
          </Alert>
        </Snackbar>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
