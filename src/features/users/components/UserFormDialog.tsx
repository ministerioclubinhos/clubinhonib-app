import React, { useMemo } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";

import { SimplePhoneInput } from "@/components/common/inputs";
import { UserRole } from "@/types/shared";

import { USER_ASSIGNABLE_ROLES, USER_ROLE_LABELS } from "../constants";
import { validateUserForm } from "../utils";
import type { UserFormValues } from "../types";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: UserFormValues | null;
  onChange: (value: UserFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
};

/**
 * Cadastro e edição de usuário.
 *
 * Um formulário só para as duas operações: separados, os dois já haviam
 * divergido — a criação não pedia telefone válido e a edição não pedia papel.
 */
export default function UserFormDialog({
  mode,
  open,
  value,
  onChange,
  onCancel,
  onSubmit,
  loading,
  error,
}: Props) {
  const [showErrors, setShowErrors] = React.useState(false);
  const isCreate = mode === "create";

  const fieldErrors = useMemo(
    () => (value ? validateUserForm(value, mode) : {}),
    [value, mode],
  );
  const hasErrors = Object.keys(fieldErrors).length > 0;

  React.useEffect(() => {
    if (open) setShowErrors(false);
  }, [open]);

  if (!value) return null;

  const setField = <K extends keyof UserFormValues>(
    key: K,
    fieldValue: UserFormValues[K],
  ) => onChange({ ...value, [key]: fieldValue });

  const handleSubmit = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  };

  const errorOf = (key: keyof UserFormValues) =>
    showErrors ? fieldErrors[key] : undefined;

  const showPasswordFields = isCreate || value.editPassword;

  return (
    <Dialog
      open={open}
      // Fechar durante a gravação deixaria a tela sem saber o resultado.
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="user-form-title"
    >
      <DialogTitle id="user-form-title">
        {isCreate ? "Novo usuário" : "Editar usuário"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid2 container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Nome"
              value={value.name}
              onChange={(event) => setField("name", event.target.value)}
              error={!!errorOf("name")}
              helperText={errorOf("name")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              type="email"
              label="E-mail"
              value={value.email}
              onChange={(event) => setField("email", event.target.value)}
              error={!!errorOf("email")}
              helperText={errorOf("email")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <SimplePhoneInput
              value={value.phone}
              onChange={(phone) => setField("phone", phone)}
              margin="none"
              error={!!errorOf("phone")}
              helperText={errorOf("phone")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="user-form-role">Papel</InputLabel>
              <Select
                labelId="user-form-role"
                label="Papel"
                value={value.role}
                onChange={(event) =>
                  setField("role", event.target.value as UserRole)
                }
              >
                {USER_ASSIGNABLE_ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {USER_ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={value.active}
                  onChange={(event) =>
                    setField("active", event.target.checked)
                  }
                />
              }
              label="Ativo"
            />
          </Grid2>

          {!isCreate ? (
            <>
              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={value.completed}
                      onChange={(event) =>
                        setField("completed", event.target.checked)
                      }
                    />
                  }
                  label="Cadastro completo"
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={value.editPassword}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          editPassword: event.target.checked,
                          password: "",
                          confirmPassword: "",
                        })
                      }
                    />
                  }
                  label="Trocar senha"
                />
              </Grid2>
            </>
          ) : null}

          {showPasswordFields ? (
            <>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label={isCreate ? "Senha" : "Nova senha"}
                  autoComplete="new-password"
                  value={value.password}
                  onChange={(event) => setField("password", event.target.value)}
                  error={!!errorOf("password")}
                  helperText={errorOf("password")}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Confirmar senha"
                  autoComplete="new-password"
                  value={value.confirmPassword}
                  onChange={(event) =>
                    setField("confirmPassword", event.target.value)
                  }
                  error={!!errorOf("confirmPassword")}
                  helperText={errorOf("confirmPassword")}
                />
              </Grid2>
            </>
          ) : null}
        </Grid2>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Button type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
