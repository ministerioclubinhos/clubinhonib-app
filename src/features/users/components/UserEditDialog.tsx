import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  TextField, Alert, Box, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { UserRole } from "@/types/shared";
import { UpdateUserForm } from "../types";
import { SimplePhoneInput } from "@/components/common/inputs";

type Props = {
  open: boolean;
  value: (UpdateUserForm & { confirmPassword?: string; editPassword?: boolean }) | null;
  onChange: (v: UpdateUserForm & { confirmPassword?: string; editPassword?: boolean }) => void;
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

export default function UserEditDialog({
  open, value, onChange, loading, error, onCancel, onConfirm,
}: Props) {
  if (!value) return null;

  const roleOptions = [UserRole.COORDINATOR, UserRole.TEACHER];

  const editingPassword = !!value.editPassword;
  const senhaInvalida =
    editingPassword &&
    (!!value.password || !!value.confirmPassword) &&
    value.password !== value.confirmPassword;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2} sx={{ mt: 1 }}>
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
              label="Email"
              type="email"
              value={value.email || ""}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Papel</InputLabel>
              <Select
                label="Papel"
                value={value.role}
                onChange={(e) => onChange({ ...value, role: e.target.value as UserRole })}
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

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.active}
                  onChange={(e) => onChange({ ...value, active: e.target.checked })}
                />
              }
              label="Ativo"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.completed}
                  onChange={(e) => onChange({ ...value, completed: e.target.checked })}
                />
              }
              label="Cadastro completo"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={editingPassword}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChange({
                      ...value,
                      editPassword: checked,
                      password: checked ? value.password : "",
                      confirmPassword: checked ? value.confirmPassword : "",
                    });
                  }}
                />
              }
              label="Editar senha?"
            />
          </Grid>

          {editingPassword && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nova Senha"
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
                  value={value.confirmPassword ?? ""}
                  onChange={(e) => onChange({ ...value, confirmPassword: e.target.value })}
                />
              </Grid>
              {senhaInvalida && (
                <Grid item xs={12}>
                  <Alert severity="error">As senhas não coincidem.</Alert>
                </Grid>
              )}
            </>
          )}
        </Grid>

        {loading && (
          <Box textAlign="center" my={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading || senhaInvalida}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
