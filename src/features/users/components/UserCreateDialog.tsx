// UserCreateDialog.tsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, Alert, Box, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { CreateUserForm } from "../types";
import { RoleUser } from "@/store/slices/auth/authSlice";

type Props = {
  open: boolean;
  value: CreateUserForm | null;
  onChange: (v: CreateUserForm) => void;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function UserCreateDialog({
  open, value, onChange, loading, error, onCancel, onConfirm,
}: Props) {
  if (!value) return null;

  const roleOptions = Object.values(RoleUser);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Usuário</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="E-mail"
              value={value.email}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={value.password}
              onChange={(e) => onChange({ ...value, password: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confirmar Senha"
              type="password"
              value={value.confirmPassword || ""}
              onChange={(e) => onChange({ ...value, confirmPassword: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Papel</InputLabel>
              <Select
                label="Papel"
                value={value.role ?? RoleUser.USER}
                onChange={(e) =>
                  onChange({ ...value, role: e.target.value as RoleUser })
                }
              >
                {roleOptions.map((role) => (
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
              value={value.phone || ""}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
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
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading}>
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
