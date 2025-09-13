import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider,
  Typography, Alert, TextField, MenuItem, FormControl, InputLabel, Select
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import AddressFields from "./form/AddressFields";
import CoordinatorSelect from "./form/CoordinatorSelect";
import TeachersSelect from "./form/TeachersSelect";
import {
  CoordinatorOption, CreateClubForm, EditClubForm, TeacherOption,
  Weekday, WEEKDAYS
} from "../types";
import { useSelector } from "react-redux";
import { selectIsAdmin } from "@/store/selectors/routeSelectors";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: CreateClubForm | EditClubForm | null;
  onChange: (val: CreateClubForm | EditClubForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
  coordinatorOptions: CoordinatorOption[];
  teacherOptions: TeacherOption[];
};

export default function ClubFormDialog({
  mode, open, value, onChange, onCancel, onSubmit,
  error, loading, coordinatorOptions, teacherOptions,
}: Props) {

  const teachersKey = React.useMemo(
  () => (teacherOptions ?? []).map(t => `${t.teacherProfileId}:${t.vinculado?1:0}`).join("|"),
  [teacherOptions]
);

  const isAdmin = useSelector(selectIsAdmin);
  const isCreate = mode === "create";
  if (!value) return null;

  const teachers = (value as any).teacherProfileIds ?? [];
  const coord = (value as any).coordinatorProfileId ?? null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isCreate ? "Criar Clubinho" : "Editar Clubinho"}</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}



        <Grid container spacing={2}>
          {isAdmin && (
            <Grid item xs={12} md={3}>
              <TextField
                label="Número"
                type="text"
                fullWidth
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={(value as any).number ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const onlyDigits = raw.replace(/\D/g, "");
                  const parsed = onlyDigits ? Number(onlyDigits) : undefined;
                  onChange({ ...value, number: parsed } as any);
                }}
              />
            </Grid>
          )}


          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel>Dia da semana</InputLabel>
              <Select
                label="Dia da semana"
                value={(value as any).weekday ?? "saturday"}
                onChange={(e) => onChange({ ...value, weekday: e.target.value as Weekday } as any)}
              >
                {WEEKDAYS.map((w) => (
                  <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {isAdmin && (
            <Grid item xs={12} md={4}>
              <CoordinatorSelect
                value={coord}
                options={coordinatorOptions}
                onChange={(val) => onChange({ ...value, coordinatorProfileId: val } as any)}
              />
            </Grid>
          )}

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Endereço</Typography>
          </Grid>
          <AddressFields
            value={(value as any).address ?? {}}
            onChange={(addr) => onChange({ ...value, address: addr } as any)}
          />

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Professores</Typography>
          </Grid>
          <Grid item xs={12}>
<TeachersSelect
  key={teachersKey}
  value={teachers}
  options={teacherOptions}
  onChange={(ids) => onChange({ ...value, teacherProfileIds: ids } as any)}
/>
          </Grid>
        </Grid>

        {loading && (
          <Typography align="center" sx={{ mt: 2 }}>
            <CircularProgress size={24} />
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }}>Cancelar</Button>
        <Button variant="contained" onClick={onSubmit} disabled={loading}>
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
