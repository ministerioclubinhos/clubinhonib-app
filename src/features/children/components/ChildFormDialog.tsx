import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Alert, Typography, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Stack, Skeleton, Box, FormHelperText
} from "@mui/material";
import { useSelector } from "react-redux";
import { UserRole } from "@/types/shared";
import { CreateChildForm, EditChildForm } from "../types";
import { apiFetchSimpleClubs } from "@/features/clubs/api";
import ClubAutocomplete from "@/features/clubs/components/form/ClubAutocomplete";
import { RootState } from "@/store/slices";
import { SimpleDatePicker, SimplePhoneInput } from "@/components/common/inputs";

type Props = {
  mode: "create" | "edit";
  open: boolean;
  value: CreateChildForm | EditChildForm | null;
  onChange: (v: CreateChildForm | EditChildForm) => void;
  onCancel: () => void;
  onSubmit: () => void;
  error: string;
  loading: boolean;
};

export default function ChildFormDialog({
  mode, open, value, onChange, onCancel, onSubmit, error, loading,
}: Props) {
  const isCreate = mode === "create";
  if (!value) return null;

  const user = useSelector((state: RootState) => state.auth.user);
  const isTeacher = user?.role === UserRole.TEACHER;
  const teacherClub = user?.teacherProfile?.club ?? null;
  const teacherClubId = teacherClub?.id ?? null;

  const setField = <K extends keyof (CreateChildForm & EditChildForm)>(key: K, val: any) =>
    onChange({ ...(value as any), [key]: val } as any);

  React.useEffect(() => {
    if (!isTeacher) return;
    if (!teacherClubId) return;
    if ((value as any).clubId !== teacherClubId) {
      setField("clubId", teacherClubId);
    }
  }, [isTeacher, teacherClubId]);

  const effectiveClubId = (value as any).clubId ?? null;

  const [clubOptions, setClubOptions] = React.useState<Array<{ id: string; detalhe: string; coordinator: boolean }>>([]);
  const [loadingClubDetail, setLoadingClubDetail] = React.useState(false);
  const [clubDetailErr, setClubDetailErr] = React.useState<string>("");

  React.useEffect(() => {
    if (!isTeacher) return;
    if (clubOptions.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingClubDetail(true);
        setClubDetailErr("");
        const items = await apiFetchSimpleClubs();
        if (!cancelled) setClubOptions(Array.isArray(items) ? items : []);
      } catch (e: any) {
        if (!cancelled) setClubDetailErr(e?.response?.data?.message || e?.message || "Falha ao carregar clubinhos");
      } finally {
        if (!cancelled) setLoadingClubDetail(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isTeacher]);

  const selectedClubDetail = React.useMemo(() => {
    if (!effectiveClubId) return null;
    const found = clubOptions.find(o => o.id === effectiveClubId);
    return found?.detalhe ?? null;
  }, [effectiveClubId, clubOptions]);

  const [showErrors, setShowErrors] = React.useState(false);

  const req = {
    name: !!(value as any).name?.trim(),
    gender: !!(value as any).gender,
    birthDate: !!(value as any).birthDate,
    guardianName: !!(value as any).guardianName?.trim(),
    district: !!(value as any).address?.district?.trim(),
    city: !!(value as any).address?.city?.trim(),
    state: !!(value as any).address?.state?.trim(),
    clubId: !!effectiveClubId,
  };

  const hasErrors = Object.values(req).some(v => !v);

  const handleSubmitClick = () => {
    setShowErrors(true);
    if (!hasErrors) onSubmit();
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isCreate ? "Cadastrar Criança" : "Editar Criança"}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nome (obrigatório)"
              value={(value as any).name ?? ""}
              onChange={(e) => setField("name", e.target.value)}
              error={showErrors && !req.name}
              helperText={showErrors && !req.name ? "Informe o nome" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth required error={showErrors && !req.gender}>
              <InputLabel>Gênero (obrigatório)</InputLabel>
              <Select
                label="Gênero (obrigatório)"
                value={(value as any).gender ?? ""}
                onChange={(e) => setField("gender", e.target.value)}
              >
                <MenuItem value="M">Menino</MenuItem>
                <MenuItem value="F">Menina</MenuItem>
              </Select>
              {showErrors && !req.gender && <FormHelperText>Selecione o gênero</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <SimpleDatePicker
              value={(value as any).birthDate ?? ""}
              onChange={(value) => setField("birthDate", value)}
              label="Nascimento (obrigatório)"
              required
              margin="none"
              error={showErrors && !req.birthDate}
              helperText={showErrors && !req.birthDate ? "Informe a data de nascimento" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Responsável (obrigatório)"
              value={(value as any).guardianName ?? ""}
              onChange={(e) => setField("guardianName", e.target.value)}
              error={showErrors && !req.guardianName}
              helperText={showErrors && !req.guardianName ? "Informe o responsável" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SimplePhoneInput
              value={(value as any).guardianPhone ?? ""}
              onChange={(value) => setField("guardianPhone", value)}
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <SimpleDatePicker
              value={(value as any).joinedAt ?? ""}
              onChange={(value) => setField("joinedAt", value || null)}
              label="No clubinho desde"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            {isTeacher ? (
              <Stack spacing={0.75}>
                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
                  Clubinho (obrigatório)
                </Typography>

                {loadingClubDetail ? (
                  <Skeleton variant="rounded" height={40} />
                ) : clubDetailErr ? (
                  <Alert severity="warning">{clubDetailErr}</Alert>
                ) : selectedClubDetail ? (
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: (showErrors && !req.clubId) ? "error.main" : "divider",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                    title={selectedClubDetail}
                  >
                    {selectedClubDetail}
                  </Box>
                ) : (
                  <Alert severity="info">Seu perfil não possui um club vinculado.</Alert>
                )}

                {showErrors && !req.clubId && (
                  <Typography variant="caption" color="error">
                    Selecione um Clubinho
                  </Typography>
                )}
              </Stack>
            ) : (
              <ClubAutocomplete
                value={effectiveClubId}
                onChange={(id) => setField("clubId", id)}
                required
                label="Clubinho (obrigatório)"
                errorText={showErrors && !req.clubId ? "Selecione um Clubinho" : undefined}
                fetchOnMount
              />
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Endereço</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rua"
              value={(value as any).address?.street ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, street: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Número"
              value={(value as any).address?.number ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, number: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              required
              label="Bairro (obrigatório)"
              value={(value as any).address?.district ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, district: e.target.value })}
              error={showErrors && !req.district}
              helperText={showErrors && !req.district ? "Informe o bairro" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Cidade (obrigatório)"
              value={(value as any).address?.city ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, city: e.target.value })}
              error={showErrors && !req.city}
              helperText={showErrors && !req.city ? "Informe a cidade" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="UF (obrigatório)"
              value={(value as any).address?.state ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, state: e.target.value })}
              error={showErrors && !req.state}
              helperText={showErrors && !req.state ? "Informe a UF" : undefined}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CEP"
              value={(value as any).address?.postalCode ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, postalCode: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Complemento"
              value={(value as any).address?.complement ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, complement: e.target.value })}
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
        <Button
          variant="contained"
          onClick={handleSubmitClick}
          disabled={loading}
        >
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
