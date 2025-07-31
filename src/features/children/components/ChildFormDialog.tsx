// src/modules/children/components/ChildFormDialog.tsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, Alert, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { CreateChildForm, EditChildForm } from "../types";
import ClubAutocomplete from "@/features/clubs/components/form/ClubAutocomplete";

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

  const setField = <K extends keyof (CreateChildForm & EditChildForm)>(key: K, val: any) =>
    onChange({ ...(value as any), [key]: val } as any);

  // ✅ Regra: clube é obrigatório
  const clubMissing = !(value as any).clubId;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{isCreate ? "Cadastrar Criança" : "Editar Criança"}</DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nome"
              value={(value as any).name ?? ""}
              onChange={(e) => setField("name", e.target.value)} />
          </Grid>

          {/* Gênero */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Gênero</InputLabel>
              <Select
                label="Gênero"
                value={(value as any).gender ?? ""}
                onChange={(e) => setField("gender", e.target.value)}
              >
                <MenuItem value="M">Menino</MenuItem>
                <MenuItem value="F">Menina</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Nascimento" type="date" InputLabelProps={{ shrink: true }}
              value={(value as any).birthDate ?? ""}
              onChange={(e) => setField("birthDate", e.target.value)} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Responsável"
              value={(value as any).guardianName ?? ""}
              onChange={(e) => setField("guardianName", e.target.value)} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Telefone"
              value={(value as any).guardianPhone ?? ""}
              onChange={(e) => setField("guardianPhone", e.target.value)} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="No clubinho desde" type="date" InputLabelProps={{ shrink: true }}
              value={(value as any).joinedAt ?? ""}
              onChange={(e) => setField("joinedAt", e.target.value || null)} />
          </Grid>

          {/* Clube — OBRIGATÓRIO */}
          <Grid item xs={12} md={6}>
            <ClubAutocomplete
              value={(value as any).clubId ?? null}
              onChange={(id) => setField("clubId", id)}
              helperText="Selecione um Clubinho"
              required
              errorText={clubMissing ? "Selecione um Clubinho" : undefined}
              fetchOnMount
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700}>Endereço</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Rua"
              value={(value as any).address?.street ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, street: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Número"
              value={(value as any).address?.number ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, number: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Bairro"
              value={(value as any).address?.district ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, district: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Cidade"
              value={(value as any).address?.city ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, city: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="UF"
              value={(value as any).address?.state ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, state: e.target.value })} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth label="CEP"
              value={(value as any).address?.postalCode ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, postalCode: e.target.value })} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Complemento"
              value={(value as any).address?.complement ?? ""}
              onChange={(e) => setField("address", { ...(value as any).address, complement: e.target.value })} />
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
          onClick={onSubmit}
          disabled={loading || clubMissing} // ✅ bloqueia submit sem clube
        >
          {isCreate ? "Criar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
