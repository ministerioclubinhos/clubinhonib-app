import React from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useContacts, useContactMutations, useContactSearch } from "./hooks";
import ContactToolbar from "./components/ContactToolbar";
import ContactGrid from "./components/ContactGrid";
import ContactDetailsModal from "./components/ContactDetailsModal";
import ContactDeleteConfirmModal from "./components/ContactDeleteConfirmModal";
import { Contact, SnackbarKind } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

export default function ContactList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // data
  const { contacts, loading, error, setError, fetchContacts } = useContacts();
  const { searchTerm, setSearchTerm, filtered } = useContactSearch(contacts);
  const { busy, error: mError, setError: setMError, remove, markAsRead } =
    useContactMutations(fetchContacts);

  // ui
  const [selected, setSelected] = React.useState<Contact | null>(null);
  const [toDelete, setToDelete] = React.useState<Contact | null>(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success" as SnackbarKind,
  });

  const showSnackbar = (message: string, severity: SnackbarKind) =>
    setSnackbar({ open: true, message, severity });

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await remove(toDelete.id);
      showSnackbar("Contato excluído com sucesso", "success");
    } catch {
      showSnackbar(mError || "Erro ao excluir contato", "error");
    } finally {
      setToDelete(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (!selected) return;
    try {
      await markAsRead(selected.id);
      showSnackbar("Contato marcado como lido", "success");
    } catch {
      showSnackbar(mError || "Erro ao marcar como lido", "error");
    }
  };

  return (
    <Box sx={{
      px: { xs: 2, sm: 2, md: 4 },
      py: { xs: 0, md: 4 }, mx: "auto"
    }}>
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

      <ContactDeleteConfirmModal
        contact={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* errors from data/mutations */}
      {!loading && error && (
        <Snackbar open autoHideDuration={4000} onClose={() => setError("")}>
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      )}
      {mError && (
        <Snackbar open autoHideDuration={4000} onClose={() => setMError("")}>
          <Alert severity="error" variant="filled">
            {mError}
          </Alert>
        </Snackbar>
      )}

      {/* feedback */}
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
