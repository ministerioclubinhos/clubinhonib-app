import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";

import { SimpleDatePicker, SimplePhoneInput } from "@/components/common/inputs";
import ClubAutocomplete from "@/features/clubs/components/form/ClubAutocomplete";
import { UserRole } from "@/types/shared";
import type { RootState } from "@/store/slices";

import { GENDER_OPTIONS, Gender, STATE_LENGTH } from "../constants";
import { validateChildForm } from "../utils";
import type { ChildFormValues } from "../types";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: ChildFormValues | null;
  onChange: (value: ChildFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
};

/**
 * Cadastro e edição de criança.
 *
 * Todos os ganchos ficam antes de qualquer retorno: a versão anterior chamava
 * `useSelector` e `useEffect` depois de um `return null`, o que quebra a ordem
 * dos ganchos entre renderizações.
 */
export default function ChildFormDialog({
  mode,
  open,
  value,
  onChange,
  onCancel,
  onSubmit,
  error,
  loading,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showErrors, setShowErrors] = useState(false);

  const teacherClubId = useSelector(
    (state: RootState) => state.auth.user?.teacherProfile?.club?.id ?? null,
  );
  const role = useSelector((state: RootState) => state.auth.user?.role);

  /**
   * O professor cuida da turma dele: edita a criança, mas não a move nem a
   * desvincula. O campo fica visível — saber em que clubinho a criança está é
   * parte da ficha — e travado. A API recusa a mudança de qualquer forma.
   *
   * O coordenador continua escolhendo: a rota de opções já devolve a ele
   * apenas os clubinhos que coordena.
   */
  const clubLocked = role === UserRole.TEACHER;

  const isCreate = mode === "create";

  const fieldErrors = useMemo(
    // Sem clubinho, só o administrador cadastra; a API recusa do mesmo jeito.
    () =>
      value
        ? validateChildForm(value, {
            requireClub: isCreate && role !== UserRole.ADMIN,
          })
        : {},
    [value, isCreate, role],
  );
  const hasErrors = Object.keys(fieldErrors).length > 0;

  useEffect(() => {
    if (open) setShowErrors(false);
  }, [open]);

  // Um professor cadastra para a própria turma; sugerir o clubinho dele evita
  // que a criança nasça sem vínculo.
  useEffect(() => {
    if (!open || !isCreate || !teacherClubId) return;
    if (!value || value.clubId) return;

    onChange({ ...value, clubId: teacherClubId });
  }, [open, isCreate, teacherClubId, value, onChange]);

  if (!value) return null;

  const setField = <K extends keyof ChildFormValues>(
    key: K,
    fieldValue: ChildFormValues[K],
  ) => onChange({ ...value, [key]: fieldValue });

  const errorOf = (key: keyof ChildFormValues) =>
    showErrors ? fieldErrors[key] : undefined;

  const handleSubmit = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  };

  return (
    <Dialog data-testid="children-child-form-dialog"
      open={open}
      // Fechar durante a gravação deixaria a tela sem saber o resultado.
      onClose={loading ? undefined : onCancel}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="child-form-title"
    >
      <DialogTitle id="child-form-title">
        {isCreate ? "Cadastrar criança" : "Editar criança"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Grid2 container spacing={{ xs: 1.5, md: 2 }}>
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

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth required error={!!errorOf("gender")}>
              <InputLabel id="child-form-gender">Sexo</InputLabel>
              <Select
                labelId="child-form-gender"
                label="Sexo"
                value={value.gender}
                onChange={(event) =>
                  setField("gender", event.target.value as Gender)
                }
              >
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errorOf("gender") ? (
                <FormHelperText>{errorOf("gender")}</FormHelperText>
              ) : null}
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SimpleDatePicker
              label="Nascimento"
              required
              margin="none"
              value={value.birthDate}
              onChange={(date) => setField("birthDate", date)}
              error={!!errorOf("birthDate")}
              helperText={errorOf("birthDate")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Responsável"
              value={value.guardianName}
              onChange={(event) =>
                setField("guardianName", event.target.value)
              }
              error={!!errorOf("guardianName")}
              helperText={errorOf("guardianName")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <SimplePhoneInput
              value={value.guardianPhone}
              onChange={(phone) => setField("guardianPhone", phone)}
              margin="none"
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <SimpleDatePicker
              label="No clubinho desde"
              margin="none"
              value={value.joinedAt}
              onChange={(date) => setField("joinedAt", date ?? "")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <ClubAutocomplete
              value={value.clubId}
              onChange={(clubId) => setField("clubId", clubId)}
              label="Clubinho"
              disabled={clubLocked}
              errorText={showErrors ? fieldErrors.clubId : undefined}
              helperText={
                clubLocked
                  ? "Para transferir a criança, fale com a coordenação."
                  : undefined
              }
              fetchOnMount
            />
          </Grid2>

          <Grid2 size={12}>
            <Typography variant="subtitle1" fontWeight={700}>
              Endereço
            </Typography>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Rua"
              value={value.street}
              onChange={(event) => setField("street", event.target.value)}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Número"
              value={value.number}
              onChange={(event) => setField("number", event.target.value)}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              required
              label="Bairro"
              value={value.district}
              onChange={(event) => setField("district", event.target.value)}
              error={!!errorOf("district")}
              helperText={errorOf("district")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              label="Cidade"
              value={value.city}
              onChange={(event) => setField("city", event.target.value)}
              error={!!errorOf("city")}
              helperText={errorOf("city")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              required
              label="UF"
              value={value.state}
              onChange={(event) =>
                setField(
                  "state",
                  event.target.value.toUpperCase().slice(0, STATE_LENGTH),
                )
              }
              error={!!errorOf("state")}
              helperText={errorOf("state")}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="CEP"
              value={value.postalCode}
              onChange={(event) => setField("postalCode", event.target.value)}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              fullWidth
              label="Complemento"
              value={value.complement}
              onChange={(event) => setField("complement", event.target.value)}
            />
          </Grid2>
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
          {isCreate ? "Cadastrar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
