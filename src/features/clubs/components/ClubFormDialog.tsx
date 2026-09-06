import React from "react";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
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

import { selectIsAdmin } from "@/store/selectors/routeSelectors";
import type { RootState } from "@/store/slices";
import { clubLinkPermissionsOf } from "@/utils/clubLinkPermissions";

import AddressFields from "./form/AddressFields";
import CoordinatorSelect from "./form/CoordinatorSelect";
import TeachersSelect from "./form/TeachersSelect";
import { WEEKDAY_OPTIONS } from "../constants";
import { validateClubForm } from "../utils";
import type {
  ClubFormValues,
  CoordinatorOption,
  TeacherOption,
  Weekday,
} from "../types";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: ClubFormValues | null;
  onChange: (value: ClubFormValues) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
  coordinatorOptions: CoordinatorOption[];
  teacherOptions: TeacherOption[];
  /** Clubinhos que quem está editando alcança; limita de onde trazer professor. */
  reachableClubIds?: Set<string>;
  /** O clubinho sendo editado; nulo na criação. */
  clubId?: string | null;
  /** Coordenador que o clubinho tinha ao abrir o formulário. */
  initialCoordinatorProfileId?: string | null;
};

export default function ClubFormDialog({
  mode,
  open,
  value,
  onChange,
  onCancel,
  onSubmit,
  error,
  loading,
  coordinatorOptions,
  teacherOptions,
  reachableClubIds,
  clubId = null,
  initialCoordinatorProfileId = null,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const permissions = clubLinkPermissionsOf(role);
  const isAdmin = useSelector(selectIsAdmin);

  /**
   * Quem sai do clubinho quando a escolha muda. Trocar o coordinador aqui é uma
   * edição visível, mas o nome de quem perde a turma precisa estar à vista.
   */
  const replacedCoordinatorName = React.useMemo(() => {
    const current = initialCoordinatorProfileId;
    if (!current || current === value?.coordinatorProfileId) return undefined;

    const name = coordinatorOptions.find(
      (option) => option.coordinatorProfileId === current,
    )?.name;

    return name ? `Substitui ${name} na coordenação deste clubinho.` : undefined;
  }, [initialCoordinatorProfileId, value?.coordinatorProfileId, coordinatorOptions]);
  const isCreate = mode === "create";

  const teachersKey = React.useMemo(
    () =>
      (teacherOptions ?? [])
        .map((t) => `${t.teacherProfileId}:${t.vinculado ? 1 : 0}`)
        .join("|"),
    [teacherOptions],
  );

  const fieldErrors = React.useMemo(
    () => (value ? validateClubForm(value) : {}),
    [value],
  );

  if (!value) return null;

  const patch = (changes: Partial<ClubFormValues>) =>
    onChange({ ...value, ...changes });

  const canSubmit = Object.keys(fieldErrors).length === 0 && !loading;

  return (
    // No celular o formulário ocupa a tela inteira: são muitos campos, e a
    // caixa estreita deixava o teclado cobrindo metade deles.
    <Dialog data-testid="clubs-club-form-dialog"
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      fullScreen={isXs}
    >
      <DialogTitle>{isCreate ? "Criar Clubinho" : "Editar Clubinho"}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid2 container spacing={2}>
          {isAdmin && (
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                label="Número"
                type="text"
                fullWidth
                slotProps={{
                  htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                }}
                value={value.number ?? ""}
                error={Boolean(fieldErrors.number)}
                helperText={fieldErrors.number}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  patch({ number: digits ? Number(digits) : null });
                }}
              />
            </Grid2>
          )}

          <Grid2 size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth>
              <InputLabel id="club-weekday-label">Dia da semana</InputLabel>
              <Select
                labelId="club-weekday-label"
                label="Dia da semana"
                value={value.weekday}
                onChange={(e) => patch({ weekday: e.target.value as Weekday })}
              >
                {WEEKDAY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              label="Horário"
              type="time"
              fullWidth
              slotProps={{ htmlInput: { step: 60 } }}
              value={value.time ?? ""}
              error={Boolean(fieldErrors.time)}
              helperText={fieldErrors.time ?? "0:00 a 23:59"}
              onChange={(e) => patch({ time: e.target.value || null })}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.isActive}
                  onChange={(e) => patch({ isActive: e.target.checked })}
                />
              }
              label="Ativo"
            />
          </Grid2>

          {/* Definir o coordenador é atributo do clubinho, e o valor atual está
              à vista — por isso a troca acontece aqui, enquanto a tela de
              coordenadores recusa: lá o dono atual não aparece. */}
          {permissions.canManageCoordinatorLinks && (
            <Grid2 size={12}>
              <CoordinatorSelect
                value={value.coordinatorProfileId}
                options={coordinatorOptions}
                onChange={(coordinatorProfileId) => patch({ coordinatorProfileId })}
                helperText={replacedCoordinatorName}
              />
            </Grid2>
          )}

          <Grid2 size={12}>
            <Divider />
          </Grid2>

          <Grid2 size={12}>
            <Typography variant="subtitle1" fontWeight={700}>
              Endereço
            </Typography>
          </Grid2>

          <AddressFields
            value={value.address}
            onChange={(address) => patch({ address })}
          />

          <Grid2 size={12}>
            <Divider />
          </Grid2>

          <Grid2 size={12}>
            <Typography variant="subtitle1" fontWeight={700}>
              Professores
            </Typography>
          </Grid2>

          <Grid2 size={12}>
            <TeachersSelect
              key={teachersKey}
              value={value.teacherProfileIds}
              options={teacherOptions}
              reachableClubIds={reachableClubIds}
              currentClubId={clubId}
              onChange={(teacherProfileIds) => patch({ teacherProfileIds })}
            />
          </Grid2>
        </Grid2>

        {loading && (
          <Typography align="center" sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 1.5 },
          gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button
          onClick={onCancel}
          fullWidth={isXs}
          size={isXs ? "large" : "medium"}
          sx={{ color: "text.secondary" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!canSubmit}
          fullWidth={isXs}
          size={isXs ? "large" : "medium"}
        >
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
