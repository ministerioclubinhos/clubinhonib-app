import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, Alert } from "@mui/material";

export type EditState = {
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
};

type Props = {
  open: boolean;
  value: EditState;
  setValue: (v: EditState) => void;
  errors: { comment: boolean; clubinho: boolean; neighborhood: boolean; };
  loading: boolean;
  error: string;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditCommentDialog({
  open, value, setValue, errors, loading, error, onCancel, onSave,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Comentário</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 2 }}>
          {(["name", "comment", "clubinho", "neighborhood"] as const).map((field) => (
            <TextField
              key={field}
              fullWidth
              required={field !== "name"}
              label={`${field.charAt(0).toUpperCase() + field.slice(1)}${field !== "name" ? " (Obrigatório)" : ""}`}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
              multiline={field === "comment"}
              rows={field === "comment" ? 3 : 1}
              value={value[field]}
              onChange={(e) => setValue({ ...value, [field]: e.target.value })}
              error={errors[field as keyof typeof errors] as boolean}
              helperText={
                errors[field as keyof typeof errors]
                  ? `${field.charAt(0).toUpperCase() + field.slice(1)} é obrigatório`
                  : ""
              }
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "#757575" }}>Cancelar</Button>
        <Button color="primary" variant="contained" onClick={onSave} disabled={loading}
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#1565c0" } }}>
          Salvar e Publicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
