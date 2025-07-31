// src/modules/children/components/ChildDeleteDialog.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  open: boolean;
  childName?: string;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ChildDeleteDialog({ open, childName, loading, error, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography>Excluir a criança {childName ? `"${childName}"` : ""}?</Typography>
        {loading && <Box textAlign="center" my={2}><CircularProgress size={24} /></Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>Excluir</Button>
      </DialogActions>
    </Dialog>
  );
}
