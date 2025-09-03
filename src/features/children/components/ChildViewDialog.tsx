// src/modules/children/components/ChildViewDialog.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Paper, Typography, Box, Chip, Skeleton } from "@mui/material";
import { ChildResponseDto } from "../types";

type Props = { open: boolean; loading: boolean; child: ChildResponseDto | null; onClose: () => void; };
const L = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1">{value ?? "—"}</Typography>
  </Box>
);

export default function ChildViewDialog({ open, loading, child, onClose }: Props) {
  const addr = child?.address;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{child ? child.name : "Detalhes da Criança"}</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {loading && !child ? (
          <Skeleton height={200} />
        ) : child && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><L label="Nome" value={child.name} /></Grid>
            <Grid item xs={12} md={3}><L label="Nascimento" value={child.birthDate} /></Grid>
            <Grid item xs={12} md={3}><L label="No clube desde" value={child.joinedAt ?? "—"} /></Grid>

            <Grid item xs={12} md={6}><L label="Responsável" value={child.guardianName} /></Grid>
            <Grid item xs={12} md={6}><L label="Telefone" value={child.guardianPhone} /></Grid>

            <Grid item xs={12} md={6}><L label="Clube" value={child.club ? `#${child.club.number}` : <Chip size="small" label="—" />} /></Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Endereço</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}><L label="Rua" value={addr?.street} /></Grid>
                  <Grid item xs={12} md={6}><L label="Número" value={addr?.number} /></Grid>
                  <Grid item xs={12} md={4}><L label="Bairro" value={addr?.district} /></Grid>
                  <Grid item xs={12} md={4}><L label="Cidade" value={addr?.city} /></Grid>
                  <Grid item xs={12} md={4}><L label="UF" value={addr?.state} /></Grid>
                  <Grid item xs={12} md={4}><L label="CEP" value={addr?.postalCode} /></Grid>
                  <Grid item xs={12} md={8}><L label="Complemento" value={addr?.complement} /></Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose} variant="contained">Fechar</Button></DialogActions>
    </Dialog>
  );
}
