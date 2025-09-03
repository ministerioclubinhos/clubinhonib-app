import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert } from "@mui/material";
import { UserRow } from "../types";
import { fmtDate } from "@/utils/dates";
import { SENSITIVE_KEYS } from "../utils";

type Props = { open: boolean; user: UserRow | null; onClose: () => void; };

export default function UserViewDialog({ open, user, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Detalhes do Usuário</DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        {!!user && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {Object.entries(user)
              .filter(([k]) => !SENSITIVE_KEYS.has(k))
              .map(([k, v]) => (
                <Box key={k}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography>
                    {k === "createdAt" || k === "updatedAt" ? fmtDate(String(v)) : String(v ?? "—")}
                  </Typography>
                </Box>
              ))}
            <Alert severity="warning" sx={{ gridColumn: "1 / -1" }}>
              Campos sensíveis (senha, refreshToken) ocultados por segurança.
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
}
