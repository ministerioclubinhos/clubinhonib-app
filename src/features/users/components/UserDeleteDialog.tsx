import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { UserRow } from "../types";

type Props = {
  open: boolean;
  user: UserRow | null;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function UserDeleteDialog({ open, user, loading, error, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography>Tem certeza que deseja excluir <strong>{user?.name}</strong>?</Typography>
        {loading && <Box textAlign="center" my={2}><CircularProgress size={24} /></Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>Excluir</Button>
      </DialogActions>
    </Dialog>
  );
}
