import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, Alert, Box, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { CreateUserForm } from "../types";
import { UserRole } from "@/store/slices/auth/authSlice";
import { SimplePhoneInput } from "@/components/common/inputs";

type Props = {
  open: boolean;
  value: CreateUserForm | null;
  onChange: (v: CreateUserForm) => void;
  loading: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const roleLabels: Record<UserRole, string> = {
  [UserRole.COORDINATOR]: "Coordenador",
  [UserRole.TEACHER]: "Professor",
  [UserRole.ADMIN]: "Administrador", 
};

export default function UserCreateDialog({
  open, value, onChange, loading, error, onCancel, onConfirm,
}: Props) {
  if (!value) return null;

  const roleOptions = [UserRole.COORDINATOR, UserRole.TEACHER];

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
                value={value.role ?? UserRole.TEACHER}
                onChange={(e) =>
                  onChange({ ...value, role: e.target.value as UserRole })
                }
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role} value={role}>
                    {roleLabels[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <SimplePhoneInput
              value={value.phone || ""}
              onChange={(phone) => onChange({ ...value, phone })}
              margin="none"
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
