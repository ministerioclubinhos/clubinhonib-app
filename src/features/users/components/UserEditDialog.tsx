import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, Alert, Box, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { UserRow } from "../types";
import { RoleUser } from "@/store/slices/auth/authSlice";

type Props = {
  open: boolean;
  value: Partial<UserRow> | null;
  onChange: (v: Partial<UserRow>) => void;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function UserEditDialog({
  open, value, onChange, loading, error, onCancel, onConfirm,
}: Props) {
  if (!value) return null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              value={value.name ?? ""}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-mail"
              value={value.email ?? ""}
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Papel</InputLabel>
              <Select
                label="Papel"
                value={value.role || RoleUser.USER}
                onChange={(e) => onChange({ ...value, role: e.target.value as RoleUser })}
              >
                {Object.values(RoleUser).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={value.phone ?? ""}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch checked={!!value.active} onChange={(e) => onChange({ ...value, active: e.target.checked })} />}
              label="Ativo"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch checked={!!value.completed} onChange={(e) => onChange({ ...value, completed: e.target.checked })} />}
              label="Cadastro completo"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch checked={!!value.commonUser} onChange={(e) => onChange({ ...value, commonUser: e.target.checked })} />}
              label="Usuário Comum"
            />
          </Grid>
        </Grid>

        {loading && (
          <Box textAlign="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
